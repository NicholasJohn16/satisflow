import { Position } from '@xyflow/react';

const CONNECTOR_LAYOUTS = [
    {
        id: 'vertical',
        inputPosition: Position.Top,
        outputPosition: Position.Bottom,
        titlePosition: Position.Left,
    },
    {
        id: 'right-left',
        inputPosition: Position.Right,
        outputPosition: Position.Left,
        titlePosition: Position.Top,
    },
    {
        id: 'vertical-reverse',
        inputPosition: Position.Bottom,
        outputPosition: Position.Top,
        titlePosition: Position.Right,
    },
    {
        id: 'horizontal',
        inputPosition: Position.Left,
        outputPosition: Position.Right,
        titlePosition: Position.Bottom,
    },
];

const getConnectorLayout = (layoutId) => (
    CONNECTOR_LAYOUTS.find(({ id }) => id === layoutId) ?? CONNECTOR_LAYOUTS[0]
);

const getNextConnectorLayout = (layoutId) => {
    const currentIndex = CONNECTOR_LAYOUTS.findIndex(({ id }) => id === layoutId);
    const nextIndex = currentIndex < 0
        ? 1
        : (currentIndex + 1) % CONNECTOR_LAYOUTS.length;

    return CONNECTOR_LAYOUTS[nextIndex].id;
};

const getCenteredConnectorStyle = (position) => (
    position === Position.Left || position === Position.Right
        ? { top: '50%' }
        : { left: '50%' }
);

const getConnectorPositions = (layoutId) => {
    const { inputPosition, outputPosition, titlePosition } = getConnectorLayout(layoutId);

    return { inputPosition, outputPosition, titlePosition };
};

export {
    getCenteredConnectorStyle,
    getConnectorPositions,
    getNextConnectorLayout,
};
