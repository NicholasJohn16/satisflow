import {
    NodeResizer,
    Position,
    useReactFlow,
    useUpdateNodeInternals,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import ItemHandle from "./ItemHandle";
import {
    getInputAssignments,
    getInputFulfillment,
    getNodeProductionRatio,
    getOutputFulfillment,
    getOutputHandleId,
} from "../resourceConnections";
import {
    getClosestFactoryLayout,
    getDefaultFactoryLayout,
    getFactoryLayoutAfterCountChange,
    getFactoryLayouts,
    getSnappedNodeRect,
} from "../factoryLayout";
import { getConnectorPositions } from '../connectorPositions';
import { useFlowMetrics } from '../contexts/flowMetrics';

const styles = {
    node: {
        visibility: 'visible',
        zIndex: 0,
    },
};

const getOffset = (position, count, index) => ({
    [position === Position.Left || position === Position.Right ? 'top' : 'left']:
        `${((index + 1) / (count + 1)) * 100}%`,
});

function RecipeNode({data, id, width, height}) {
    const recipe = data.recipe;
    const isAlternate = recipe.className?.startsWith('Recipe_Alternate_')
        || /^Alternate:\s*/i.test(recipe.displayName);
    const products = Object.entries(data.products);
    const connectorLayout = data.connectorLayout ?? 'vertical';
    const { inputPosition, outputPosition } = getConnectorPositions(connectorLayout);
    const factoryLayouts = useMemo(
        () => getFactoryLayouts(data),
        [data],
    );
    const defaultFactoryLayout = useMemo(
        () => getDefaultFactoryLayout(factoryLayouts),
        [factoryLayouts],
    );
    const hasMeasuredSize = Number.isFinite(width) && Number.isFinite(height);
    const availableSize = useMemo(
        () => hasMeasuredSize
            ? { width, height }
            : defaultFactoryLayout,
        [defaultFactoryLayout, hasMeasuredSize, height, width],
    );
    const resizeStart = useRef(null);
    const factoryLayout = useMemo(
        () => getClosestFactoryLayout(
            factoryLayouts,
            availableSize,
            resizeStart.current,
        ),
        [availableSize, factoryLayouts],
    );
    const factoryCount = Array.from(
        { length: factoryLayout.machineCount },
        (_, i) => i + 1,
    );
    const previousFactoryLayout = useRef(factoryLayout);
    const { allocations, edges, getNode } = useFlowMetrics();
    const { updateNode } = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();
    useEffect(() => {
        updateNodeInternals(id);
    }, [connectorLayout, id, updateNodeInternals]);
    useEffect(() => {
        if (!hasMeasuredSize || resizeStart.current) return;

        const matchesLayout = factoryLayouts.some((layout) => (
            layout.width === width && layout.height === height
        ));
        if (matchesLayout) return;

        updateNode(id, {
            height: factoryLayout.height,
            width: factoryLayout.width,
        });
    }, [
        factoryLayout,
        factoryLayouts,
        hasMeasuredSize,
        height,
        id,
        updateNode,
        width,
    ]);
    useEffect(() => {
        const previousLayout = previousFactoryLayout.current;

        if (previousLayout.machineCount === factoryLayout.machineCount) {
            previousFactoryLayout.current = factoryLayout;
            return;
        }

        const nextLayout = getFactoryLayoutAfterCountChange(
            factoryLayouts,
            previousLayout,
        );
        previousFactoryLayout.current = nextLayout;
        updateNode(id, {
            height: nextLayout.height,
            width: nextLayout.width,
        });
    }, [factoryLayout, factoryLayouts, id, updateNode]);
    const inputAssignments = getInputAssignments(id, data.ingredients, edges, getNode)
        .map((assignment) => ({
            ...assignment,
            ...getInputFulfillment(
                id,
                assignment.handleId,
                assignment.amount,
                edges,
                allocations,
            ),
        }));
    const productionRatio = getNodeProductionRatio(
        id,
        data.ingredients,
        edges,
        allocations,
        getNode,
    );
    const outputAssignments = products.map(([resource, amount]) => {
        const handleId = getOutputHandleId(id, resource);
        const producedAmount = Math.round(amount * productionRatio * 1e10) / 1e10;
        const { ratio } = getOutputFulfillment(
            id,
            handleId,
            producedAmount,
            edges,
            allocations,
        );

        return {
            amount: producedAmount,
            connected: edges.some((edge) => (
                edge.source === id && edge.sourceHandle === handleId
            )),
            fulfillment: ratio,
            handleId,
            resource,
        };
    });

    const onResizeStart = useCallback((event, params) => {
        resizeStart.current = params;
    }, []);

    const onResizeEnd = useCallback((event, params) => {
        const layout = getClosestFactoryLayout(
            factoryLayouts,
            params,
            resizeStart.current,
        );
        const snapped = getSnappedNodeRect(
            layout,
            resizeStart.current ?? params,
            params,
        );

        updateNode(id, {
            height: snapped.height,
            position: snapped.position,
            width: snapped.width,
        });
        resizeStart.current = null;
    }, [factoryLayouts, id, updateNode]);

    return (
        <>
            <NodeResizer
                isVisible
                handleClassName="recipe-node__resize-handle"
                lineClassName="recipe-node__resize-line"
                minHeight={Math.min(...factoryLayouts.map((layout) => layout.height))}
                minWidth={Math.min(...factoryLayouts.map((layout) => layout.width))}
                maxHeight={Math.max(...factoryLayouts.map((layout) => layout.height))}
                maxWidth={Math.max(...factoryLayouts.map((layout) => layout.width))}
                onResizeStart={onResizeStart}
                onResizeEnd={onResizeEnd}
            />
            {inputAssignments.map(({amount, connected, handleId, ratio, resource}, index) => (
                <ItemHandle
                    type="target"
                    position={inputPosition}
                    style={getOffset(inputPosition, inputAssignments.length, index)}
                    id={handleId}
                    key={handleId}
                    item={resource}
                    amount={amount}
                    connected={connected}
                    fulfillment={ratio}
                />
            ))}
            <div
                className={`recipe-node__body${isAlternate ? ' recipe-node__body--alternate' : ''}`}
                style={{
                    ...styles.node,
                    height: hasMeasuredSize ? '100%' : `${defaultFactoryLayout.height}px`,
                    width: hasMeasuredSize ? '100%' : `${defaultFactoryLayout.width}px`,
                }}
            >
                {/* <div className="recipe-node__heading" title={displayName}>
                    {displayName}
                </div>
                <div className="recipe-node__heading">
                    <small>{data.factory.name} • {Math.round(data.clockSpeed * 100)}% • {data.amplification} A</small>
                </div> */}
                <div
                    className="factories"
                    data-rotated={factoryLayout.rotated}
                    style={{
                        "--factory-columns": factoryLayout.columns,
                        "--factory-width": `${factoryLayout.factoryWidth}px`,
                        "--factory-height": `${factoryLayout.factoryHeight}px`,
                        "--factory-body-width": `${factoryLayouts[0].factoryWidth}px`,
                        "--factory-body-height": `${factoryLayouts[0].factoryHeight}px`,
                    }}
                >
                    {factoryCount.map((factoryNumber) => (
                        <div className="factory-slot" key={factoryNumber}>
                            <div className="factory" />
                        </div>
                    ))}
                </div>
            </div>
            {outputAssignments.map(({
                amount,
                connected,
                fulfillment,
                handleId,
                resource,
            }, index) => (
                <ItemHandle
                    type="source"
                    position={outputPosition}
                    id={handleId}
                    style={getOffset(outputPosition, outputAssignments.length, index)}
                    key={handleId}
                    item={resource}
                    amount={amount}
                    connected={connected}
                    fulfillment={fulfillment}
                />
            ))}
        </>
    );
}

export default RecipeNode;
