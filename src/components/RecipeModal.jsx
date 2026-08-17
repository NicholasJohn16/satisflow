import Modal from "react-modal";
import { useModal } from '../contexts/modal';
import { useData } from "../contexts/data";
import ItemImage from "./ItemImage";
import { MdOutlineRemove, MdAdd } from "react-icons/md";
import { PiGauge, PiFactory } from "react-icons/pi";
import { useReducer, useState  } from "react";
import { getShape, reducer } from "../functions";
import { BsLightning } from "react-icons/bs";
import { round } from "lodash";
import { useReactFlow } from "@xyflow/react";
import { getFactoryImagePath } from '../factoryImages';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    //   backgroundColor: '#000',
        borderRadius: '.5rem',
        boxSizing: 'border-box',
        maxHeight: 'calc(100vh - 2rem)',
        overflowX: 'hidden',
        width: 'min(52rem, calc(100vw - 2rem))',
    }
};

function FactoryVisual({ factory, imagePath, className }) {
    return imagePath ? (
        <img
            alt={factory.name}
            className={className}
            draggable="false"
            src={imagePath}
        />
    ) : (
        <PiFactory aria-label={factory.name} className={className} />
    );
}

export default function RecipeModal() {
    const { isOpen, closeModal, node, setNode } = useModal();
    const { items, constructors } = useData();
    const recipe = node.data.recipe;
    const ingredients = Object.values(recipe.ingredients);
    const products = Object.values(recipe.products);
    const factory = constructors[recipe.producedIn];
    const factoryImagePath = getFactoryImagePath(factory);
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
            <header className="recipe-editor__header">
                <div className="recipe-editor__factory-visual">
                    <FactoryVisual
                        className="recipe-editor__factory-image"
                        factory={factory}
                        imagePath={factoryImagePath}
                    />
                </div>
                <div className="recipe-editor__heading">
                    <h2>Edit Recipe</h2>
                    <strong>{recipe.displayName}</strong>
                    <span>{factory.name}</span>
                </div>
                <div className="recipe-editor__power" title="Power consumption">
                    <BsLightning aria-hidden="true" />
                    <strong>{round(state.energyUsage, 1)} MW</strong>
                </div>
            </header>

            <div className="recipe-modal-row recipe-editor__quick-controls">
                <div className="recipe-modal-column">
                    <div className="input-group">
                        <div className="input-label">
                            <FactoryVisual
                                className="recipe-editor__input-factory-image"
                                factory={factory}
                                imagePath={factoryImagePath}
                            />
                        </div>
                        <input
                            aria-label="Number of machines"
                            type="text"
                            value={state.machineCount}
                            onChange={e => dispatch({'type': 'set_machine_count', value: e.target.value})}
                        />
                        <button
                            aria-label="Add machine"
                            className="input-increase"
                            onClick={() => dispatch({'type': 'set_machine_count', value: state.machineCount + 1})}
                            type="button"
                        >
                            <MdAdd />
                        </button>
                        <button
                            aria-label="Remove machine"
                            className="input-decrease"
                            onClick={() => dispatch({'type': 'set_machine_count', value: state.machineCount - 1})}
                            type="button"
                        >
                            <MdOutlineRemove />
                        </button>
                    </div>
                </div>
                <div className="recipe-modal-column">
                    <div className={`input-group ${state.clockSpeed > 2.5 ? 'error' : ''}`}>
                        <div className="input-label"><PiGauge /></div>
                        <input
                            aria-label="Clock speed percentage"
                            max="250"
                            type="text"
                            value={format(state.clockSpeed * 100)}
                            onChange={e => dispatch({'type': 'set_overclock_percent', value: e.target.value})}
                        />
                        <div className="input-unit">%</div>
                    </div>
                </div>
                <div className="recipe-modal-column">
                    <select
                        aria-label="Amplification"
                        className="amplification-select"
                        disabled={!somersloopSlots.length}
                        value={state.amplification}
                        onChange={e => dispatch({'type': 'set_amplification', value: e.target.value})}
                    >
                        {!somersloopSlots.length && <option value="">Amplification Not Supported</option>}
                        {!!somersloopSlots.length && <option value={0}>No Amplification</option>}
                        {somersloopSlots.map((count) => (
                            <option key={count} value={count}>{count} Somersloops</option>
                        ))}
                    </select>
                </div>
            </div>

            <div aria-label="Recipe adjustment mode" className="recipe-editor__tabs" role="tablist">
                <button
                    aria-controls="recipe-machine-panel"
                    aria-selected={tab === 'machine'}
                    className="recipe-editor__tab"
                    id="recipe-machine-tab"
                    onClick={() => setTab('machine')}
                    role="tab"
                    type="button"
                >
                    Machine
                </button>
                <button
                    aria-controls="recipe-overclock-panel"
                    aria-selected={tab === 'overclock'}
                    className="recipe-editor__tab"
                    id="recipe-overclock-tab"
                    onClick={() => setTab('overclock')}
                    role="tab"
                    type="button"
                >
                    Overclock
                </button>
            </div>

            {tab === 'machine' && (
                <section
                    aria-labelledby="recipe-machine-tab"
                    className="recipe-modal-section recipe-editor__panel"
                    id="recipe-machine-panel"
                    role="tabpanel"
                >
                    <p>Adjust the number of machines directly or from a target input or output rate.</p>
                    <div className="recipe-modal-row">
                        <div className="recipe-modal-column">
                            <h4>Machines</h4>
                            <div className="input-group">
                                <div className="input-label">
                                    <FactoryVisual
                                        className="recipe-editor__input-factory-image"
                                        factory={factory}
                                        imagePath={factoryImagePath}
                                    />
                                </div>
                                <input
                                    aria-label="Number of machines"
                                    type="text"
                                    value={state.machineCount}
                                    onChange={e => dispatch({'type': 'set_machine_count', value: e.target.value})}
                                />
                                <button
                                    aria-label="Add machine"
                                    className="input-increase"
                                    onClick={() => dispatch({'type': 'set_machine_count', value: state.machineCount + 1})}
                                    type="button"
                                >
                                    <MdAdd />
                                </button>
                                <button
                                    aria-label="Remove machine"
                                    className="input-decrease"
                                    onClick={() => dispatch({'type': 'set_machine_count', value: state.machineCount - 1})}
                                    type="button"
                                >
                                    <MdOutlineRemove />
                                </button>
                            </div>
                        </div>
                        <div className="recipe-modal-column">
                            <h4>Ingredients</h4>
                            {ingredients.map(ingredient => (
                                <div key={ingredient.name} className="input-group">
                                    <div className="input-label"><ItemImage item={getItem(ingredient.name)} /></div>
                                    <input
                                        aria-label={`${getItem(ingredient.name).displayName} per minute`}
                                        type="text"
                                        value={state.ingredients[ingredient.name]}
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
                                    <div className="input-label"><ItemImage item={getItem(product.name)} /></div>
                                    <input
                                        aria-label={`${getItem(product.name).displayName} per minute`}
                                        type="text"
                                        value={state.products[product.name]}
                                        onChange={e => dispatch({type: 'set_machine_count_by_item', value: e.target.value, source: 'products', item: product.name })}
                                    />
                                    <div className="input-unit">/min</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {tab === 'overclock' && (
                <section
                    aria-labelledby="recipe-overclock-tab"
                    className="recipe-modal-section recipe-editor__panel"
                    id="recipe-overclock-panel"
                    role="tabpanel"
                >
                    <p>Adjust clock speed directly or from a target input or output rate.</p>
                    <div className="recipe-modal-row">
                        <div className="recipe-modal-column">
                            <h4>Clock speed</h4>
                            <div className={`input-group ${state.clockSpeed > 2.5 ? 'error' : ''}`}>
                                <div className="input-label"><PiGauge /></div>
                                <input
                                    aria-label="Clock speed percentage"
                                    max="250"
                                    type="text"
                                    value={format(state.clockSpeed * 100)}
                                    onChange={e => dispatch({'type': 'set_overclock_percent', value: e.target.value})}
                                />
                                <div className="input-unit">%</div>
                            </div>
                        </div>
                        <div className="recipe-modal-column">
                            <h4>Ingredients</h4>
                            {ingredients.map(ingredient => (
                                <div
                                    key={ingredient.name}
                                    className={`input-group ${state.ingredients[ingredient.name] > maxes.ingredients[ingredient.name] ? 'error' : ''}`}
                                >
                                    <div className="input-label"><ItemImage item={getItem(ingredient.name)} /></div>
                                    <input
                                        aria-label={`${getItem(ingredient.name).displayName} per minute`}
                                        type="text"
                                        value={state.ingredients[ingredient.name]}
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
                                    <div className="input-label"><ItemImage item={getItem(product.name)} /></div>
                                    <input
                                        aria-label={`${getItem(product.name).displayName} per minute`}
                                        type="text"
                                        value={state.products[product.name]}
                                        onChange={e => dispatch({type: 'set_overclock_by_item', value: e.target.value, source: 'products', item: product.name })}
                                    />
                                    <div className="input-unit">/min</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </Modal>
    );
}
