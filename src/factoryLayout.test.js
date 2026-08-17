import { describe, expect, it } from 'vitest';
import {
    getClosestFactoryLayout,
    getDefaultFactoryLayout,
    getFactoryLayoutAfterCountChange,
    getFactoryLayouts,
    getSnappedNodeRect,
} from './factoryLayout';

const squareNodeData = {
    machineCount: 4,
    factory: {
        width: 10,
        length: 10,
    },
};

describe('factory layouts', () => {
    it('builds one valid layout for every possible column count', () => {
        const layouts = getFactoryLayouts(squareNodeData);

        expect(layouts.map(({columns, rows}) => ({columns, rows}))).toEqual([
            { columns: 1, rows: 4 },
            { columns: 2, rows: 2 },
            { columns: 3, rows: 2 },
            { columns: 4, rows: 1 },
        ]);
    });

    it('adds rotated layouts for rectangular factories', () => {
        const layouts = getFactoryLayouts({
            machineCount: 2,
            factory: { width: 10, length: 20 },
        });

        expect(layouts).toHaveLength(4);
        expect(layouts.find((layout) => layout.rotated)).toMatchObject({
            factoryWidth: 100,
            factoryHeight: 50,
            rotated: true,
        });
    });

    it('chooses a balanced layout by default', () => {
        expect(getDefaultFactoryLayout(
            getFactoryLayouts(squareNodeData),
        ).columns).toBe(2);
    });

    it('chooses the closest grid that fits the live node rectangle', () => {
        const layouts = getFactoryLayouts(squareNodeData);
        const fourColumnLayout = layouts.find((layout) => layout.columns === 4);

        expect(getClosestFactoryLayout(
            layouts,
            {
                width: fourColumnLayout.width,
                height: fourColumnLayout.height,
            },
        ).columns).toBe(4);
    });

    it('allows a horizontal drag to put all ten factories in one row', () => {
        const layouts = getFactoryLayouts({
            machineCount: 10,
            factory: { width: 10, length: 10 },
        });
        const resizeStart = getDefaultFactoryLayout(layouts);
        const widestLayout = layouts.find((layout) => layout.columns === 10);

        expect(getClosestFactoryLayout(
            layouts,
            { width: widestLayout.width, height: resizeStart.height },
            resizeStart,
        )).toMatchObject({
            columns: 10,
            rows: 1,
        });
    });

    it('preserves the column layout when the factory count changes', () => {
        const previousLayout = getFactoryLayouts(squareNodeData)
            .find((layout) => layout.columns === 2);
        const increasedLayouts = getFactoryLayouts({
            ...squareNodeData,
            machineCount: 7,
        });
        const increasedLayout = getFactoryLayoutAfterCountChange(
            increasedLayouts,
            previousLayout,
        );

        expect(increasedLayout).toMatchObject({
            columns: 2,
            machineCount: 7,
            rows: 4,
        });
        expect(getFactoryLayoutAfterCountChange(
            getFactoryLayouts({ ...squareNodeData, machineCount: 1 }),
            increasedLayout,
        )).toMatchObject({
            columns: 1,
            machineCount: 1,
            rows: 1,
        });
    });

    it('preserves the opposite edge when snapping after a left resize', () => {
        expect(getSnappedNodeRect(
            { width: 236, height: 146 },
            { x: 100, y: 100, width: 120, height: 200 },
            { x: -10, y: 100, width: 230, height: 200 },
        )).toEqual({
            width: 236,
            height: 146,
            position: { x: -16, y: 100 },
        });
    });
});
