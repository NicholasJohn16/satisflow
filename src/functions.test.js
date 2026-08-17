import { describe, expect, it } from 'vitest'
import { getShapeForItemAmount, reducer, totalEnergyUsage } from './functions'
import data from './data.json';
const { recipes, constructors } = data;

describe('reducer', () => {
    const recipe = recipes['Recipe_SpaceElevatorPart_12_C'];
    const factory = constructors[recipe.producedIn];

    it('stores a connector layout per recipe node', () => {
        const result = reducer({
            recipe,
            factory,
            machineCount: 1,
            clockSpeed: 1,
            amplification: 0,
        }, {
            type: 'set_connector_layout',
            value: 'horizontal',
        });

        expect(result.connectorLayout).toBe('horizontal');
    });

    it('sets overclock rate', () => {
        const state = { recipe, factory };
        const action = { type: 'set_overclock_percent', value: "110" };

        const expected = { 
            recipe,
            factory,
            clockSpeed: 1.1,
            energyUsage: 1134.2744601950412,
            ingredients: {
                Desc_QuantumEnergy_C: 110000,
                Desc_QuantumOscillator_C: 4.4,
                Desc_SpaceElevatorPart_6_C: 4.4,
                Desc_TemporalProcessor_C: 4.4,
            },
            products: {
                Desc_DarkEnergy_C: 110000,
                Desc_SpaceElevatorPart_12_C: 4.4,
            },
            machineCount: 1,
            amplification: 0,
        }

        const result = reducer(state, action);
        
        expect(result).toStrictEqual(expected);
    });

    it('sets machine count', () => {
        const state = { recipe, factory, machineCount: 1 };
        const action = { type: 'set_machine_count', value: "2" };

        const expected = { 
            recipe,
            factory,
            clockSpeed: 1,
            energyUsage: 2000,
            ingredients: {
                Desc_QuantumEnergy_C: 200000,
                Desc_QuantumOscillator_C: 8,
                Desc_SpaceElevatorPart_6_C: 8,
                Desc_TemporalProcessor_C: 8,
            },
            products: {
                Desc_DarkEnergy_C: 200000,
                Desc_SpaceElevatorPart_12_C: 8,
            },
            machineCount: 2,
            amplification: 0,
        }

        const result = reducer(state, action);
    
        expect(result).toStrictEqual(expected);
    });

    it('rounds machine counter down', () => {
        const state = { recipe, factory, machineCount: 1 };
        const action = { type: 'set_machine_count', value: "2.5" };

        const expected = { 
            recipe,
            factory,
            clockSpeed: 1,
            energyUsage: 2000,
            ingredients: {
                Desc_QuantumEnergy_C: 200000,
                Desc_QuantumOscillator_C: 8,
                Desc_SpaceElevatorPart_6_C: 8,
                Desc_TemporalProcessor_C: 8,
            },
            products: {
                Desc_DarkEnergy_C: 200000,
                Desc_SpaceElevatorPart_12_C: 8,
            },
            machineCount: 2,
            amplification: 0,
        }

        const result = reducer(state, action);
    
        expect(result).toStrictEqual(expected);
    });

    it('doesn\'t update with decimals when setting overclock by item', () => {
        const state = { 
            recipe,
            factory,
            machineCount: 1,
            clockSpeed: 1,
            amplification: 0,
            energyUsage: 1000,
            ingredients: {
                Desc_QuantumEnergy_C: 100000,
                Desc_QuantumOscillator_C: "6.",
                Desc_SpaceElevatorPart_6_C: 4,
                Desc_TemporalProcessor_C: 4,
            },
            products: {
                Desc_DarkEnergy_C: 100000,
                Desc_SpaceElevatorPart_12_C: 4,
            },
        }
        const action = { 
            type: 'set_overclock_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: "6."
        }
        const expected = { 
            recipe,
            factory,
            clockSpeed: 1,
            energyUsage: 1000,
            ingredients: {
                Desc_QuantumEnergy_C: 100000,
                Desc_QuantumOscillator_C: "6.",
                Desc_SpaceElevatorPart_6_C: 4,
                Desc_TemporalProcessor_C: 4,
            },
            products: {
                Desc_DarkEnergy_C: 100000,
                Desc_SpaceElevatorPart_12_C: 4,
            },
            machineCount: 1,
            amplification: 0,
        }

        const result = reducer(state, action);

        expect(result).toStrictEqual(expected);
    });

    it('doesn\'t update with decimals when setting machineCount by item', () => {
        const state = { 
            recipe,
            factory,
            machineCount: 1,
            clockSpeed: 1,
            energyUsage: 1000,
            amplification: 0,
            ingredients: {
                Desc_QuantumEnergy_C: 100000,
                Desc_QuantumOscillator_C: "6.",
                Desc_SpaceElevatorPart_6_C: 4,
                Desc_TemporalProcessor_C: 4,
            },
            products: {
                Desc_DarkEnergy_C: 100000,
                Desc_SpaceElevatorPart_12_C: 4,
            },
        };
        const action = { 
            type: 'set_machine_count_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: "6."
        };
        const expected = { 
            recipe,
            factory,
            clockSpeed: 1,
            energyUsage: 1000,
            ingredients: {
                Desc_QuantumEnergy_C: 100000,
                Desc_QuantumOscillator_C: "6.",
                Desc_SpaceElevatorPart_6_C: 4,
                Desc_TemporalProcessor_C: 4,
            },
            products: {
                Desc_DarkEnergy_C: 100000,
                Desc_SpaceElevatorPart_12_C: 4,
            },
            machineCount: 1,
            amplification: 0,
        };

        const result = reducer(state, action);

        expect(result).toStrictEqual(expected);
    });

    it('doesn\'t update when value = 0 when setting overclock by item', () => {
        const state = { 
            recipe,
            factory,
            machineCount: 1,
            clockSpeed: 1,
            amplification: 0,
            energyUsage: 1000,
            ingredients: {
                Desc_QuantumEnergy_C: 100000,
                Desc_QuantumOscillator_C: 4,
                Desc_SpaceElevatorPart_6_C: 4,
                Desc_TemporalProcessor_C: 4,
            },
            products: {
                Desc_DarkEnergy_C: 100000,
                Desc_SpaceElevatorPart_12_C: 4,
            },
        };
        const action = { 
            type: 'set_overclock_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: ""
        };
        const expected = { 
            recipe,
            factory,
            clockSpeed: 1,
            energyUsage: 1000,
            ingredients: {
                Desc_QuantumEnergy_C: 100000,
                Desc_QuantumOscillator_C: "",
                Desc_SpaceElevatorPart_6_C: 4,
                Desc_TemporalProcessor_C: 4,
            },
            products: {
                Desc_DarkEnergy_C: 100000,
                Desc_SpaceElevatorPart_12_C: 4,
            },
            machineCount: 1,
            amplification: 0,
        };

        const result = reducer(state, action);

        expect(result).toStrictEqual(expected);
    });
    it('doesn\'t update when value = 0 when setting machineCount by item', () => {
        const state = { 
            recipe,
            factory,
            machineCount: 1,
            clockSpeed: 1,
            amplification: 0,
            ingredients: {
                Desc_QuantumEnergy_C: 100000,
                Desc_QuantumOscillator_C: 4,
                Desc_SpaceElevatorPart_6_C: 4,
                Desc_TemporalProcessor_C: 4,
            },
            products: {
                Desc_DarkEnergy_C: 100000,
                Desc_SpaceElevatorPart_12_C: 4,
            },
        };
        const action = { 
            type: 'set_machine_count_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: ""
        };
        const expected = { 
            recipe,
            factory,
            clockSpeed: 1,
            ingredients: {
                Desc_QuantumEnergy_C: 100000,
                Desc_QuantumOscillator_C: "",
                Desc_SpaceElevatorPart_6_C: 4,
                Desc_TemporalProcessor_C: 4,
            },
            products: {
                Desc_DarkEnergy_C: 100000,
                Desc_SpaceElevatorPart_12_C: 4,
            },
            machineCount: 1,
            amplification: 0,
        };
        const result = reducer(state, action);

        expect(result).toStrictEqual(expected);
    });

    it('updates overclock rate by setting item', () => {
        const state = { 
            recipe,
            factory,
            machineCount: 1,
            clockSpeed: 1,
            amplification: 0,
            ingredients: {
                Desc_QuantumEnergy_C: 100000,
                Desc_QuantumOscillator_C: 4,
                Desc_SpaceElevatorPart_6_C: 4,
                Desc_TemporalProcessor_C: 4,
            },
            products: {
                Desc_DarkEnergy_C: 100000,
                Desc_SpaceElevatorPart_12_C: 4,
            },
        }
        const action = { 
            type: 'set_overclock_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: "6"
        };
        const expected = { 
            recipe,
            factory,
            clockSpeed: 1.5,
            energyUsage: 1709.1492257497375,
            ingredients: {
                Desc_QuantumEnergy_C: 150000,
                Desc_QuantumOscillator_C: "6",
                Desc_SpaceElevatorPart_6_C: 6,
                Desc_TemporalProcessor_C: 6,
            },
            products: {
                Desc_DarkEnergy_C: 150000,
                Desc_SpaceElevatorPart_12_C: 6,
            },
            machineCount: 1,
            amplification: 0,
        };
        const result = reducer(state, action);

        expect(result).toStrictEqual(expected);
    });

    it('updates number of machineCount by setting item', () => {
        const state = { 
            recipe,
            factory,
            machineCount: 1,
            clockSpeed: 1,
            amplification: 0,
            ingredients: {
                Desc_QuantumEnergy_C: 100000,
                Desc_QuantumOscillator_C: 4,
                Desc_SpaceElevatorPart_6_C: 4,
                Desc_TemporalProcessor_C: 4,
            },
            products: {
                Desc_DarkEnergy_C: 100000,
                Desc_SpaceElevatorPart_12_C: 4,
            },
        };
        const action = { 
            type: 'set_machine_count_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: "8"
        };
        const expected = { 
            recipe,
            factory,
            clockSpeed: 1,
            energyUsage: 2000,
            ingredients: {
                Desc_QuantumEnergy_C: 200000,
                Desc_QuantumOscillator_C: "8",
                Desc_SpaceElevatorPart_6_C: 8,
                Desc_TemporalProcessor_C: 8,
            },
            products: {
                Desc_DarkEnergy_C: 200000,
                Desc_SpaceElevatorPart_12_C: 8,
            },
            machineCount: 2,
            amplification: 0,
        };
        const result = reducer(state, action);

        expect(result).toStrictEqual(expected);
    });

    it('updates number of machineCount and overclock by setting item count', () => {
        const state = { 
            recipe,
            factory,
            machineCount: 1,
            clockSpeed: 1,
            amplification: 0,
            ingredients: {
                Desc_QuantumEnergy_C: 100000,
                Desc_QuantumOscillator_C: 4,
                Desc_SpaceElevatorPart_6_C: 4,
                Desc_TemporalProcessor_C: 4,
            },
            products: {
                Desc_DarkEnergy_C: 100000,
                Desc_SpaceElevatorPart_12_C: 4,
            },
        };
        const action = { 
            type: 'set_machine_count_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: "6"
        };
        const expected = { 
            recipe,
            factory,
            clockSpeed: .75,
            energyUsage: 1367.31938059979,
            ingredients: {
                Desc_QuantumEnergy_C: 150000,
                Desc_QuantumOscillator_C: "6",
                Desc_SpaceElevatorPart_6_C: 6,
                Desc_TemporalProcessor_C: 6,
            },
            products: {
                Desc_DarkEnergy_C: 150000,
                Desc_SpaceElevatorPart_12_C: 6,
            },
            machineCount: 2,
            amplification: 0,
        }

        const result = reducer(state, action);

        expect(result).toStrictEqual(expected);
    });

});

