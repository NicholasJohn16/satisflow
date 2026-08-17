const getInputHandleId = (nodeId, index) => `${nodeId}__input_${index}`;

const getOutputHandleId = (nodeId, resource) => `${nodeId}__output_${resource}`;

const getResourceFromSourceHandle = (node, handleId) => {
    if (!node || !handleId) return null;

    return Object.keys(node.data?.products ?? {}).find((resource) => (
        handleId === getOutputHandleId(node.id, resource)
        // Keep connections made with the original handle IDs readable.
        || handleId === `${node.id}_${resource}`
    )) ?? null;
};

const getEdgeResource = (edge, getNode) => {
    const storedResource = edge.data?.resource
        ?? edge.data?.item?.className
        ?? edge.data?.item?.name;

    if (storedResource) return storedResource;
    return getResourceFromSourceHandle(getNode?.(edge.source), edge.sourceHandle);
};

const getInputAssignments = (nodeId, ingredients, edges, getNode) => {
    const resources = Object.keys(ingredients);
    const acceptedResources = new Set(resources);
    const connectedByHandle = new Map();
    const connectedResources = new Set();

    edges.forEach((edge) => {
        if (edge.target !== nodeId || !edge.targetHandle) return;

        const resource = getEdgeResource(edge, getNode);
        if (!acceptedResources.has(resource) || connectedResources.has(resource)) return;

        connectedByHandle.set(edge.targetHandle, resource);
        connectedResources.add(resource);
    });

    const remainingResources = resources.filter((resource) => !connectedResources.has(resource));

    return resources.map((defaultResource, index) => {
        const handleId = getInputHandleId(nodeId, index);
        const connectedResource = connectedByHandle.get(handleId);
        const resource = connectedResource ?? remainingResources.shift() ?? defaultResource;

        return {
            amount: ingredients[resource],
            connected: Boolean(connectedResource),
            handleId,
            resource,
        };
    });
};

const getNodeProductionRatio = (
    nodeId,
    ingredients,
    edges,
    allocations,
    getNode,
) => {
    const requiredIngredients = Object.entries(ingredients ?? {})
        .map(([resource, amount]) => [resource, Number(amount)])
        .filter(([, amount]) => amount > 0);

    if (!requiredIngredients.length) return 1;

    const incomingEdges = edges.filter((edge) => edge.target === nodeId);
    if (!incomingEdges.length) return 1;

    const incomingByResource = new Map();
    incomingEdges.forEach((edge) => {
        const resource = getEdgeResource(edge, getNode);
        if (!Object.hasOwn(ingredients, resource)) return;

        incomingByResource.set(
            resource,
            (incomingByResource.get(resource) ?? 0) + (allocations.get(edge.id) ?? 0),
        );
    });

    return requiredIngredients.reduce((ratio, [resource, requiredAmount]) => {
        // Inputs without a connection are treated as externally supplied.
        // Once connected, the actual incoming flow limits production.
        const suppliedRatio = incomingByResource.has(resource)
            ? incomingByResource.get(resource) / requiredAmount
            : 1;

        return Math.min(ratio, suppliedRatio);
    }, 1);
};

