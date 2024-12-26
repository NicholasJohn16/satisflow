import { describe, expect, it } from 'vitest'
import { reducer, totalEnergyUsage } from './functions'
import data from './data.json';
const { recipes } = data;
import { reducerMockData } from '../tests/mock/reducer';



describe('reducer', () => {

    reducerMockData.forEach(([definition, state, action, expected]) => {
        it(definition, () => {
            const result = reducer(state, action);
            expect(result).toStrictEqual(expected);
        });
    });

});

describe('totalEnergyUsage', () => {

    it('calculates the power usage', () => {
        const machine = { powerUsage: 55, somersloopSlots: 4 };
        const state = { machineCount: 1, clockSpeed: 1, amplification: 0 };
        const result = totalEnergyUsage(machine, state);
    
        expect(result).toBe(55);
    });

    it('calculates the power of multiple machines', () => {
        const machine = { powerUsage: 4, somersloopSlots: 4 };
        const state = { machineCount: 2, clockSpeed: 1, amplification: 0 };
        const result = totalEnergyUsage(machine, state);
    
        expect(result).toBe(8);
    });

    [[1.5, 6.8], [2, 10], [2.5, 13.4]].forEach(([clockSpeed, expected]) => {
        it(`calculates the power usage when ${clockSpeed*100}% clockSpeed`, () => {
            const machine = { powerUsage: 4, somersloopSlots: 4 };
            const state = { machineCount: 1, clockSpeed: clockSpeed, amplification: 0 };
            const result = totalEnergyUsage(machine, state);
        
            expect(result).toBeCloseTo(expected, 1);
        })
    });

    [[1, 85.9], [2, 123.8], [3, 168.4], [4, 220]].forEach(([somersloopCount, expected]) => {
        it(`amplification: calculates power correctly when using ${somersloopCount} somersloops`, () => {
            const machine = { powerUsage: 55, somersloopSlots: 4 };
            const state = { machineCount: 1, clockSpeed: 1, amplification: somersloopCount };
            const result = totalEnergyUsage(machine, state);
            expect(result).toBeCloseTo(expected, 1);
        });
    });
});