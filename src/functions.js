import { merge } from "lodash";
import { Decimal } from 'decimal.js';

function getShape({recipe, factory, machineCount = 1, clockSpeed = 1, amplification = 0}) {
    const shape = {recipe, factory, ingredients: {}, products: {}, clockSpeed, amplification, machineCount};

    shape.energyUsage = totalEnergyUsage(shape);

    Object.values(recipe.ingredients).forEach((ingredient) => {
        shape.ingredients[ingredient.name] = new Decimal(getItemsPerMinute(ingredient.amount, recipe.duration)).times(clockSpeed).times(machineCount).toNumber();
    });
    
    Object.values(recipe.products).forEach((product) => {
        const amplified = (amplification / factory.somersloopSlots) + 1 || 1;
        shape.products[product.name] =  new Decimal(getItemsPerMinute(product.amount, recipe.duration))
                                            .times(clockSpeed)
                                            .times(machineCount)
                                            .times(amplified)
                                            .toNumber();
    });

    return shape;
}

const getItemsPerMinute = (amount, duration) => (60/duration) * amount;
const totalEnergyUsage = ({machineCount, clockSpeed, amplification, factory: { powerUsage, somersloopSlots}}) => {
    const powerMultiplier = !somersloopSlots ? 1 : (1 + (amplification / somersloopSlots)) ** 2;
    const overclockPower = clockSpeed ** (Math.log(2.5) / Math.log(2));
    return machineCount * powerUsage * powerMultiplier * overclockPower ;
};

function reducer(state, action) {
    const newState = { 
        recipe: state.recipe,
        factory: state.factory,
        clockSpeed: state.clockSpeed,
        machineCount: state.machineCount,
        amplification: state.amplification,
    };

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
            newState.amplification = parseInt(action.value);
            break;
    }

    const baseObject = getShape({
        recipe: newState.recipe,
        factory: newState.factory,
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