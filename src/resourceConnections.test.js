import { describe, expect, it } from 'vitest';
import {
    getFulfillmentColor,
    getInputAssignments,
    getInputFulfillment,
    getNodeProductionRatio,
    getOutputFulfillment,
    getResourceAllocations,
    getResourceSummary,
    getInputHandleId,
    getOutputHandleId,
    isResourceConnectionValid,
} from './resourceConnections';

const makeNode = (id, ingredients = {}, products = {}) => ({
    id,
    data: { ingredients, products },
});

const makeGraph = () => {
    const nodes = new Map([
        ['source', makeNode('source', {}, { coal: 60, iron: 30 })],
        ['source2', makeNode('source2', {}, { coal: 60 })],
        ['target', makeNode('target', { coal: 45, iron: 30 })],
    ]);

    return {
        getNode: (id) => nodes.get(id),
    };
};

describe('resource connections', () => {
    it('swaps unconnected input labels when an export takes over a slot', () => {
        const { getNode } = makeGraph();
        const edges = [{
            source: 'source',
            sourceHandle: getOutputHandleId('source', 'coal'),
            target: 'target',
            targetHandle: getInputHandleId('target', 1),
            data: { resource: 'coal' },
        }];

        expect(getInputAssignments(
            'target',
            { coal: 45, iron: 30 },
            edges,
            getNode,
        )).toEqual([
            {
                amount: 30,
                connected: false,
                handleId: getInputHandleId('target', 0),
                resource: 'iron',
            },
            {
                amount: 45,
                connected: true,
                handleId: getInputHandleId('target', 1),
                resource: 'coal',
            },
        ]);
    });

    it('rejects a second connection for the same resource', () => {
        const { getNode } = makeGraph();
        const edges = [{
            source: 'source',
            sourceHandle: getOutputHandleId('source', 'coal'),
            target: 'target',
            targetHandle: getInputHandleId('target', 0),
            data: { resource: 'coal' },
        }];

        expect(isResourceConnectionValid({
            source: 'source',
            sourceHandle: getOutputHandleId('source', 'coal'),
            target: 'target',
            targetHandle: getInputHandleId('target', 1),
        }, getNode, edges)).toBe(false);
    });

    it('allows several producers of the same resource on one input slot', () => {
        const { getNode } = makeGraph();
        const edges = [{
            source: 'source',
            sourceHandle: getOutputHandleId('source', 'coal'),
            target: 'target',
            targetHandle: getInputHandleId('target', 0),
            data: { resource: 'coal' },
        }];

        expect(isResourceConnectionValid({
            source: 'source2',
            sourceHandle: getOutputHandleId('source2', 'coal'),
            target: 'target',
            targetHandle: getInputHandleId('target', 0),
        }, getNode, edges)).toBe(true);
    });

    it('rejects a different resource on an occupied input slot', () => {
        const { getNode } = makeGraph();
        const edges = [{
            source: 'source',
            sourceHandle: getOutputHandleId('source', 'coal'),
            target: 'target',
            targetHandle: getInputHandleId('target', 1),
            data: { resource: 'coal' },
        }];

        expect(isResourceConnectionValid({
            source: 'source',
            sourceHandle: getOutputHandleId('source', 'iron'),
            target: 'target',
            targetHandle: getInputHandleId('target', 1),
        }, getNode, edges)).toBe(false);
    });

    it('only permits resources consumed by the target recipe', () => {
        const { getNode } = makeGraph();

        expect(isResourceConnectionValid({
            source: 'source',
            sourceHandle: getOutputHandleId('source', 'iron'),
            target: 'target',
            targetHandle: getInputHandleId('target', 0),
        }, getNode, [])).toBe(true);

        expect(isResourceConnectionValid({
            source: 'source',
            sourceHandle: getOutputHandleId('source', 'limestone'),
            target: 'target',
            targetHandle: getInputHandleId('target', 0),
        }, getNode, [])).toBe(false);
    });
});

