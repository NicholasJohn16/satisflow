import { describe, expect, it } from 'vitest';
import { getStableSemanticGraph } from './flowMetrics';

describe('semantic flow metrics inputs', () => {
    const data = { ingredients: {}, products: { iron: 60 } };
    const edgeData = { resource: 'iron' };
    const nodes = [{
        id: 'source',
        type: 'recipeNode',
        position: { x: 0, y: 0 },
        data,
    }];
    const edges = [{
        id: 'edge',
        source: 'source',
        sourceHandle: 'source-output',
        target: 'target',
        targetHandle: 'target-input',
        data: edgeData,
    }];

    it('keeps graph inputs stable when only node position changes', () => {
        const previous = getStableSemanticGraph(null, nodes, edges);
        const movedNodes = [{
            ...nodes[0],
            dragging: true,
            position: { x: 300, y: 200 },
        }];
        const next = getStableSemanticGraph(previous, movedNodes, edges);

        expect(next.nodes).toBe(previous.nodes);
        expect(next.edges).toBe(previous.edges);
    });

    it('invalidates node inputs when production data changes', () => {
        const previous = getStableSemanticGraph(null, nodes, edges);
        const changedNodes = [{
            ...nodes[0],
            data: { ...data, products: { iron: 120 } },
        }];
        const next = getStableSemanticGraph(previous, changedNodes, edges);

        expect(next.nodes).toBe(changedNodes);
    });

    it('ignores edge selection but invalidates connection changes', () => {
        const previous = getStableSemanticGraph(null, nodes, edges);
        const selectedEdges = [{ ...edges[0], selected: true }];
        const selected = getStableSemanticGraph(previous, nodes, selectedEdges);
        const reconnectedEdges = [{ ...edges[0], target: 'other-target' }];
        const reconnected = getStableSemanticGraph(previous, nodes, reconnectedEdges);

        expect(selected.edges).toBe(previous.edges);
        expect(reconnected.edges).toBe(reconnectedEdges);
    });
});