describe('getShapeForItemAmount', () => {
    it('sizes and clocks a recipe to match a connector amount', () => {
        const recipe = recipes['Recipe_SpaceElevatorPart_12_C'];
        const factory = constructors[recipe.producedIn];
        const result = getShapeForItemAmount({
            recipe,
            factory,
            source: 'products',
            item: 'Desc_SpaceElevatorPart_12_C',
            amount: 6,
        });

        expect(result).toMatchObject({
            clockSpeed: 0.75,
            machineCount: 2,
            products: { Desc_SpaceElevatorPart_12_C: 6 },
        });
    });
});

describe('totalEnergyUsage', () => {

    it('calculates the power usage', () => {
        const factory = { powerUsage: 55, somersloopSlots: 4 };
        const state = { machineCount: 1, clockSpeed: 1, amplification: 0, factory };
        const result = totalEnergyUsage(state);
    
        expect(result).toBe(55);
    });

    it('calculates the power of multiple machines', () => {
        const factory = { powerUsage: 4, somersloopSlots: 4 };
        const state = { machineCount: 2, clockSpeed: 1, amplification: 0, factory };
        const result = totalEnergyUsage(state);
    
        expect(result).toBe(8);
    });

    [[1.5, 6.8], [2, 10], [2.5, 13.4]].forEach(([clockSpeed, expected]) => {
        it(`calculates the power usage when ${clockSpeed*100}% clockSpeed`, () => {
            const factory = { powerUsage: 4, somersloopSlots: 4 };
            const state = { machineCount: 1, clockSpeed: clockSpeed, amplification: 0, factory };
            const result = totalEnergyUsage(state);
        
            expect(result).toBeCloseTo(expected, 1);
        })
    });

    [[1, 85.9], [2, 123.8], [3, 168.4], [4, 220]].forEach(([somersloopCount, expected]) => {
        it(`amplification: calculates power correctly when using ${somersloopCount} somersloops`, () => {
            const factory = { powerUsage: 55, somersloopSlots: 4 };
            const state = { machineCount: 1, clockSpeed: 1, amplification: somersloopCount, factory };
            const result = totalEnergyUsage(state);
            expect(result).toBeCloseTo(expected, 1);
        });
    });
});