describe('resource allocation', () => {
    it('summarizes external inputs and only unconsumed final outputs', () => {
        const nodes = [
            makeNode('smelter', { ore: 100 }, { ingot: 10 }),
            makeNode('consumer', { ingot: 4 }),
        ];
        const edges = [
            { id: 'ingot', source: 'smelter', target: 'consumer', data: { resource: 'ingot' } },
        ];
        const summary = getResourceSummary(nodes, edges);

        expect(Object.fromEntries(summary.inputs)).toEqual({ ore: 100 });
        expect(Object.fromEntries(summary.outputs)).toEqual({ ingot: 6 });
        expect(Object.fromEntries(summary.consumed)).toEqual({
            ingot: 4,
            ore: 100,
        });
        expect(Object.fromEntries(summary.produced)).toEqual({ ingot: 10 });
    });

    it('scales all consumed and produced totals to actual factory operation', () => {
        const nodes = [
            makeNode('miner', {}, { ore: 10 }),
            makeNode('smelter', { ore: 100 }, { ingot: 10 }),
            makeNode('consumer', { ingot: 100 }),
        ];
        const edges = [
            { id: 'ore', source: 'miner', target: 'smelter', data: { resource: 'ore' } },
            { id: 'ingot', source: 'smelter', target: 'consumer', data: { resource: 'ingot' } },
        ];
        const summary = getResourceSummary(nodes, edges);

        expect(Object.fromEntries(summary.consumed)).toEqual({ ore: 10, ingot: 1 });
        expect(Object.fromEntries(summary.produced)).toEqual({ ore: 10, ingot: 1 });
    });

    it('summarizes consumed and produced power', () => {
        const nodes = [
            { ...makeNode('constructor'), data: { energyUsage: 12 } },
            { ...makeNode('generator'), data: { energyProduction: 75 } },
            { ...makeNode('legacyGenerator'), data: { energyUsage: -25 } },
        ];
        const summary = getResourceSummary(nodes, []);

        expect(summary.powerConsumed).toBe(12);
        expect(summary.powerProduced).toBe(100);
    });

    it('scales power production to the supplied fuel', () => {
        const nodes = [
            makeNode('fuelSource', {}, { fuel: 5 }),
            {
                ...makeNode('generator', { fuel: 10 }),
                data: {
                    energyProduction: 100,
                    ingredients: { fuel: 10 },
                    products: {},
                },
            },
        ];
        const edges = [{
            id: 'fuel',
            source: 'fuelSource',
            target: 'generator',
            data: { resource: 'fuel' },
        }];

        expect(getResourceSummary(nodes, edges).powerProduced).toBe(50);
    });

    it('omits an output when factories consume all of it', () => {
        const nodes = [
            makeNode('smelter', { ore: 100 }, { ingot: 10 }),
            makeNode('consumer', { ingot: 10 }),
        ];
        const edges = [
            { id: 'ingot', source: 'smelter', target: 'consumer', data: { resource: 'ingot' } },
        ];

        expect(Object.fromEntries(getResourceSummary(nodes, edges).outputs)).toEqual({});
    });

    it('assumes full production when a recipe has no incoming connections', () => {
        const nodes = [
            makeNode('smelter', { ore: 100 }, { ingot: 10 }),
            makeNode('consumer', { ingot: 100 }),
        ];
        const edges = [
            { id: 'ingot', source: 'smelter', target: 'consumer', data: { resource: 'ingot' } },
        ];

        expect(Object.fromEntries(getResourceAllocations(nodes, edges))).toEqual({
            ingot: 10,
        });
    });

    it('scales production and downstream flow to the limiting input', () => {
        const nodes = [
            makeNode('miner', {}, { ore: 10 }),
            makeNode('smelter', { ore: 100 }, { ingot: 10 }),
            makeNode('consumer', { ingot: 100 }),
        ];
        const edges = [
            { id: 'ore', source: 'miner', target: 'smelter', data: { resource: 'ore' } },
            { id: 'ingot', source: 'smelter', target: 'consumer', data: { resource: 'ingot' } },
        ];
        const allocations = getResourceAllocations(nodes, edges);
        const getNode = (id) => nodes.find((node) => node.id === id);

        expect(Object.fromEntries(allocations)).toEqual({
            ore: 10,
            ingot: 1,
        });
        expect(getNodeProductionRatio(
            'smelter',
            { ore: 100 },
            edges,
            allocations,
            getNode,
        )).toBe(0.1);
    });

    it('assumes an unconnected required input is fully supplied', () => {
        const nodes = [
            makeNode('miner', {}, { ore: 100 }),
            makeNode('foundry', { ore: 100, coal: 100 }, { steel: 10 }),
            makeNode('consumer', { steel: 100 }),
        ];
        const edges = [
            { id: 'ore', source: 'miner', target: 'foundry', data: { resource: 'ore' } },
            { id: 'steel', source: 'foundry', target: 'consumer', data: { resource: 'steel' } },
        ];

        expect(Object.fromEntries(getResourceAllocations(nodes, edges))).toEqual({
            ore: 100,
            steel: 10,
        });
    });

    it('uses the lowest connected supply while unconnected inputs remain full', () => {
        const nodes = [
            makeNode('oreMiner', {}, { ore: 50 }),
            makeNode('coalMiner', {}, { coal: 25 }),
            makeNode(
                'foundry',
                { ore: 100, coal: 100, limestone: 100 },
                { steel: 10 },
            ),
            makeNode('consumer', { steel: 100 }),
        ];
        const edges = [
            { id: 'ore', source: 'oreMiner', target: 'foundry', data: { resource: 'ore' } },
            { id: 'coal', source: 'coalMiner', target: 'foundry', data: { resource: 'coal' } },
            { id: 'steel', source: 'foundry', target: 'consumer', data: { resource: 'steel' } },
        ];

        expect(Object.fromEntries(getResourceAllocations(nodes, edges))).toEqual({
            ore: 50,
            coal: 25,
            steel: 2.5,
        });
    });

    it('splits output evenly when every target can accept its share', () => {
        const nodes = [
            makeNode('source', {}, { coal: 100 }),
            makeNode('target1', { coal: 100 }),
            makeNode('target2', { coal: 100 }),
        ];
        const edges = [
            { id: 'edge1', source: 'source', target: 'target1', data: { resource: 'coal' } },
            { id: 'edge2', source: 'source', target: 'target2', data: { resource: 'coal' } },
        ];

        expect(Object.fromEntries(getResourceAllocations(nodes, edges))).toEqual({
            edge1: 50,
            edge2: 50,
        });
    });

    it('caps a small input and redistributes the unused share', () => {
        const nodes = [
            makeNode('source', {}, { coal: 100 }),
            makeNode('smallTarget', { coal: 10 }),
            makeNode('largeTarget', { coal: 100 }),
        ];
        const edges = [
            { id: 'small', source: 'source', target: 'smallTarget', data: { resource: 'coal' } },
            { id: 'large', source: 'source', target: 'largeTarget', data: { resource: 'coal' } },
        ];

        expect(Object.fromEntries(getResourceAllocations(nodes, edges))).toEqual({
            small: 10,
            large: 90,
        });
    });

    it('caps combined flow when several producers feed one input', () => {
        const nodes = [
            makeNode('source1', {}, { coal: 100 }),
            makeNode('source2', {}, { coal: 100 }),
            makeNode('target', { coal: 10 }),
        ];
        const edges = [
            { id: 'edge1', source: 'source1', target: 'target', data: { resource: 'coal' } },
            { id: 'edge2', source: 'source2', target: 'target', data: { resource: 'coal' } },
        ];

        expect(Object.fromEntries(getResourceAllocations(nodes, edges))).toEqual({
            edge1: 5,
            edge2: 5,
        });
    });

    it('calculates input fulfillment from all incoming edge allocations', () => {
        const edges = [
            { id: 'edge1', target: 'target', targetHandle: 'input' },
            { id: 'edge2', target: 'target', targetHandle: 'input' },
        ];
        const allocations = new Map([
            ['edge1', 20],
            ['edge2', 30],
        ]);

        expect(getInputFulfillment(
            'target',
            'input',
            100,
            edges,
            allocations,
        )).toEqual({
            incomingAmount: 50,
            ratio: 0.5,
        });
    });



    it('calculates output fulfillment from all outgoing edge allocations', () => {
        const edges = [
            { id: 'edge1', source: 'source', sourceHandle: 'output' },
            { id: 'edge2', source: 'source', sourceHandle: 'output' },
        ];
        const allocations = new Map([
            ['edge1', 20],
            ['edge2', 30],
        ]);

        expect(getOutputFulfillment(
            'source',
            'output',
            100,
            edges,
            allocations,
        )).toEqual({
            outgoingAmount: 50,
            ratio: 0.5,
        });
    });

    it('maps fulfillment from red through yellow to green', () => {
        expect(getFulfillmentColor(0)).toBe('hsl(0 85% 40%)');
        expect(getFulfillmentColor(0.5)).toBe('hsl(60 85% 40%)');
        expect(getFulfillmentColor(1)).toBe('hsl(120 85% 40%)');
    });
});
