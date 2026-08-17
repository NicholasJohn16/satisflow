import { describe, expect, it } from 'vitest';
import {
    getClockSpeedForResourceOutput,
    getResourceNodeData,
    getResourceNodeDataForOutput,
    RESOURCE_NODE_EXTRACTORS,
    RESOURCE_NODE_MINERS,
    RESOURCE_NODE_QUALITIES,
    RESOURCE_NODE_RESOURCES,
} from './resourceNodes';

describe('resource nodes', () => {
    it('uses normal purity and Miner Mk.3 by default', () => {
        expect(RESOURCE_NODE_MINERS[3]).toMatchObject({ width: 6, length: 14 });
        expect(getResourceNodeData('Desc_OreIron_C')).toEqual({
            clockSpeed: 1,
            energyUsage: 45,
            ingredients: {},
            machineCount: 1,
            minerTier: '3',
            products: { Desc_OreIron_C: 240 },
            quality: 'normal',
            resource: 'Desc_OreIron_C',
        });
    });

    it('sets extraction output from node quality', () => {
        expect(RESOURCE_NODE_QUALITIES).toMatchObject({
            impure: { amount: 30 },
            normal: { amount: 60 },
            pure: { amount: 120 },
        });
        expect(getResourceNodeData('Desc_Coal_C', 'pure', { minerTier: 1 }).products).toEqual({
            Desc_Coal_C: 120,
        });
    });

    it('applies miner tier and overclocking', () => {
        expect(RESOURCE_NODE_MINERS[3].multiplier).toBe(4);
        expect(getResourceNodeData('Desc_OreIron_C', 'pure', {
            clockSpeed: 2.5,
            minerTier: 3,
        })).toMatchObject({
            clockSpeed: 2.5,
            minerTier: '3',
            products: { Desc_OreIron_C: 1200 },
        });
    });

    it('computes clock speed from a desired output and caps it at 250%', () => {
        expect(getClockSpeedForResourceOutput(480, 240)).toBe(2);
        expect(getClockSpeedForResourceOutput(1000, 240)).toBe(2.5);
    });

    it('sizes a resource node to match a requested output', () => {
        expect(getResourceNodeDataForOutput('Desc_OreIron_C', 300)).toMatchObject({
            clockSpeed: 0.625,
            machineCount: 2,
            products: { Desc_OreIron_C: 300 },
        });
    });

    it('calculates extractor power from tier and clock speed', () => {
        expect(getResourceNodeData('Desc_OreIron_C', 'normal', {
            clockSpeed: 2,
            minerTier: 2,
        }).energyUsage).toBe(37.5);
        expect(getResourceNodeData('Desc_NitrogenGas_C').energyUsage).toBe(150);
    });

    it('scales extraction output and power by the number of machines', () => {
        expect(getResourceNodeData('Desc_OreIron_C', 'normal', {
            machineCount: 3,
            minerTier: 3,
        })).toMatchObject({
            energyUsage: 135,
            machineCount: 3,
            products: { Desc_OreIron_C: 720 },
        });
    });

    it('contains raw mineral and gas node resources', () => {
        expect(RESOURCE_NODE_RESOURCES).toContain('Desc_SAM_C');
        expect(RESOURCE_NODE_RESOURCES).toContain('Desc_OreUranium_C');
        expect(RESOURCE_NODE_RESOURCES).toContain('Desc_NitrogenGas_C');
        expect(getResourceNodeData('Desc_NitrogenGas_C', 'pure', {
            clockSpeed: 2.5,
            minerTier: 3,
        })).toMatchObject({
            minerTier: 'well',
            products: { Desc_NitrogenGas_C: 300 },
        });
    });

    it('uses a Water Extractor for water resource nodes', () => {
        expect(RESOURCE_NODE_RESOURCES).toContain('Desc_Water_C');
        const waterNode = getResourceNodeData('Desc_Water_C', 'pure', {
            clockSpeed: 2.5,
            minerTier: 1,
        });

        expect(waterNode).toMatchObject({
            clockSpeed: 2.5,
            minerTier: 'water',
            products: { Desc_Water_C: 300 },
            quality: 'normal',
        });
        expect(waterNode.energyUsage).toBeCloseTo(67.2, 1);
    });

    it('uses an Oil Extractor for Crude Oil resource nodes', () => {
        expect(RESOURCE_NODE_RESOURCES).toContain('Desc_LiquidOil_C');
        expect(RESOURCE_NODE_EXTRACTORS.oil.image).toBe('./img/Oil_Extractor.png');
        expect(getResourceNodeData('Desc_LiquidOil_C', 'normal')).toMatchObject({
            energyUsage: 40,
            minerTier: 'oil',
            products: { Desc_LiquidOil_C: 120 },
        });
    });
});
