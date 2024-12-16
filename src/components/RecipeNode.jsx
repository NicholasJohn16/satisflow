import { 
    Handle,
    Position
} from "@xyflow/react";
import data from '../data.json';
import RecipeItem from "./RecipeItem";
import ItemHandle from "./ItemHandle";
import { useRef, useEffect } from "react";
import { MdLogin, MdLogout } from "react-icons/md";

const { items } = data;

const styles = {
    node: {
        visibility: 'visible',
        zIndex: 0,
    }
}

const offsets = {
    1: {
        0: {left: '50%'}
    },
    2: {
        0: {left: '33.3333%'},
        1: {left: '66.6666%'}
    },
    3: {
        0: {left: '25%'},
        1: {left: '50%'},
        2: {left: '75%'}
    },
    4: {
        0: {left: '20%'},
        1: {left: '40%'},
        2: {left: '60%'},
        3: {left: '80%'}
    }
}

function RecipeNode({data, selected, id}) {
    const recipe = data.recipe;
    const ingredients = Object.entries(recipe.ingredients);
    const products = Object.entries(recipe.products);
    // const sourceConnections = useHandleConnections({type: 'source', id: 'Desc_Computer_C'});
    // const targetConnections = useHandleConnections({type: 'target', id: 'Desc_Computer_C'});

    const renderCount = useRef(0);

    useEffect(() => {
        renderCount.current++;
    });


    // console.log(sourceConnections, 'sourceConnections');
    // console.log(targetConnections, 'targetConnections');
    // console.log(getEdges(), 'getEdges');

    // const connections = ingredients.map(([key, ingredient], index) => (
    //     useHandleConnections({type: 'source', id: `${id}-${ingredient.name}` })
    // ));

    return (
        <>
            {ingredients.map(([key, ingredient], index) => (
                <ItemHandle 
                    type="target"
                    position={Position.Top}
                    style={offsets[ingredients.length][index]}
                    id={`${id}-${ingredient.name}`}
                    nodeId={id}
                    // isValidConnection={isValidConnection}
                />
            ))}
            <div 
                style={styles.node}
            >
                <div>{recipe.displayName}</div>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '.5rem 0 .5rem 0'}}>
                    <div className="recipe-row">
                        <div style={{padding: '2px'}}>
                            <MdLogin size={'16px'} style={{verticalAlign: 'middle'}} />
                        </div>
                        {ingredients.map(([key, ingredient]) => (
                            <RecipeItem recipe={recipe} item={ingredient} />
                        ))}
                    </div>
                    <div className="recipe-row">
                        <div style={{padding: '2px'}}>
                            <MdLogout size={'16px'} style={{verticalAlign: 'middle'}} />
                        </div>
                        {products.map(([key, product]) => (
                            <RecipeItem recipe={recipe} item={product} />
                        ))}
                    </div>
                </div>
                <button className="default" onClick={() => console.log(connections, 'connections')}>Log Connections</button>
                <button className="default" onClick={() => console.log(getEdges())}>Log Edges</button>
                <button className="default">{renderCount.current}</button>
            </div>
            {products.map(([key, product], index) => (
                <ItemHandle
                    type="source"
                    position={Position.Bottom} 
                    id={`${id}-${product.name}`}
                    style={offsets[products.length][index]}
                    nodeId={id}
                    // isValidConnection={isValidConnection}
                />
            ))}
        </>
    )
}

export default RecipeNode;