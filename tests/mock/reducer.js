import data from '../../src/data.json';
const { recipes } = data;

/**
 * [
 *  { // state },
 *  { // action },
 *  { // expected }
 * ]
 */

export const reducerMockData = [
    [
        'sets overclock rate',
        { recipe: recipes['Recipe_SpaceElevatorPart_12_C'] },
        { type: 'set_overclock_percent', value: "110" },
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
            clockSpeed: 1.1,
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
    ], [
        'sets machine count',
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
            machineCount: 1,
        },
        { type: 'set_machine_count', value: "2" },
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
            clockSpeed: 1,
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
    ], [
        'rounds down machine count',
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
            machineCount: 1,
        },
        { type: 'set_machine_count', value: "2.5" },
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
            clockSpeed: 1,
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
    ], [
        'doesn\'t update with decimals when setting overclock by item',
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
            machineCount: 1,
            clockSpeed: 1,
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
        },
        { 
            type: 'set_overclock_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: "6."
        },
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
            clockSpeed: 1,
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
    ], [
        'doesn\'t update with decimals when setting machineCount by item',
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
            machineCount: 1,
            clockSpeed: 1,
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
        },
        { 
            type: 'set_machine_count_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: "6."
        },
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
            clockSpeed: 1,
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
    ], [
        'doesn\'t update when value = 0 when setting overclock by item',
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
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
        },
        { 
            type: 'set_overclock_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: ""
        },
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
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
        }
    ], [
        'doesn\'t update when value = 0 when setting machineCount by item',
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
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
        },
        { 
            type: 'set_machine_count_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: ""
        },
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
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
        }
    ], [
        'updates overclock rate by setting item',
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
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
        },
        { 
            type: 'set_overclock_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: "6"
        },
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
            clockSpeed: 1.5,
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
        }
    ], [
        'updates number of machineCount by setting item',
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
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
        },
        { 
            type: 'set_machine_count_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: "8"
        },
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
            clockSpeed: 1,
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
        }
    ], , [
        'updates number of machineCount and overclock by setting item count',
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
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
        },
        { 
            type: 'set_machine_count_by_item',
            source: 'ingredients',
            item: 'Desc_QuantumOscillator_C',
            value: "6"
        },
        { 
            recipe: recipes['Recipe_SpaceElevatorPart_12_C'],
            clockSpeed: .75,
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
    ]
]