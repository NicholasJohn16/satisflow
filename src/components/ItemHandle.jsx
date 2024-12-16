import { useHandleConnections, 
         Handle,
         useUpdateNodeInternals,
         useReactFlow,
         addEdge,
         getConnectedEdges
        } from "@xyflow/react";
import data from '../data.json';
import ItemImage from "./ItemImage";

const { items } = data;

function ItemHandle({id, nodeId, position, type, style}) {
    const { setEdges, getNode, getEdges } = useReactFlow();

    const connectedEdges = getConnectedEdges([{id: nodeId}], getEdges());
    // console.log(connectedEdges, 'connectedEdges');

    const getIntersectingItems = (source, target) => {
        const sourceNode = getNode(source);
        const targetNode = getNode(target);

        const products = Object.values(sourceNode.data.recipe.products)
                            .map(product => items[product.name]);
        const ingredients = Object.values(targetNode.data.recipe.ingredients)
                            .map(ingredient => items[ingredient.name]);
        const productsSet = new Set(products);
        const ingredientsSet = new Set(ingredients);

        return productsSet.intersection(ingredientsSet);
    }

    const filterCurrentConnections = () => {

    }

    const isValidConnection = function({source, sourceHandle, target, targetHandle}) {
        const intersection = getIntersectingItems(source, target);        

        // if there are no matching inputs and outputs
        if(!intersection.size) {
            return false;
        }

        // if another handle already accepts this type
        // if this handle is already accepting another type

        return true;
    }

    const onConnect = (connection) => {
        const intersection = getIntersectingItems(connection.source, connection.target);
        console.log(intersection);
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
            />
            {/* {connectedEdges.length && <ItemImage item={connectedEdges[0].data.item} style={{height: '1rem'}} />} */}
        </>
    )
}

export default ItemHandle;

// https://reactflow.dev/examples/interaction/computing-flows
// https://reactflow.dev/learn/advanced-use/computing-flows