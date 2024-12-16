import Modal from "react-modal";
import { useModal } from '../contexts/modal';
import data from '../data.json';
const { items, recipes, constructors } = data;
import ItemImage from "./ItemImage";
import { MdElectricBolt } from "react-icons/md";
import { PiGauge } from "react-icons/pi";
import { useReducer } from "react";
import Spinner from "./InputGroup/Spinner";
import { MdAdd } from "react-icons/md";
import { MdOutlineRemove } from "react-icons/md";

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    //   backgroundColor: '#000',
        overflowX: 'scroll',
        // width: '75vw',
        // height: '75vh',
        borderRadius: '.5rem'
    }
};

function initial(recipe) {
    return {
        recipe,
        machines: 1,
        ingredients: [],
        products: [],
        overclocking: 1,
        amplification: 0
    }
}

function dataShape(recipe = {ingredients: {}, products: {}}, overclocking = 1, amplification = 0) {
    console.log(recipe, 'shape.recipe');
    const obj = {ingredients: {}, products: {}, overclocking, amplification};

    Object.values(recipe.ingredients).forEach((ingredient) => {
        obj.ingredients[ingredient.name] = itemsPerMinute(ingredient.amount, recipe.duration) * overclocking;
    });
    
    Object.values(recipe.products).forEach((product) => {
        obj.products[product.name] = itemsPerMinute(product.amount, recipe.duration) * overclocking;
    });

    return obj;
}

const powerFactor = Math.log(2.5) / Math.log(2);
const powerMultiplier = (filledSlots, totalSlots) => (1 + filledSlots / totalSlots )^2;
const energyUsage = (baseEnergy, clockSpeed, powerMultiplier) => baseEnergy * powerMultiplier * (clockSpeed/100)^powerFactor;
const itemsPerMinute = (amount, duration) => (60/duration) * amount;

/*
    action = {
        type: 'set_overclock',
        value: 110
    }
*/
function reducer(state, action) {

    if(action.value < 0) return state;
    if(action.type === 'set_overclock_percent' && action.value > 250) {
        return state;
    }

    switch (action.type) {
        case 'set_machine_count':
            return {
                ...state,
                machines: parseInt(action.value),
            }
            break;
        case 'set_overclock_percent':
            return {
                ...state,
                overclocking: parseFloat(action.value) * .01
            }
        case 'set_overlock_by_item': {
            const overclocking = getOverclockByItems(state, action);
            return {
                ...state,
                overclocking: overclocking
            }
        }
    }
}

const getOverclockByItems = ({recipe, machines}, {source, item, value}) => {
    console.log(recipe, 'recipe.fn');
    console.log(source, 'source.fn');
    console.log(item, 'item.fn');
    console.log(value, 'value.fn');
    const newValue = value.at(-1) === '.' ? value + "0" : value;
    const parsedValue = parseFloat(value.at(-1) === '.' ? value + "0" : value);
    const currentItem = Object.values(recipe[source]).find((i) => i.name = item);
    const baseProduction = machines * itemsPerMinute(currentItem.amount, recipe.duration);
    const overclockPercent = parsedValue / baseProduction;
    // produceByMachines * overclockPercent = totalProduction
    return overclockPercent;
}

