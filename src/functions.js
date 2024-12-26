import { merge } from "lodash";
import { Decimal } from 'decimal.js';

function getShape({recipe, machineCount = 1, clockSpeed = 1, amplification = 0}) {
    const shape = {recipe, ingredients: {}, products: {}, clockSpeed, amplification, machineCount};

    Object.values(recipe.ingredients).forEach((ingredient) => {
        shape.ingredients[ingredient.name] = new Decimal(getItemsPerMinute(ingredient.amount, recipe.duration)).times(clockSpeed).times(machineCount).toNumber();
    });
    
    Object.values(recipe.products).forEach((product) => {
        const amplification = 
        shape.products[product.name] =  new Decimal(getItemsPerMinute(product.amount, recipe.duration))
                                            .times(clockSpeed)
                                            .times(machineCount)
                                            .toNumber();
    });

    return shape;
}

const getItemsPerMinute = (amount, duration) => (60/duration) * amount;
const totalEnergyUsage = ({ powerUsage, somersloopSlots}, {machineCount, clockSpeed, amplification}) => {
    const powerMultiplier = !somersloopSlots ? 1 : (1 + (amplification / somersloopSlots)) ** 2;
    const overclockPower = clockSpeed ** (Math.log(2.5) / Math.log(2));
    return machineCount * powerUsage * powerMultiplier * overclockPower ;
};

function reducer(state, action) {
    const newState = { 
        recipe: state.recipe,
        clockSpeed: state.clockSpeed,
        machineCount: state.machineCount,
        amplification: state.amplification
    };

    console.log(action);

    if(action.value < 0) return state;
    if(action.type === 'set_overclock_percent' && action.value > 250) {
        return state;
    }

    switch(action.type) {
        case 'set_overclock_by_item': 
        case 'set_machine_count_by_item':
            if(!Object.hasOwn(newState, action.source)) newState[action.source] = {};
            newState[action.source][action.item] = action.value;
            break;
    }

    if(typeof action.value === 'string' && (action.value.at(-1) === '.' || !action.value)) {
        return merge({}, state, newState);
    }

    switch (action.type) {
        case 'set_machine_count':
            newState.machineCount = parseInt(action.value);
            break;
        case 'set_overclock_percent':
            newState.clockSpeed = parseFloat(action.value) / 100;
            break;
        case 'set_overclock_by_item':
            newState.clockSpeed = getOverclockByItems(state, action);
            console.log(newState.clockSpeed, 'newState.clockSpeed');
            break;
        case 'set_machine_count_by_item':
            const itemsPerMinute = getItemsPerMinute(state.recipe[action.source][action.item].amount, state.recipe.duration);
            newState.machineCount = Math.ceil(action.value / itemsPerMinute);
            newState.clockSpeed = action.value / (itemsPerMinute * newState.machineCount);
            break;
        case 'set_amplification':
            newState.amplification = action.value;
            break;
    }

    const baseObject = getShape({
        recipe: state.recipe,
        clockSpeed: newState.clockSpeed,
        amplification: newState.amplification,
        machineCount: newState.machineCount
    });

    return merge({}, baseObject, newState);
}

const getOverclockByItems = ({recipe, machineCount}, {source, item, value}) => {
    const parsedValue = parseFloat(value);
    const baseProduction = machineCount * getItemsPerMinute(recipe[source][item].amount, recipe.duration);
    const overclockPercent = parsedValue / baseProduction;
    return overclockPercent;
}

export { getShape, reducer, getOverclockByItems, getItemsPerMinute, totalEnergyUsage };