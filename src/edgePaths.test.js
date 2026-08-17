import { describe, expect, it } from 'vitest';
import { getSelfLoopPath, shouldShowEdgeIndicator } from './edgePaths';

describe('self-loop edge paths', () => {
    it('routes top and bottom connectors around the right side', () => {
        const [path, labelX, labelY] = getSelfLoopPath({
            sourceX: 100,
            sourceY: 200,
            targetX: 100,
            targetY: 50,
            sourcePosition: 'bottom',
            targetPosition: 'top',
        });

        expect(path).toContain('L 196');
        expect(labelX).toBe(196);
        expect(labelY).toBe(125);
    });

    it('routes left and right connectors underneath the node', () => {
        const [path, labelX, labelY] = getSelfLoopPath({
            sourceX: 200,
            sourceY: 100,
            targetX: 50,
            targetY: 100,
            sourcePosition: 'right',
            targetPosition: 'left',
        });

        expect(path).toContain('196');
        expect(labelX).toBe(125);
        expect(labelY).toBe(196);
    });

    it('takes the shorter route around the measured bounds of a wide node', () => {
        const [, labelX] = getSelfLoopPath({
            sourceX: 100,
            sourceY: 200,
            targetX: 100,
            targetY: 50,
            sourcePosition: 'bottom',
            targetPosition: 'top',
            nodeBounds: { x: 0, y: 50, width: 500, height: 150 },
        });

        expect(labelX).toBe(-96);
    });

    it('takes the shorter route above a tall horizontal node', () => {
        const [, , labelY] = getSelfLoopPath({
            sourceX: 200,
            sourceY: 100,
            targetX: 50,
            targetY: 100,
            sourcePosition: 'right',
            targetPosition: 'left',
            nodeBounds: { x: 50, y: 50, width: 150, height: 500 },
        });

        expect(labelY).toBe(-46);
    });
});

describe('edge indicators', () => {
    const edge = {
        id: 'edge-1',
        source: 'source',
        sourceHandle: 'source-output',
        target: 'target',
        targetHandle: 'target-input',
    };
    const options = {
        edges: [edge],
        source: edge.source,
        sourceHandle: edge.sourceHandle,
        sourceX: 0,
        sourceY: 0,
        target: edge.target,
        targetHandle: edge.targetHandle,
        targetX: 100,
        targetY: 0,
    };

    it('hides an indicator on a short one-to-one edge', () => {
        expect(shouldShowEdgeIndicator(options)).toBe(false);
    });

    it('keeps an indicator on a long edge', () => {
        expect(shouldShowEdgeIndicator({ ...options, targetX: 300 })).toBe(true);
    });

    it('keeps an indicator when a connector branches', () => {
        expect(shouldShowEdgeIndicator({
            ...options,
            edges: [
                edge,
                { ...edge, id: 'edge-2', target: 'other-target' },
            ],
        })).toBe(true);
    });

    it('keeps an indicator on self-loop edges', () => {
        expect(shouldShowEdgeIndicator({
            ...options,
            source: 'node',
            target: 'node',
        })).toBe(true);
    });
});
