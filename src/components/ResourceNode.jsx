import { useUpdateNodeInternals } from '@xyflow/react';
import { useEffect } from 'react';
import {
    getOutputFulfillment,
    getOutputHandleId,
} from '../resourceConnections';
import { RESOURCE_NODE_EXTRACTORS } from '../resourceNodes';
import ItemHandle from './ItemHandle';
import ResizableBuildingNode from './ResizableBuildingNode';
import {
    getCenteredConnectorStyle,
    getConnectorPositions,
} from '../connectorPositions';
import { useFlowMetrics } from '../contexts/flowMetrics';

export default function ResourceNode({id, data, width, height}) {
    const { allocations, edges } = useFlowMetrics();
    const resource = data.resource;
    const amount = Number(data.products?.[resource] ?? 0);
    const handleId = getOutputHandleId(id, resource);
    const { ratio } = getOutputFulfillment(
        id,
        handleId,
        amount,
        edges,
        allocations,
    );
    const connected = edges.some((edge) => (
        edge.source === id && edge.sourceHandle === handleId
    ));
    const machineCount = data.machineCount ?? 1;
    const factory = RESOURCE_NODE_EXTRACTORS[data.minerTier ?? '3'];
    const connectorLayout = data.connectorLayout ?? 'vertical';
    const { outputPosition } = getConnectorPositions(connectorLayout);
    const updateNodeInternals = useUpdateNodeInternals();
    useEffect(() => {
        updateNodeInternals(id);
    }, [connectorLayout, id, updateNodeInternals]);

    return (
        <>
            <ResizableBuildingNode
                factory={factory}
                height={height}
                id={id}
                machineCount={machineCount}
                width={width}
            />
            <ItemHandle
                type="source"
                position={outputPosition}
                id={handleId}
                style={getCenteredConnectorStyle(outputPosition)}
                item={resource}
                amount={amount}
                connected={connected}
                fulfillment={ratio}
            />
        </>
    );
}
