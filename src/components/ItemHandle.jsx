import { addEdge, Handle, Position, useReactFlow } from "@xyflow/react";
import ItemImage from "./ItemImage";
import { useData } from "../contexts/data";
import { humanize } from "../humanize";
import {
    getFulfillmentColor,
    getResourceFromSourceHandle,
    isResourceConnectionValid,
} from "../resourceConnections";

function ItemHandle({
    id,
    position,
    type,
    style,
    item,
    amount,
    connected = false,
    fulfillment = 0,
}) {
    const { setEdges, getNode, getEdges } = useReactFlow();
    const { items } = useData();

    const isValidConnection = (connection) => (
        isResourceConnectionValid(connection, getNode, getEdges())
    );

    const onConnect = (connection) => {
        const resource = getResourceFromSourceHandle(
            getNode(connection.source),
            connection.sourceHandle,
        );

        setEdges((edges) => {
            if (!isResourceConnectionValid(connection, getNode, edges)) return edges;

            return addEdge({
                ...connection,
                type: 'itemEdge',
                data: {
                    item: items[resource],
                    resource,
                },
            }, edges);
        });
    };

    const formattedAmount = typeof amount === 'number' ? humanize(amount) : amount;
    const fulfillmentColor = getFulfillmentColor(fulfillment);
    const fulfillmentPercent = Math.round(fulfillment * 100);
    const connectedHandleStyle = connected
        ? {
            "--fulfillment-color": fulfillmentColor,
            borderColor: fulfillmentColor,
        }
        : {};
    const title = connected
        ? `${formattedAmount} ${items[item].displayName} (${fulfillmentPercent}% supplied)`
        : `${formattedAmount} ${items[item].displayName}`;
    const isSide = position === Position.Left || position === Position.Right;
    const sideClass = isSide ? ' recipe-resource-handle--side' : '';
    const content = (
        <>
            <ItemImage item={item} />
            <span>{formattedAmount}</span>
        </>
    );

    return (
        <Handle
            type={type}
            position={position}
            style={{ ...style, ...connectedHandleStyle }}
            id={id}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            title={title}
            className={`recipe-resource-handle recipe-resource-handle--${type} nodrag nopan${sideClass}${connected ? ' recipe-resource-handle--connected' : ''}`}
        >
            {isSide
                ? <span className="recipe-resource-handle__side-content">{content}</span>
                : content}
        </Handle>
    );
}

export default ItemHandle;
