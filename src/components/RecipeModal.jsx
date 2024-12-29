import Modal from "react-modal";
import { useModal } from '../contexts/modal';
import { useData } from "../contexts/data";
import ItemImage from "./ItemImage";
import { MdOutlineRemove, MdAdd } from "react-icons/md";
import { PiGauge, PiFactory } from "react-icons/pi";
import { useReducer, useState  } from "react";
import { getShape, reducer, totalEnergyUsage } from "../functions";
import { BsLightning } from "react-icons/bs";
import { round } from "lodash";
import { useReactFlow } from "@xyflow/react";

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

export default function RecipeModal() {
    const { isOpen, closeModal, node, setNode } = useModal();
    const { items, constructors } = useData();
    const recipe = node.data.recipe;
    const ingredients = Object.values(recipe.ingredients);
    const products = Object.values(recipe.products);
    const factory = constructors[recipe.producedIn];
    const getItem = name => items[name];
    const [state, dispatch] = useReducer(reducer, {}, () =>  node.data);
    const [tab, setTab] = useState('machine');
    const somersloopSlots = Array.from({ length: factory.somersloopSlots}, (v, i) => i + 1);
    const maxes = getShape({ recipe, factory, clockSpeed: 2.5, machineCount: state.machineCount });
    const format = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
    const { updateNodeData } = useReactFlow();
    const onRequestClose = () => {
        updateNodeData(node.id, state);
        setNode(null);
        closeModal();
    };

    return (
        <Modal
            isOpen={isOpen.recipe}
            onRequestClose={onRequestClose}
            style={customStyles}
        >
            <h2>Edit Recipe</h2>

            <div className="recipe-modal-row">
                <div className="recipe-modal-column" onClick={() => setTab('machine')}>
                    <div className="input-group">
                        <div className="input-label">
                            <PiFactory />
                        </div>
                        <input type="text" value={state.machineCount} onChange={e => dispatch({'type': 'set_machine_count', value: e.target.value})} />
                        <div className="input-increase" onClick={() => dispatch({'type': 'set_machine_count', value: state.machineCount + 1})} >
                            <MdAdd />
                        </div>
                        <div className="input-decrease" onClick={() => dispatch({'type': 'set_machine_count', value: state.machineCount - 1})}>
                            <MdOutlineRemove />
                        </div>
                    </div>
                </div>
                <div className="recipe-modal-column" onClick={() => setTab('clockSpeed')}>
                    <div className={`input-group ${state.clockSpeed > 2.5 ? 'error' : ''}`}>
                        <div className="input-label">
                            <PiGauge />
                        </div>
                        <input
                            type="text"
                            max="250"
                            value={format(state.clockSpeed * 100)}
                            onChange={e => dispatch({'type': 'set_overclock_percent', value: e.target.value})} 
                        />
                        <div className="input-unit">%</div>
                    </div>
                </div>
                <div className="recipe-modal-column">
                    <select 
                        className="amplification-select"
                        disabled={!somersloopSlots.length}
                        value={state.amplification}
                        onChange={e => dispatch({'type': 'set_amplification', value: e.target.value})}
                    >
                        {!somersloopSlots.length && <option value="">Amplification Not Supported</option>}
                        {somersloopSlots.length && <option value={0}>No Amplification</option>}
                        {somersloopSlots.map((count) => (
                            <option value={count}>{count} Somersloops</option>
                        ))}
                    </select>
                </div>
                <div className="recipe-modal-column">
                    <div className="input-group">
                        <div className="input-label">
                            <BsLightning />
                        </div>
                        <input type="text" readOnly value={round(state.energyUsage, 1)} />
                        <div className="input-unit">MW</div>
                    </div>
                </div>
            </div>

            {tab === 'machine' && <section className="recipe-modal-section">
                <h3>Machines</h3>
                <p>Use the below fields to update the number of machines and clock speed to consume or produce the requested amount.</p>
                <div className="recipe-modal-row">
                    <div className="recipe-modal-column">
                        <h4>Machines</h4>
                        <div className="input-group">
                            <div className="input-label">
                                <PiFactory />
                            </div>
                            <input type="text" value={state.machineCount} onChange={e => dispatch({'type': 'set_machine_count', value: e.target.value})} />
                            <div className="input-increase" onClick={() => dispatch({'type': 'set_machine_count', value: state.machineCount + 1})} >
                                <MdAdd />
                            </div>
                            <div className="input-decrease" onClick={() => dispatch({'type': 'set_machine_count', value: state.machineCount - 1})}>
                                <MdOutlineRemove />
                            </div>
                        </div>
                    </div>
                    <div className="recipe-modal-column">
                        <h4>Ingredients</h4>
                        {ingredients.map(ingredient => (
                            <div key={ingredient.name} className="input-group">
                                <div className="input-label">
                                    <ItemImage item={getItem(ingredient.name)} />
                                </div>
                                <input 
                                    type="text"
                                    value={state['ingredients'][ingredient.name]} 
                                    size={0}
                                    onChange={e => dispatch({type: 'set_machine_count_by_item', value: e.target.value, source: 'ingredients', item: ingredient.name })}
                                />
                                <div className="input-unit">/min</div>
                            </div>
                        ))}
                    </div>
                    <div className="recipe-modal-column">
                        <h4>Products</h4>
                        {products.map(product => (
                            <div key={product.name} className="input-group">
                                <div className="input-label">
                                    <ItemImage item={getItem(product.name)} />
                                </div>
                                <input 
                                    type="text"
                                    value={state['products'][product.name]}
                                    onChange={e => dispatch({type: 'set_machine_count_by_item', value: e.target.value, source: 'ingredients', item: ingredient.name })}
                                />
                                <div className="input-unit">/min</div>
                            </div>
                        ))}
                    </div>
                    <div className="recipe-modal-column">
                        <h4>Power</h4>
                        <div className="input-group">
                            <div className="input-label">
                                <BsLightning />
                            </div>
                            <input type="text" readOnly value={round(state.energyUsage, 1)} />
                            <div className="input-unit">MW</div>
                        </div>
                    </div>
                </div>
            </section> }
            {tab === 'clockSpeed' && <section className="recipe-modal-section">
                <h3>Overclock</h3>
                <p>Use the below fields to adjust the clock speed based on the consumption or production of items.</p>
                    <div className="recipe-modal-row">
                        <div className="recipe-modal-column">
                            <h4>Multiplier</h4>
                            <div className={`input-group ${state.clockSpeed > 2.5 ? 'error' : ''}`}>
                                <div className="input-label">
                                    <PiGauge />
                                </div>
                                <input
                                    type="text"
                                    max="250"
                                    value={format(state.clockSpeed * 100)}
                                    onChange={e => dispatch({'type': 'set_overclock_percent', value: e.target.value})} 
                                />
                                <div className="input-unit">%</div>
                            </div>
                        </div>
                        <div className="recipe-modal-column">
                            <h4>Ingredients</h4>
                            {ingredients.map(ingredient => (
                                <div key={ingredient.name} className={`input-group ${state['ingredients'][ingredient.name] > maxes['ingredients'][ingredient.name] ? 'error' : ''}`}>
                                    <div className="input-label">
                                        <ItemImage item={getItem(ingredient.name)} />
                                    </div>
                                    <input
                                        type="text"
                                        value={state['ingredients'][ingredient.name]} 
                                        onChange={e => dispatch({type: 'set_overclock_by_item', value: e.target.value, source: 'ingredients', item: ingredient.name })}
                                    />
                                    <div className="input-unit">/min</div>
                                </div>
                            ))}
                        </div>
                        <div className="recipe-modal-column">
                            <h4>Products</h4>
                            {products.map(product => (
                                <div key={product.name} className="input-group">
                                    <div className="input-label">
                                        <ItemImage item={getItem(product.name)} />
                                    </div>
                                    <input
                                        type="text"
                                        value={state['products'][product.name]} 
                                        onChange={e => dispatch({type: 'set_overclock_by_item', value: e.target.value, source: 'products', item: product.name })}
                                    />
                                    <div className="input-unit">/min</div>
                                </div>
                            ))}
                        </div>
                        <div className="recipe-modal-column">
                            <h4>Power</h4>
                            <div className="input-group">
                                <div className="input-label">
                                    <BsLightning />
                                </div>
                                <input type="text" readOnly value={round(state.energyUsage, 1)} />
                                <div className="input-unit">MW</div>
                            </div>
                        </div>
                </div>
            </section> }
        </Modal>
    )
}