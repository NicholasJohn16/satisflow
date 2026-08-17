const DEFAULT_NODE_SIZE = 100;
const NODE_PADDING = 24;

const getNodeSize = (node) => ({
    height: Number(node.measured?.height ?? node.height) || DEFAULT_NODE_SIZE,
    width: Number(node.measured?.width ?? node.width) || DEFAULT_NODE_SIZE,
});

const getNodeTopLeft = (node) => {
    const { height, width } = getNodeSize(node);
    const [originX = 0, originY = 0] = node.origin ?? [];

    return {
        x: node.position.x - width * originX,
        y: node.position.y - height * originY,
    };
};

const isLayoutLocked = (node) => (
    node.type === 'resourceNode' && node.data?.layoutLocked === true
);

const getDesiredEdgeLength = (sourceNode, targetNode) => {
    const sourceSize = getNodeSize(sourceNode);
    const targetSize = getNodeSize(targetNode);

    return Math.max(
        160,
        (Math.max(sourceSize.width, sourceSize.height)
            + Math.max(targetSize.width, targetSize.height)) / 2 + 80,
    );
};

const createElkGraph = (nodes, edges) => {
    const nodeLookup = new Map(nodes.map((node) => [node.id, node]));

    return {
        id: 'satisflow-layout',
        layoutOptions: {
            'elk.algorithm': 'stress',
            'elk.interactive': 'true',
            'elk.separateConnectedComponents': 'false',
            'elk.stress.desiredEdgeLength': '200',
            'elk.stress.epsilon': '0.001',
            'elk.stress.iterationLimit': '500',
        },
        children: nodes.map((node) => {
            const { height, width } = getNodeSize(node);
            const { x, y } = getNodeTopLeft(node);

            return {
                id: node.id,
                height,
                width,
                x,
                y,
                ...(isLayoutLocked(node) && {
                    layoutOptions: { 'elk.stress.fixed': 'true' },
                }),
            };
        }),
        edges: edges.flatMap((edge) => {
            const sourceNode = nodeLookup.get(edge.source);
            const targetNode = nodeLookup.get(edge.target);

            if (!sourceNode || !targetNode) return [];

            return [{
                id: edge.id,
                sources: [edge.source],
                targets: [edge.target],
                layoutOptions: {
                    'elk.stress.desiredEdgeLength': String(
                        getDesiredEdgeLength(sourceNode, targetNode),
                    ),
                },
            }];
        }),
    };
};

const resolveOverlaps = (layoutNodes, lockedIds, padding = NODE_PADDING) => {
    const nodes = layoutNodes.map((node) => ({
        ...node,
        x: Number(node.x) || 0,
        y: Number(node.y) || 0,
    }));

    for (let iteration = 0; iteration < 80; iteration += 1) {
        let foundOverlap = false;

        for (let firstIndex = 0; firstIndex < nodes.length; firstIndex += 1) {
            for (let secondIndex = firstIndex + 1; secondIndex < nodes.length; secondIndex += 1) {
                const first = nodes[firstIndex];
                const second = nodes[secondIndex];
                const firstLocked = lockedIds.has(first.id);
                const secondLocked = lockedIds.has(second.id);

                if (firstLocked && secondLocked) continue;

                const firstCenterX = first.x + first.width / 2;
                const firstCenterY = first.y + first.height / 2;
                const secondCenterX = second.x + second.width / 2;
                const secondCenterY = second.y + second.height / 2;
                const deltaX = secondCenterX - firstCenterX;
                const deltaY = secondCenterY - firstCenterY;
                const overlapX = (first.width + second.width) / 2
                    + padding - Math.abs(deltaX);
                const overlapY = (first.height + second.height) / 2
                    + padding - Math.abs(deltaY);

                if (overlapX <= 0 || overlapY <= 0) continue;

                foundOverlap = true;
                const useHorizontalAxis = overlapX <= overlapY;
                const direction = useHorizontalAxis
                    ? Math.sign(deltaX) || (first.id < second.id ? 1 : -1)
                    : Math.sign(deltaY) || (first.id < second.id ? 1 : -1);
                const displacement = (useHorizontalAxis ? overlapX : overlapY) + 0.01;
                const firstShare = firstLocked ? 0 : secondLocked ? 1 : 0.5;
                const secondShare = secondLocked ? 0 : firstLocked ? 1 : 0.5;

                if (useHorizontalAxis) {
                    first.x -= direction * displacement * firstShare;
                    second.x += direction * displacement * secondShare;
                } else {
                    first.y -= direction * displacement * firstShare;
                    second.y += direction * displacement * secondShare;
                }
            }
        }

        if (!foundOverlap) break;
    }

    return nodes;
};

const getLayoutOffset = (nodes, layoutNodeLookup) => {
    const anchor = nodes.find(isLayoutLocked);

    if (anchor) {
        const currentPosition = getNodeTopLeft(anchor);
        const layoutPosition = layoutNodeLookup.get(anchor.id);

        return {
            x: currentPosition.x - layoutPosition.x,
            y: currentPosition.y - layoutPosition.y,
        };
    }

    if (!nodes.length) return { x: 0, y: 0 };

    const currentCenter = nodes.reduce((center, node) => {
        const position = getNodeTopLeft(node);

        return { x: center.x + position.x, y: center.y + position.y };
    }, { x: 0, y: 0 });
    const layoutCenter = nodes.reduce((center, node) => {
        const position = layoutNodeLookup.get(node.id);

        return { x: center.x + position.x, y: center.y + position.y };
    }, { x: 0, y: 0 });

    return {
        x: (currentCenter.x - layoutCenter.x) / nodes.length,
        y: (currentCenter.y - layoutCenter.y) / nodes.length,
    };
};

const applyElkLayout = (nodes, layoutChildren) => {
    const originalNodeLookup = new Map(nodes.map((node) => [node.id, node]));
    const rawLayoutLookup = new Map(layoutChildren.map((node) => [node.id, node]));
    const offset = getLayoutOffset(nodes, rawLayoutLookup);
    const lockedIds = new Set(nodes.filter(isLayoutLocked).map((node) => node.id));
    const positionedNodes = layoutChildren.map((node) => ({
        ...node,
        x: node.x + offset.x,
        y: node.y + offset.y,
    }));
    const collisionFreeNodes = resolveOverlaps(positionedNodes, lockedIds);
    const layoutNodeLookup = new Map(collisionFreeNodes.map((node) => [node.id, node]));

    return nodes.map((node) => {
        if (isLayoutLocked(node)) return node;

        const layoutNode = layoutNodeLookup.get(node.id);
        if (!layoutNode) return node;

        const { height, width } = getNodeSize(originalNodeLookup.get(node.id));
        const [originX = 0, originY = 0] = node.origin ?? [];

        return {
            ...node,
            position: {
                x: layoutNode.x + width * originX,
                y: layoutNode.y + height * originY,
            },
        };
    });
};

const autoLayoutNodes = async (nodes, edges) => {
    if (nodes.length < 2) return nodes;

    const { default: ELK } = await import('elkjs/lib/elk.bundled.js');
    const elk = new ELK();
    const result = await elk.layout(createElkGraph(nodes, edges));

    return applyElkLayout(nodes, result.children ?? []);
};

export {
    applyElkLayout,
    autoLayoutNodes,
    createElkGraph,
    isLayoutLocked,
    resolveOverlaps,
};