const allocateResourceFlow = (nodes, edges, productionRatios) => {
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const getNode = (id) => nodeById.get(id);
    const allocations = new Map(edges.map((edge) => [edge.id, 0]));

    const flowEdges = edges.map((edge) => {
        const resource = getEdgeResource(edge, getNode);
        const sourceNode = getNode(edge.source);
        const targetNode = getNode(edge.target);
        const productionRatio = productionRatios.get(sourceNode?.id) ?? 0;
        const supply = Number(sourceNode?.data?.products?.[resource] ?? 0)
            * productionRatio;
        const demand = Number(targetNode?.data?.ingredients?.[resource] ?? 0);

        if (!edge.id || !resource || supply <= 0 || demand <= 0) return null;

        return {
            ...edge,
            demand,
            resource,
            sourceKey: `${edge.source}::${resource}`,
            supply,
            targetKey: `${edge.target}::${resource}`,
        };
    }).filter(Boolean);

    const remainingSupply = new Map();
    const remainingDemand = new Map();

    flowEdges.forEach(({sourceKey, supply, targetKey, demand}) => {
        if (!remainingSupply.has(sourceKey)) remainingSupply.set(sourceKey, supply);
        if (!remainingDemand.has(targetKey)) remainingDemand.set(targetKey, demand);
    });

    const epsilon = 1e-9;
    const maxIterations = (flowEdges.length * 2) + 1;

    for (let iteration = 0; iteration < maxIterations; iteration += 1) {
        const activeEdges = flowEdges.filter(({sourceKey, targetKey}) => (
            remainingSupply.get(sourceKey) > epsilon
            && remainingDemand.get(targetKey) > epsilon
        ));

        if (!activeEdges.length) break;

        const outgoingCounts = new Map();
        activeEdges.forEach(({sourceKey}) => {
            outgoingCounts.set(sourceKey, (outgoingCounts.get(sourceKey) ?? 0) + 1);
        });

        const proposals = new Map();
        const proposedByTarget = new Map();
        activeEdges.forEach((edge) => {
            const proposal = remainingSupply.get(edge.sourceKey)
                / outgoingCounts.get(edge.sourceKey);
            proposals.set(edge.id, proposal);
            proposedByTarget.set(
                edge.targetKey,
                (proposedByTarget.get(edge.targetKey) ?? 0) + proposal,
            );
        });

        const spentBySource = new Map();
        const receivedByTarget = new Map();

        activeEdges.forEach((edge) => {
            const targetScale = Math.min(
                1,
                remainingDemand.get(edge.targetKey) / proposedByTarget.get(edge.targetKey),
            );
            const amount = proposals.get(edge.id) * targetScale;

            allocations.set(edge.id, allocations.get(edge.id) + amount);
            spentBySource.set(
                edge.sourceKey,
                (spentBySource.get(edge.sourceKey) ?? 0) + amount,
            );
            receivedByTarget.set(
                edge.targetKey,
                (receivedByTarget.get(edge.targetKey) ?? 0) + amount,
            );
        });

        spentBySource.forEach((spent, sourceKey) => {
            remainingSupply.set(sourceKey, remainingSupply.get(sourceKey) - spent);
        });
        receivedByTarget.forEach((received, targetKey) => {
            remainingDemand.set(targetKey, remainingDemand.get(targetKey) - received);
        });
    }

    allocations.forEach((amount, edgeId) => {
        allocations.set(edgeId, Math.round(amount * 1e10) / 1e10);
    });

    return allocations;
};

const getResourceAllocations = (nodes, edges) => {
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const getNode = (id) => nodeById.get(id);
    let productionRatios = new Map(nodes.map((node) => {
        const hasRequiredInputs = Object.values(node.data?.ingredients ?? {})
            .some((amount) => Number(amount) > 0);

        return [node.id, hasRequiredInputs ? 0 : 1];
    }));
    let allocations = new Map(edges.map((edge) => [edge.id, 0]));
    const epsilon = 1e-9;
    const maxIterations = Math.max(50, nodes.length + 2);

    for (let iteration = 0; iteration < maxIterations; iteration += 1) {
        allocations = allocateResourceFlow(nodes, edges, productionRatios);

        let largestChange = 0;
        const nextProductionRatios = new Map(nodes.map((node) => {
            const ratio = getNodeProductionRatio(
                node.id,
                node.data?.ingredients,
                edges,
                allocations,
                getNode,
            );
            largestChange = Math.max(
                largestChange,
                Math.abs(ratio - (productionRatios.get(node.id) ?? 0)),
            );

            return [node.id, ratio];
        }));

        productionRatios = nextProductionRatios;
        if (largestChange <= epsilon) break;
    }

    return allocations;
};

const getInputFulfillment = (nodeId, handleId, requiredAmount, edges, allocations) => {
    const incomingAmount = edges.reduce((total, edge) => {
        if (edge.target !== nodeId || edge.targetHandle !== handleId) return total;
        return total + (allocations.get(edge.id) ?? 0);
    }, 0);
    const required = Number(requiredAmount);
    const ratio = required > 0 ? Math.min(Math.max(incomingAmount / required, 0), 1) : 0;

    return {
        incomingAmount: Math.round(incomingAmount * 1e10) / 1e10,
        ratio,
    };
};

const getOutputFulfillment = (nodeId, handleId, producedAmount, edges, allocations) => {
    const outgoingAmount = edges.reduce((total, edge) => {
        if (edge.source !== nodeId || edge.sourceHandle !== handleId) return total;
        return total + (allocations.get(edge.id) ?? 0);
    }, 0);
    const produced = Number(producedAmount);
    const ratio = produced > 0 ? Math.min(Math.max(outgoingAmount / produced, 0), 1) : 0;

    return {
        outgoingAmount: Math.round(outgoingAmount * 1e10) / 1e10,
        ratio,
    };
};

