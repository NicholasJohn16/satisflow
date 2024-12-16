import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer, getConnectedEdges } from "@xyflow/react";
import ItemImage from "./ItemImage";
import { useReactFlow } from "@xyflow/react";

export default function ItemEdge({id, sourceX, sourceY, targetX, targetY, data}) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <>
            <BaseEdge path={edgePath} />
            <EdgeLabelRenderer>
                <div
                    className="item-edge__label nodrag nopan"
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                    }}
                >
                    <ItemImage item={data.item} style={{height: '1rem'}} />
                </div>
            </EdgeLabelRenderer>
        </>
    )
}