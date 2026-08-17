import { describe, expect, it } from 'vitest';
import data from './data.json';
import {
    decodeFlowState,
    encodeFlowState,
    hydrateFlowState,
    serializeFlowState,
} from './flowUrlState';
import { getShape } from './functions';
import { getResourceNodeData } from './resourceNodes';

describe('flow URL state', () => {
    it('round trips Unicode through compressed URL-safe Base64', () => {
        const state = { label: 'Ficsonium · 250%', nodes: [] };
        const encoded = encodeFlowState(state);

        expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/u);
        expect(decodeFlowState(encoded)).toEqual(state);
        expect(decodeFlowState('not-valid-deflate')).toBeNull();
    });

    it('compresses repeated flow data', () => {
        const state = {
            nodes: Array.from({ length: 50 }, (_, index) => ({
                data: {
                    clockSpeed: 1,
                    connectorLayout: 'vertical',
                    machineCount: 1,
                    recipeId: 'Recipe_IronPlate_C',
                },
                id: `recipe-${index}`,
                position: { x: index * 10, y: index * 20 },
                type: 'recipeNode',
            })),
        };
        const uncompressedLength = Math.ceil(JSON.stringify(state).length * 4 / 3);

        expect(encodeFlowState(state).length).toBeLessThan(uncompressedLength);
    });

    it('serializes compact recipe data and rebuilds calculated node data', () => {
        const recipe = Object.values(data.recipes)[0];
        const factory = data.constructors[recipe.producedIn];
        const node = {
            id: 'recipe-1',
            type: 'recipeNode',
            position: { x: 10, y: 20 },
            data: {
                ...getShape({ recipe, factory, machineCount: 2, clockSpeed: 1.5 }),
                connectorLayout: 'right-left',
            },
        };
        const serialized = serializeFlowState({
            edges: [],
            nodes: [node],
            viewport: { x: 1, y: 2, zoom: 1.2 },
        });

        expect(serialized.nodes[0].data).toEqual({
            amplification: 0,
            clockSpeed: 1.5,
            connectorLayout: 'right-left',
            machineCount: 2,
            recipeId: recipe.className,
        });

        const hydrated = hydrateFlowState(serialized, data);
        expect(hydrated.nodes[0].data).toMatchObject({
            clockSpeed: 1.5,
            connectorLayout: 'right-left',
            machineCount: 2,
            recipe,
        });
        expect(hydrated.viewport).toEqual({ x: 1, y: 2, zoom: 1.2 });
    });

    it('persists locked resource positions', () => {
        const node = {
            data: {
                ...getResourceNodeData('Desc_OreIron_C'),
                layoutLocked: true,
            },
            draggable: false,
            id: 'resource-1',
            position: { x: 50, y: 75 },
            type: 'resourceNode',
        };
        const serialized = serializeFlowState({
            edges: [],
            nodes: [node],
            viewport: { x: 0, y: 0, zoom: 1 },
        });
        const hydrated = hydrateFlowState(serialized, data);

        expect(serialized.nodes[0].data.layoutLocked).toBe(true);
        expect(hydrated.nodes[0]).toMatchObject({
            data: { layoutLocked: true },
            draggable: false,
            position: { x: 50, y: 75 },
        });
    });
});