export default function RecipeModal() {
    const { 
        isOpen,
        closeModal,
        recipe = { ingredients: [], products: []} } = useModal();
    const ingredients = Object.values(recipe.ingredients);
    const products = Object.values(recipe.products);
    const getItem = name => items[name];
    const [state, dispatch] = useReducer(reducer, {}, () => initial(recipe));

    const maxes = dataShape(recipe, 2.5);
    console.log(dataShape(recipe, 2.5, ), 'shape');

    return (
        <Modal
            isOpen={isOpen.recipe}
            onRequestClose={closeModal}
            style={customStyles}
        >
            <h2>Edit Recipe</h2>
            <section className="recipe-modal-section">
                <h3>Machines</h3>
                <div className="recipe-modal-row">
                    <div className="recipe-modal-column">
                        <h4>Machines</h4>
                        <div className="input-group">
                            <div className="input-label">
                                <img src="" alt="" />
                            </div>
                            <input type="text" value={state.machines} onChange={e => dispatch({'type': 'set_machine_count', value: e.target.value})} />
                            <Spinner dispatch={(value) => dispatch({'type': 'set_machine_count', value: state.machines + value})} />
                        </div>
                    </div>
                    <div className="recipe-modal-column">
                        <h4>Ingredients</h4>
                        {ingredients.map(ingredient => (
                            <div className="input-group">
                                <div className="input-increase">
                                    <MdAdd />
                                </div>
                                <div className="input-label">
                                    <ItemImage item={getItem(ingredient.name)} />
                                </div>
                                <input 
                                    type="text"
                                    value={itemsPerMinute(ingredient.amount, recipe.duration) * state.machines} 
                                    size={0}
                                />
                                <div className="input-unit">/min</div>
                                {/* <Spinner dispatch={(value) => dispatch({'type': 'set_machine_count', value: state.machines + value})} /> */}
                                <div className="input-decrease">
                                    <MdOutlineRemove />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="recipe-modal-column">
                        <h4>Products</h4>
                        {products.map(product => (
                            <div className="input-group">
                                <div className="input-label">
                                    <ItemImage item={getItem(product.name)} />
                                </div>
                                <input 
                                    type="text"
                                    value={itemsPerMinute(product.amount, recipe.duration) * state.machines}
                                />
                                <div className="input-unit">/min</div>
                                <Spinner dispatch={(value) => dispatch({'type': 'set_machine_count', value: state.machines + value})} />
                            </div>
                        ))}
                    </div>
                    <div className="recipe-modal-column">
                        <h4>Power</h4>
                        <div className="input-group">
                            <div className="input-label">
                                <MdElectricBolt />
                            </div>
                            <input type="text" value={energyUsage(4 * state.machines, 100, 1)} />
                            <div className="input-unit">MW</div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="recipe-modal-section">
                <h3>Overclock</h3>
                    <div className="recipe-modal-row">
                        <div className="recipe-modal-column">
                            <h4>Multiplier</h4>
                            <div className={`input-group ${state.overclocking > 2.5 ? 'error' : ''}`}>
                                <div className="input-label">
                                    <PiGauge />
                                </div>
                                <input
                                    type="text"
                                    max="250"
                                    value={state.overclocking * 100}
                                    onChange={e => dispatch({'type': 'set_overclock_percent', value: e.target.value})} 
                                />
                                <div className="input-unit">%</div>
                            </div>
                        </div>
                        <div className="recipe-modal-column">
                            <h4>Ingredients</h4>
                            {ingredients.map(ingredient => (
                                <div className="input-group">
                                    <div className="input-label">
                                        <ItemImage item={getItem(ingredient.name)} />
                                    </div>
                                    <input
                                        type="text"
                                        value={itemsPerMinute(ingredient.amount, recipe.duration) * state.machines * state.overclocking} 
                                        onChange={e => dispatch({type: 'set_overlock_by_item', value: e.target.value, source: 'ingredients', item: ingredient.name })}
                                    />
                                    <div className="input-unit">/min</div>
                                </div>
                            ))}
                        </div>
                        <div className="recipe-modal-column">
                            <h4>Products</h4>
                            {products.map(product => (
                                <div className="input-group">
                                    <div className="input-label">
                                        <ItemImage item={getItem(product.name)} />
                                    </div>
                                    <input
                                        type="text"
                                        value={itemsPerMinute(product.amount, recipe.duration) * state.machines * state.overclocking} 
                                        onChange={e => dispatch({type: 'set_overlock_by_item', value: e.target.value, source: 'products', item: product.name })}
                                    />
                                    <div className="input-unit">/min</div>
                                </div>
                            ))}
                        </div>
                        <div className="recipe-modal-column">
                            <h4>Power</h4>
                            <div className="input-group">
                                <div className="input-label">
                                    <MdElectricBolt />
                                </div>
                                <input type="text" value={energyUsage(4 * state.machines, state.overclocking, 1)} />
                                <div className="input-unit">MW</div>
                            </div>
                        </div>
                </div>
            </section>
        </Modal>
    )
}