const getSelfLoopPath = ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    nodeBounds,
}) => {
    const cornerRadius = 10;
    const handleClearance = 32;
    const loopReach = 96;
    const isHorizontal = sourcePosition === 'right' || targetPosition === 'left';

    if (isHorizontal) {
        const exitX = sourceX + handleClearance;
        const enterX = targetX - handleClearance;
        const nodeTop = Number(nodeBounds?.y);
        const nodeBottom = Number(nodeBounds?.y) + Number(nodeBounds?.height);
        const canMeasureNode = Number.isFinite(nodeTop) && Number.isFinite(nodeBottom);
        const topY = canMeasureNode ? nodeTop - loopReach : null;
        const bottomY = canMeasureNode
            ? nodeBottom + loopReach
            : Math.max(sourceY, targetY) + loopReach;
        const useTop = canMeasureNode && (
            Math.abs(sourceY - topY) + Math.abs(targetY - topY)
            < Math.abs(sourceY - bottomY) + Math.abs(targetY - bottomY)
        );
        const direction = useTop ? -1 : 1;
        const outerY = useTop ? topY : bottomY;

        return [
            [
                `M ${sourceX} ${sourceY}`,
                `L ${exitX - cornerRadius} ${sourceY}`,
                `Q ${exitX} ${sourceY} ${exitX} ${sourceY + (direction * cornerRadius)}`,
                `L ${exitX} ${outerY - (direction * cornerRadius)}`,
                `Q ${exitX} ${outerY} ${exitX - cornerRadius} ${outerY}`,
                `L ${enterX + cornerRadius} ${outerY}`,
                `Q ${enterX} ${outerY} ${enterX} ${outerY - (direction * cornerRadius)}`,
                `L ${enterX} ${targetY + (direction * cornerRadius)}`,
                `Q ${enterX} ${targetY} ${enterX + cornerRadius} ${targetY}`,
                `L ${targetX} ${targetY}`,
            ].join(' '),
            (exitX + enterX) / 2,
            outerY,
        ];
    }

    const exitY = sourceY + handleClearance;
    const enterY = targetY - handleClearance;
    const nodeLeft = Number(nodeBounds?.x);
    const nodeRight = Number(nodeBounds?.x) + Number(nodeBounds?.width);
    const canMeasureNode = Number.isFinite(nodeLeft) && Number.isFinite(nodeRight);
    const leftX = canMeasureNode ? nodeLeft - loopReach : null;
    const rightX = canMeasureNode
        ? nodeRight + loopReach
        : Math.max(sourceX, targetX) + loopReach;
    const useLeft = canMeasureNode && (
        Math.abs(sourceX - leftX) + Math.abs(targetX - leftX)
        < Math.abs(sourceX - rightX) + Math.abs(targetX - rightX)
    );
    const direction = useLeft ? -1 : 1;
    const outerX = useLeft ? leftX : rightX;

    return [
        [
            `M ${sourceX} ${sourceY}`,
            `L ${sourceX} ${exitY - cornerRadius}`,
            `Q ${sourceX} ${exitY} ${sourceX + (direction * cornerRadius)} ${exitY}`,
            `L ${outerX - (direction * cornerRadius)} ${exitY}`,
            `Q ${outerX} ${exitY} ${outerX} ${exitY - cornerRadius}`,
            `L ${outerX} ${enterY + cornerRadius}`,
            `Q ${outerX} ${enterY} ${outerX - (direction * cornerRadius)} ${enterY}`,
            `L ${targetX + (direction * cornerRadius)} ${enterY}`,
            `Q ${targetX} ${enterY} ${targetX} ${enterY + cornerRadius}`,
            `L ${targetX} ${targetY}`,
        ].join(' '),
        outerX,
        (exitY + enterY) / 2,
    ];
};

const shouldShowEdgeIndicator = ({
    edges,
    source,
    sourceHandle,
    sourceX,
    sourceY,
    target,
    targetHandle,
    targetX,
    targetY,
    shortDistance = 180,
}) => {
    if (source === target) return true;

    const distance = Math.hypot(targetX - sourceX, targetY - sourceY);
    if (distance > shortDistance) return true;

    const sourceConnectionCount = edges.filter((edge) => (
        edge.source === source && edge.sourceHandle === sourceHandle
    )).length;
    const targetConnectionCount = edges.filter((edge) => (
        edge.target === target && edge.targetHandle === targetHandle
    )).length;

    return sourceConnectionCount !== 1 || targetConnectionCount !== 1;
};

export { getSelfLoopPath, shouldShowEdgeIndicator };
