import { 
    useHandleConnections, 
    Handle,
    useUpdateNodeInternals,
    useReactFlow,
    addEdge,
    useStore,
    getConnectedEdges,
    useStoreApi } from "@xyflow/react";
import ItemImage from "./ItemImage";
import { useData } from "../contexts/data";
import { intersection } from "lodash";


function ItemHandle({id, nodeId, position, type, style}) {
    const { setEdges, getNode, getEdges } = useReactFlow();
    const { items } = useData();
    // const state = useStore((state => state));
    const store = useStoreApi();

    // const connectedEdges = getConnectedEdges([{id: nodeId}], getEdges());
    // console.log(connectedEdges, 'connectedEdges');

    const getIntersectingItems = (source, target) => {
        const sourceNode = getNode(source);
        const targetNode = getNode(target);

        const products = Object.values(sourceNode.data.recipe.products)
                            .map(product => items[product.name]);
        const ingredients = Object.values(targetNode.data.recipe.ingredients)
                            .map(ingredient => items[ingredient.name]);
        // const productsSet = new Set(products);
        // const ingredientsSet = new Set(ingredients);

        // return productsSet.intersection(ingredientsSet);

        return intersection(products, ingredients);
    }

    const filterCurrentConnections = () => {

    }

    const getHandleConnections = (nodeId, id, type) => {
        const state =  store.getState();

        const string = `${nodeId}-${type}-${id ?? null}`;
        const connections = state.connectionLookup;
        const result = state.connectionLookup.get(string);

        return Array.from(result?.values() ?? []);

        // Array.from(store
        // .getState()
        // .connectionLookup.get(`${nodeId}-${type}-${id ?? null}`)
        // ?.values() ?? []);
    };

    const getEdgesForHandle = (nodeId, handleId, type) => {
        // const connections = getHandleConnections(type, nodeId);
        // console.log(type, nodeId, handle);
        // console.log(connections, 'getEdgesForHandle.connections.'+type);

        const args = {type, nodeId, handleId};
        console.group();
        console.log(store.getState().connectionLookup, 'state.connectionLookup');
        console.log(args, 'args');
        const result = getHandleConnections(nodeId, handleId, type);
        console.log(getHandleConnections(nodeId, handleId, type), `getHandleConnections`);
        // console.log(getHandleConnections({type: 'target', nodeId, id}), `getHandleConnections(target, ${nodeId}, ${id})`);
        console.groupEnd();

        return result;
    }

    const isValidConnection = function({source, sourceHandle, target, targetHandle}) {
        console.log({source, sourceHandle, target, targetHandle});
        const intersection = getIntersectingItems(source, target);        
        console.log(intersection, 'intersection');
        // if there are no matching inputs and outputs
        if(!intersection.length) {
            return false;
        }

        const sourceEdges = getEdgesForHandle(source, sourceHandle, 'source');
        const targetEdges = getEdgesForHandle(target, targetHandle, 'target');
        console.log(sourceEdges, 'sourceEdges');
        console.log(targetEdges, 'targetEdges');
        if (sourceEdges.length) {

        }

        if (targetEdges.length) {
            
        }

        // if another handle already accepts this type
        // if this handle is already accepting another type

        return true;
    }

    const onConnect = (connection) => {
        const intersection = getIntersectingItems(connection.source, connection.target);
        // console.log(intersection);
        const newConnection = {
            ...connection,
            type: 'itemEdge',
            data: {
                item: [...intersection][0]
            }
        };
        setEdges(edges => addEdge(newConnection, edges));
        return false;
    }

    return (
        <>
            <Handle
                type={type}
                position={position}
                style={style}
                id={id}
                onConnect={onConnect}
                isValidConnection={isValidConnection}
                title={id}
            />
            {/* {connectedEdges.length && <ItemImage item={connectedEdges[0].data.item} style={{height: '1rem'}} />} */}
        </>
    )
}

export default ItemHandle;

// https://reactflow.dev/examples/interaction/computing-flows
// https://reactflow.dev/learn/advanced-use/computing-flows