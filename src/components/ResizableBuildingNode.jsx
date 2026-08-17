import { NodeResizer, useReactFlow } from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
    getClosestFactoryLayout,
    getDefaultFactoryLayout,
    getFactoryLayoutAfterCountChange,
    getFactoryLayouts,
    getSnappedNodeRect,
} from '../factoryLayout';
import BuildingFootprints from './BuildingFootprints';

export default function ResizableBuildingNode({
    children,
    factory,
    height,
    id,
    machineCount,
    width,
}) {
    const factoryLayouts = useMemo(
        () => getFactoryLayouts({ factory, machineCount }),
        [factory, machineCount],
    );
    const defaultFactoryLayout = useMemo(
        () => getDefaultFactoryLayout(factoryLayouts),
        [factoryLayouts],
    );
    const hasMeasuredSize = Number.isFinite(width) && Number.isFinite(height);
    const availableSize = useMemo(
        () => hasMeasuredSize ? { width, height } : defaultFactoryLayout,
        [defaultFactoryLayout, hasMeasuredSize, height, width],
    );
    const resizeStart = useRef(null);
    const factoryLayout = useMemo(
        () => getClosestFactoryLayout(
            factoryLayouts,
            availableSize,
            resizeStart.current,
        ),
        [availableSize, factoryLayouts],
    );
    const configKey = `${machineCount}|${factory?.width}|${factory?.length}`;
    const previousConfigKey = useRef(configKey);
    const previousFactoryLayout = useRef(factoryLayout);
    const { updateNode } = useReactFlow();

    useEffect(() => {
        if (!hasMeasuredSize || resizeStart.current) return;

        const matchesLayout = factoryLayouts.some((layout) => (
            layout.width === width && layout.height === height
        ));
        if (matchesLayout) return;

        updateNode(id, {
            height: factoryLayout.height,
            width: factoryLayout.width,
        });
    }, [
        factoryLayout,
        factoryLayouts,
        hasMeasuredSize,
        height,
        id,
        updateNode,
        width,
    ]);

    useEffect(() => {
        if (previousConfigKey.current === configKey) {
            previousFactoryLayout.current = factoryLayout;
            return;
        }

        const nextLayout = getFactoryLayoutAfterCountChange(
            factoryLayouts,
            previousFactoryLayout.current,
        );
        previousConfigKey.current = configKey;
        previousFactoryLayout.current = nextLayout;
        updateNode(id, {
            height: nextLayout.height,
            width: nextLayout.width,
        });
    }, [configKey, factoryLayout, factoryLayouts, id, updateNode]);

    const onResizeStart = useCallback((event, params) => {
        resizeStart.current = params;
    }, []);

    const onResizeEnd = useCallback((event, params) => {
        const layout = getClosestFactoryLayout(
            factoryLayouts,
            params,
            resizeStart.current,
        );
        const snapped = getSnappedNodeRect(
            layout,
            resizeStart.current ?? params,
            params,
        );

        previousFactoryLayout.current = layout;
        updateNode(id, {
            height: snapped.height,
            position: snapped.position,
            width: snapped.width,
        });
        resizeStart.current = null;
    }, [factoryLayouts, id, updateNode]);

    return (
        <>
            <NodeResizer
                isVisible
                handleClassName="recipe-node__resize-handle"
                lineClassName="recipe-node__resize-line"
                minHeight={Math.min(...factoryLayouts.map((layout) => layout.height))}
                minWidth={Math.min(...factoryLayouts.map((layout) => layout.width))}
                maxHeight={Math.max(...factoryLayouts.map((layout) => layout.height))}
                maxWidth={Math.max(...factoryLayouts.map((layout) => layout.width))}
                onResizeStart={onResizeStart}
                onResizeEnd={onResizeEnd}
            />
            <div
                className="building-node__body"
                style={{
                    height: hasMeasuredSize ? '100%' : `${defaultFactoryLayout.height}px`,
                    width: hasMeasuredSize ? '100%' : `${defaultFactoryLayout.width}px`,
                }}
            >
                {children}
                <BuildingFootprints
                    factory={factory}
                    layout={factoryLayout}
                    machineCount={machineCount}
                />
            </div>
        </>
    );
}
