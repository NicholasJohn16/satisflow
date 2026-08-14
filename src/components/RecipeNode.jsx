import { 
    Handle,
    Position,
    NodeResizer
} from "@xyflow/react";
import RecipeItem from "./RecipeItem";
import ItemHandle from "./ItemHandle";
import { useRef, useEffect } from "react";
import { MdLogin, MdLogout } from "react-icons/md";
import { useData } from "../contexts/data";

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
    const { getItem } = useData();
    const ingredients = Object.entries(data.ingredients);
    const products = Object.entries(data.products);
    // const sourceConnections = useHandleConnections({type: 'source', id: 'Desc_Computer_C'});
    // const targetConnections = useHandleConnections({type: 'target', id: 'Desc_Computer_C'});
    const factoryCount = Array.from({ length: data.machineCount}, (v, i) => i + 1);
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
            <NodeResizer
                isVisible={selected}
                minHeight={(data.factory.length * 5) + 22}
                minWidth={(data.factory.width * 5) + 22}
            />
            {ingredients.map(([ingredient, amount], index) => (
                <ItemHandle 
                    type="target"
                    position={Position.Top}
                    style={offsets[ingredients.length][index]}
                    id={`${id}_${ingredient}`}
                    nodeId={id}
                    key={ingredient}
                    // isValidConnection={isValidConnection}
                />
            ))}
            <div style={styles.node}>
                <div>{recipe.displayName} <span>{renderCount.current}</span></div>
                <div>Node ID: {id}</div>
                <div className="factories" style={{"--factory-count": data.machineCount, "--factory-width": `${data.factory.width * 5}px`, "--factory-height": `${data.factory.length * 5}px`}}>
                    {factoryCount.map((el, index) => (
                        <div className="factory" >
                            {el}
                        </div>
                    ))}
                </div>
                {true && <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '.5rem 0 .5rem 0'}}>
                    <div className="recipe-row">
                        <div style={{padding: '2px'}}>
                            <MdLogin size={'16px'} style={{verticalAlign: 'middle'}} />
                        </div>
                        {ingredients.map(([ingredient, amount]) => (
                            <RecipeItem key={ingredient} amount={amount} item={ingredient} />
                        ))}
                    </div>
                </div> }
                {true && <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '.5rem 0 .5rem 0'}}>
                    <div className="recipe-row">
                        <div style={{padding: '2px'}}>
                            <MdLogout size={'16px'} style={{verticalAlign: 'middle'}} />
                        </div>
                        {products.map(([product, amount]) => (
                            <RecipeItem key={product} amount={amount} item={product} />
                        ))}
                    </div>
                </div> }
            </div>
            {products.map(([product, amount], index) => (
                <ItemHandle
                    type="source"
                    position={Position.Bottom} 
                    id={`${id}_${product}`}
                    style={offsets[products.length][index]}
                    nodeId={id}
                    key={product}
                    // isValidConnection={isValidConnection}
                />
            ))}
        </>
    )
}

export default RecipeNode;