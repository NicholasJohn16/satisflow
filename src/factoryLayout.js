import { NODE_DIMENSION_SCALE } from './nodeDimensions';

const FACTORY_GAP = 7;
const FACTORY_PANEL_PADDING = 16;
const NODE_HORIZONTAL_PADDING = 32;
const NODE_VERTICAL_PADDING = 28;
const MIN_NODE_WIDTH = 120;

const getFactoryLayouts = ({machineCount, factory}) => {
    const count = Math.max(1, Math.ceil(Number(machineCount) || 1));
    const baseWidth = Math.max(
        1,
        Number(factory?.width) * NODE_DIMENSION_SCALE || 1,
    );
    const baseHeight = Math.max(
        1,
        Number(factory?.length) * NODE_DIMENSION_SCALE || 1,
    );
    const orientations = baseWidth === baseHeight
        ? [{ factoryWidth: baseWidth, factoryHeight: baseHeight, rotated: false }]
        : [
            { factoryWidth: baseWidth, factoryHeight: baseHeight, rotated: false },
            { factoryWidth: baseHeight, factoryHeight: baseWidth, rotated: true },
        ];

    return orientations.flatMap(({factoryWidth, factoryHeight, rotated}) => (
        Array.from({ length: count }, (_, index) => {
            const columns = index + 1;
            const rows = Math.ceil(count / columns);
            const gridWidth = (columns * factoryWidth) + ((columns - 1) * FACTORY_GAP);
            const gridHeight = (rows * factoryHeight) + ((rows - 1) * FACTORY_GAP);

            return {
                columns,
                factoryHeight,
                factoryWidth,
                gridHeight,
                gridWidth,
                height: Math.ceil(
                    gridHeight
                    + FACTORY_PANEL_PADDING
                    + NODE_VERTICAL_PADDING
                ),
                machineCount: count,
                rotated,
                rows,
                width: Math.ceil(Math.max(
                    MIN_NODE_WIDTH,
                    gridWidth
                    + FACTORY_PANEL_PADDING
                    + NODE_HORIZONTAL_PADDING,
                )),
            };
        })
    ));
};

const getDefaultFactoryLayout = (layouts) => (
    layouts.reduce((best, layout) => {
        const score = Math.abs(Math.log(layout.gridWidth / layout.gridHeight));
        const bestScore = Math.abs(Math.log(best.gridWidth / best.gridHeight));

        if (score !== bestScore) return score < bestScore ? layout : best;
        return (layout.width * layout.height) < (best.width * best.height) ? layout : best;
    })
);

const getFactoryLayoutAfterCountChange = (layouts, previousLayout) => {
    if (!layouts.length) return previousLayout;
    if (!previousLayout) {
        return getDefaultFactoryLayout(layouts);
    }

    const machineCount = layouts[0].machineCount;
    const columns = Math.min(
        Math.max(1, previousLayout.columns),
        machineCount,
    );

    return layouts.find((layout) => (
        layout.columns === columns
        && layout.rotated === previousLayout.rotated
    )) ?? layouts.find((layout) => layout.columns === columns)
        ?? getDefaultFactoryLayout(layouts);
};

const getClosestFactoryLayout = (layouts, availableSize = {}, resizeStart) => {
    const defaultLayout = getDefaultFactoryLayout(layouts);
    const availableWidth = Number(availableSize.width);
    const availableHeight = Number(availableSize.height);

    if (!Number.isFinite(availableWidth) || !Number.isFinite(availableHeight)) {
        return defaultLayout;
    }

    const fittingLayouts = layouts.filter((layout) => (
        layout.width <= availableWidth && layout.height <= availableHeight
    ));
    const candidates = fittingLayouts.length ? fittingLayouts : layouts;
    const startWidth = Number(resizeStart?.width);
    const startHeight = Number(resizeStart?.height);
    const widthChange = Number.isFinite(startWidth)
        ? Math.abs(availableWidth - startWidth) / Math.max(startWidth, 1)
        : 0;
    const heightChange = Number.isFinite(startHeight)
        ? Math.abs(availableHeight - startHeight) / Math.max(startHeight, 1)
        : 0;
    const resizeAxis = widthChange > heightChange
        ? 'width'
        : heightChange > widthChange
            ? 'height'
            : null;

    const getLayoutDistance = (layout) => {
        if (resizeAxis === 'width') {
            return Math.abs(layout.width - availableWidth);
        }
        if (resizeAxis === 'height') {
            return Math.abs(layout.height - availableHeight);
        }

        const widthDistance = Math.abs(layout.width - availableWidth)
            / (layout.factoryWidth + FACTORY_GAP);
        const heightDistance = Math.abs(layout.height - availableHeight)
            / (layout.factoryHeight + FACTORY_GAP);

        return Math.hypot(widthDistance, heightDistance);
    };

    return candidates.reduce((closest, layout) => {
        return getLayoutDistance(layout) < getLayoutDistance(closest)
            ? layout
            : closest;
    }, candidates[0]);
};

const getSnappedNodeRect = (layout, resizeStart, resizeEnd) => {
    const affectsLeft = Math.abs(resizeEnd.x - resizeStart.x) > 0.5;
    const affectsTop = Math.abs(resizeEnd.y - resizeStart.y) > 0.5;

    return {
        height: layout.height,
        position: {
            x: affectsLeft
                ? resizeEnd.x + resizeEnd.width - layout.width
                : resizeEnd.x,
            y: affectsTop
                ? resizeEnd.y + resizeEnd.height - layout.height
                : resizeEnd.y,
        },
        width: layout.width,
    };
};

export {
    getClosestFactoryLayout,
    getDefaultFactoryLayout,
    getFactoryLayoutAfterCountChange,
    getFactoryLayouts,
    getSnappedNodeRect,
};
