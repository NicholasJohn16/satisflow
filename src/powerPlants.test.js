import { describe, expect, it } from 'vitest';
import {
    getClockSpeedForPowerPlantFuel,
    getPowerPlantData,
    getPowerPlantDataForFuelAmount,
    getPowerPlantFuelForResource,
    getPowerPlantFuelIds,
    isPowerPlantFuel,
    POWER_PLANTS,
} from './powerPlants';

describe('power plants', () => {
    it('builds a coal generator with fuel and water inputs', () => {
        expect(POWER_PLANTS.coal).toMatchObject({ width: 10, length: 26 });
        expect(getPowerPlantData()).toEqual({
            clockSpeed: 1,
            energyProduction: 75,
            fuel: 'coal',
            ingredients: {
                Desc_Coal_C: 15,
                Desc_Water_C: 45,
            },
            machineCount: 1,
            plantType: 'coal',
            products: {},
        });
    });

    it('scales generator inputs and power linearly', () => {
        expect(getPowerPlantData('fuel', 'rocketFuel', {
            clockSpeed: 2,
            machineCount: 3,
        })).toMatchObject({
            energyProduction: 1500,
            ingredients: { Desc_RocketFuel_C: 25 },
        });
    });

    it('adds nuclear waste for fuels that produce it', () => {
        expect(getPowerPlantData('nuclear', 'uranium')).toMatchObject({
            energyProduction: 2500,
            ingredients: {
                Desc_NuclearFuelRod_C: 0.2,
                Desc_Water_C: 240,
            },
            products: { Desc_NuclearWaste_C: 10 },
        });
        expect(getPowerPlantData('nuclear', 'ficsonium').products).toEqual({});
    });

    it('caps generator overclocking at 250 percent', () => {
        expect(getPowerPlantData('coal', 'coal', { clockSpeed: 10 })).toMatchObject({
            clockSpeed: 2.5,
            energyProduction: 187.5,
        });
    });

    it('computes clock speed from the supplied fuel and caps it at 250 percent', () => {
        expect(getClockSpeedForPowerPlantFuel(30, 15)).toBe(2);
        expect(getClockSpeedForPowerPlantFuel(100, 15)).toBe(2.5);
    });

    it('lists the supported fuels for a plant', () => {
        expect(getPowerPlantFuelIds('nuclear')).toEqual([
            'uranium',
            'plutonium',
            'ficsonium',
        ]);
    });

    it('recognizes resources supported by power plants', () => {
        expect(isPowerPlantFuel('Desc_LiquidFuel_C')).toBe(true);
        expect(isPowerPlantFuel('Desc_IronPlate_C')).toBe(false);
        expect(getPowerPlantFuelForResource('Desc_CompactedCoal_C')).toMatchObject({
            fuelId: 'compactedCoal',
            plantType: 'coal',
        });
    });

    it('sizes power plants to consume an entire fuel stream at up to 250 percent', () => {
        expect(getPowerPlantDataForFuelAmount('Desc_Coal_C', 100)).toMatchObject({
            clockSpeed: 100 / 45,
            fuel: 'coal',
            ingredients: { Desc_Coal_C: 100, Desc_Water_C: 300 },
            machineCount: 3,
            plantType: 'coal',
        });
        expect(getPowerPlantDataForFuelAmount('Desc_LiquidFuel_C', 50)).toMatchObject({
            clockSpeed: 2.5,
            ingredients: { Desc_LiquidFuel_C: 50 },
            machineCount: 1,
            plantType: 'fuel',
        });
        expect(getPowerPlantDataForFuelAmount('Desc_IronPlate_C', 10)).toBeNull();
    });
});
