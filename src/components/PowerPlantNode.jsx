import { Position, useUpdateNodeInternals } from '@xyflow/react';
import { useEffect } from 'react';
import {
    getInputAssignments,
    getInputFulfillment,
    getNodeProductionRatio,
    getOutputFulfillment,
    getOutputHandleId,
} from '../resourceConnections';
import { POWER_PLANTS } from '../powerPlants';
import { getConnectorPositions } from '../connectorPositions';
import ItemHandle from './ItemHandle';
import ResizableBuildingNode from './ResizableBuildingNode';
import { useFlowMetrics } from '../contexts/flowMetrics';

const getOffset = (position, count, index) => ({
    [position === Position.Left || position === Position.Right ? 'top' : 'left']:
        `${((index + 1) / (count + 1)) * 100}%`,
});

export default function PowerPlantNode({ id, data, width, height }) {
    const { allocations, edges, getNode } = useFlowMetrics();
    const connectorLayout = data.connectorLayout ?? 'vertical';
    const { inputPosition, outputPosition } = getConnectorPositions(connectorLayout);
    const updateNodeInternals = useUpdateNodeInternals();
    useEffect(() => {
        updateNodeInternals(id);
    }, [connectorLayout, id, updateNodeInternals]);

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
    const outputs = Object.entries(data.products ?? {}).map(([resource, amount]) => {
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
    const plant = POWER_PLANTS[data.plantType] ?? POWER_PLANTS.coal;

    return (
        <>
            {inputAssignments.map(({ amount, connected, handleId, ratio, resource }, index) => (
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
            <ResizableBuildingNode
                factory={plant}
                height={height}
                id={id}
                machineCount={data.machineCount}
                width={width}
            />
            {outputs.map(({ amount, connected, fulfillment, handleId, resource }, index) => (
                <ItemHandle
                    type="source"
                    position={outputPosition}
                    style={getOffset(outputPosition, outputs.length, index)}
                    id={handleId}
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
