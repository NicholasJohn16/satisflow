import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useStore } from "@xyflow/react";
import { useMemo } from "react";
import ItemImage from "./ItemImage";
import { getResourceAllocations } from "../resourceConnections";
import { getSelfLoopPath, shouldShowEdgeIndicator } from "../edgePaths";
import { humanize } from "../humanize";

export default function ItemEdge({
    id,
    source,
    sourceHandleId,
    sourcePosition,
    sourceX,
    sourceY,
    target,
    targetHandleId,
    targetPosition,
    targetX,
    targetY,
    data,
}) {
    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);
    const sourceNode = useStore((state) => state.nodeLookup.get(source));
    const nodeBounds = sourceNode
        ? {
            x: sourceNode.internals.positionAbsolute.x,
            y: sourceNode.internals.positionAbsolute.y,
            width: sourceNode.measured.width,
            height: sourceNode.measured.height,
        }
        : undefined;
    const transferredAmount = useMemo(
        () => getResourceAllocations(nodes, edges).get(id) ?? 0,
        [edges, id, nodes],
    );
    const formattedAmount = humanize(transferredAmount);
    const [edgePath, labelX, labelY] = source === target
        ? getSelfLoopPath({
            sourcePosition,
            sourceX,
            sourceY,
            targetPosition,
            targetX,
            targetY,
            nodeBounds,
        })
        : getSmoothStepPath({
            sourcePosition,
            sourceX,
            sourceY,
            targetPosition,
            targetX,
            targetY,
        });
    const showIndicator = shouldShowEdgeIndicator({
        edges,
        source,
        sourceHandle: sourceHandleId,
        sourceX,
        sourceY,
        target,
        targetHandle: targetHandleId,
        targetX,
        targetY,
    });

    return (
        <>
            <BaseEdge path={edgePath} />
            {showIndicator && (
                <EdgeLabelRenderer>
                    <div
                        className="item-edge__label nodrag nopan"
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        }}
                    >
                        <ItemImage item={data.item} />
                        <span>{formattedAmount}</span>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
