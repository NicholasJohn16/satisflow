import { describe, expect, it } from 'vitest';
import {
    applyElkLayout,
    autoLayoutNodes,
    createElkGraph,
    resolveOverlaps,
} from './autoLayout';

const createNode = ({
    data = {},
    height = 50,
    id,
    position,
    type = 'recipeNode',
    width = 50,
}) => ({
    data,
    id,
    measured: { height, width },
    origin: [0.5, 0.5],
    position,
    type,
});

describe('automatic layout', () => {
    it('marks only locked resource nodes as fixed ELK anchors', () => {
        const nodes = [
            createNode({
                data: { layoutLocked: true },
                id: 'locked-resource',
                position: { x: 0, y: 0 },
                type: 'resourceNode',
            }),
            createNode({
                data: { layoutLocked: true },
                id: 'recipe',
                position: { x: 100, y: 100 },
            }),
        ];
        const graph = createElkGraph(nodes, []);

        expect(graph.layoutOptions['elk.separateConnectedComponents']).toBe('false');
        expect(graph.children[0].layoutOptions).toEqual({
            'elk.stress.fixed': 'true',
        });
        expect(graph.children[1].layoutOptions).toBeUndefined();
    });

    it('removes ELK translation while preserving node origins', () => {
        const nodes = [
            createNode({
                data: { layoutLocked: true },
                height: 20,
                id: 'resource',
                position: { x: 100, y: 100 },
                type: 'resourceNode',
                width: 20,
            }),
            createNode({ id: 'recipe', position: { x: 400, y: 400 } }),
        ];
        const result = applyElkLayout(nodes, [
            { id: 'resource', x: 50, y: 50, height: 20, width: 20 },
            { id: 'recipe', x: 150, y: 150, height: 50, width: 50 },
        ]);

        expect(result[0].position).toEqual({ x: 100, y: 100 });
        expect(result[1].position).toEqual({ x: 215, y: 215 });
    });

    it('resolves overlaps by moving only unlocked nodes', () => {
        const result = resolveOverlaps([
            { id: 'resource', x: 0, y: 0, height: 100, width: 100 },
            { id: 'recipe', x: 50, y: 0, height: 100, width: 100 },
        ], new Set(['resource']));

        expect(result[0]).toMatchObject({ x: 0, y: 0 });
        expect(result[1].x).toBeGreaterThanOrEqual(124);
    });

    it('keeps multiple resource anchors fixed during an ELK layout', async () => {
        const nodes = [
            createNode({
                data: { layoutLocked: true },
                height: 20,
                id: 'resource-a',
                position: { x: 0, y: 0 },
                type: 'resourceNode',
                width: 20,
            }),
            createNode({ id: 'recipe', position: { x: 500, y: 500 } }),
            createNode({
                data: { layoutLocked: true },
                height: 20,
                id: 'resource-b',
                position: { x: 400, y: 0 },
                type: 'resourceNode',
                width: 20,
            }),
        ];
        const edges = [
            { id: 'edge-a', source: 'resource-a', target: 'recipe' },
            { id: 'edge-b', source: 'resource-b', target: 'recipe' },
        ];
        const result = await autoLayoutNodes(nodes, edges);

        expect(result[0].position).toEqual({ x: 0, y: 0 });
        expect(result[2].position).toEqual({ x: 400, y: 0 });
        expect(result[1].position).not.toEqual({ x: 500, y: 500 });
    });
});