const getResourceSummary = (nodes, edges) => {
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const getNode = (id) => nodeById.get(id);
    const allocations = getResourceAllocations(nodes, edges);
    const inputs = new Map();
    const outputs = new Map();
    const allConsumed = new Map();
    const allProduced = new Map();
    let powerConsumed = 0;
    let powerProduced = 0;
    const addAmount = (totals, resource, amount) => {
        if (amount <= 1e-9) return;
        totals.set(resource, (totals.get(resource) ?? 0) + amount);
    };

    nodes.forEach((node) => {
        const productionRatio = getNodeProductionRatio(
            node.id,
            node.data?.ingredients,
            edges,
            allocations,
            getNode,
        );
        const energyUsage = Number(
            node.data?.energyUsage ?? node.data?.powerConsumption ?? 0,
        );
        const energyProduction = Number(
            node.data?.energyProduction ?? node.data?.powerProduction ?? 0,
        );

        if (Number.isFinite(energyUsage)) {
            if (energyUsage >= 0) powerConsumed += energyUsage;
            else powerProduced += Math.abs(energyUsage) * productionRatio;
        }
        if (Number.isFinite(energyProduction) && energyProduction > 0) {
            powerProduced += energyProduction * productionRatio;
        }

        Object.entries(node.data?.ingredients ?? {}).forEach(([resource, amount]) => {
            addAmount(allConsumed, resource, Number(amount) * productionRatio);
            const received = edges.reduce((total, edge) => {
                if (edge.target !== node.id || getEdgeResource(edge, getNode) !== resource) {
                    return total;
                }
                return total + (allocations.get(edge.id) ?? 0);
            }, 0);

            addAmount(inputs, resource, Math.max(Number(amount) - received, 0));
        });

        Object.entries(node.data?.products ?? {}).forEach(([resource, amount]) => {
            const produced = Number(amount) * productionRatio;
            addAmount(allProduced, resource, produced);
            const consumed = edges.reduce((total, edge) => {
                if (edge.source !== node.id || getEdgeResource(edge, getNode) !== resource) {
                    return total;
                }
                return total + (allocations.get(edge.id) ?? 0);
            }, 0);

            addAmount(outputs, resource, Math.max(produced - consumed, 0));
        });
    });

    [allConsumed, allProduced, inputs, outputs].forEach((totals) => {
        totals.forEach((amount, resource) => {
            totals.set(resource, Math.round(amount * 1e10) / 1e10);
        });
    });

    return {
        consumed: allConsumed,
        inputs,
        outputs,
        powerConsumed: Math.round(powerConsumed * 1e10) / 1e10,
        powerProduced: Math.round(powerProduced * 1e10) / 1e10,
        produced: allProduced,
    };
};

const getFulfillmentColor = (ratio) => {
    const normalizedRatio = Math.min(Math.max(Number(ratio) || 0, 0), 1);
    return `hsl(${Math.round(normalizedRatio * 120)} 85% 40%)`;
};

const isResourceConnectionValid = (connection, getNode, edges) => {
    const sourceNode = getNode(connection.source);
    const targetNode = getNode(connection.target);
    const resource = getResourceFromSourceHandle(sourceNode, connection.sourceHandle);

    if (!resource || !targetNode || !Object.hasOwn(targetNode.data?.ingredients ?? {}, resource)) {
        return false;
    }

    const targetHandleIds = Object.keys(targetNode.data.ingredients).map((_, index) => (
        getInputHandleId(targetNode.id, index)
    ));

    if (!targetHandleIds.includes(connection.targetHandle)) return false;

    return edges.every((edge) => {
        if (edge.target !== connection.target) return true;

        const edgeResource = getEdgeResource(edge, getNode);

        // A slot may aggregate several producers, but they must all provide
        // that slot's resource.
        if (edge.targetHandle === connection.targetHandle) {
            return edgeResource === resource;
        }

        // Keep each resource assigned to exactly one input slot.
        return edgeResource !== resource;
    });
};

export {
    getEdgeResource,
    getFulfillmentColor,
    getInputAssignments,
    getInputFulfillment,
    getNodeProductionRatio,
    getResourceAllocations,
    getInputHandleId,
    getOutputFulfillment,
    getOutputHandleId,
    getResourceSummary,
    getResourceFromSourceHandle,
    isResourceConnectionValid,
};
