import { createContext, useContext, useMemo, useRef } from 'react';
import {
    getResourceAllocations,
    getResourceSummary,
} from '../resourceConnections';
import { getStableSemanticGraph } from '../flowMetrics';

const FlowMetricsContext = createContext(null);

const useFlowMetricsValue = (nodes, edges) => {
    const graphRef = useRef(null);
    const stableGraph = getStableSemanticGraph(graphRef.current, nodes, edges);

    graphRef.current = stableGraph;

    const nodeById = useMemo(
        () => new Map(stableGraph.nodes.map((node) => [node.id, node])),
        [stableGraph.nodes],
    );
    const allocations = useMemo(
        () => getResourceAllocations(stableGraph.nodes, stableGraph.edges),
        [stableGraph.edges, stableGraph.nodes],
    );
    const summary = useMemo(
        () => getResourceSummary(stableGraph.nodes, stableGraph.edges, allocations),
        [allocations, stableGraph.edges, stableGraph.nodes],
    );

    return useMemo(() => ({
        allocations,
        edges: stableGraph.edges,
        getNode: (nodeId) => nodeById.get(nodeId),
        nodes: stableGraph.nodes,
        summary,
    }), [allocations, nodeById, stableGraph.edges, stableGraph.nodes, summary]);
};

function FlowMetricsProvider({ children, value }) {
    return (
        <FlowMetricsContext.Provider value={value}>
            {children}
        </FlowMetricsContext.Provider>
    );
}

const useFlowMetrics = () => {
    const context = useContext(FlowMetricsContext);

    if (!context) {
        throw new Error('useFlowMetrics must be used within a FlowMetricsProvider');
    }

    return context;
};

export {
    FlowMetricsProvider,
    useFlowMetrics,
    useFlowMetricsValue,
};
