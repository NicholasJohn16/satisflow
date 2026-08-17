const haveSameSemanticNodes = (previousNodes, nodes) => (
    previousNodes.length === nodes.length
    && previousNodes.every((previousNode, index) => {
        const node = nodes[index];

        return previousNode.id === node.id
            && previousNode.type === node.type
            && previousNode.data === node.data;
    })
);

const haveSameSemanticEdges = (previousEdges, edges) => (
    previousEdges.length === edges.length
    && previousEdges.every((previousEdge, index) => {
        const edge = edges[index];

        return previousEdge.id === edge.id
            && previousEdge.source === edge.source
            && previousEdge.sourceHandle === edge.sourceHandle
            && previousEdge.target === edge.target
            && previousEdge.targetHandle === edge.targetHandle
            && previousEdge.data === edge.data;
    })
);

const getStableSemanticGraph = (previousGraph, nodes, edges) => ({
    nodes: previousGraph && haveSameSemanticNodes(previousGraph.nodes, nodes)
        ? previousGraph.nodes
        : nodes,
    edges: previousGraph && haveSameSemanticEdges(previousGraph.edges, edges)
        ? previousGraph.edges
        : edges,
});

export {
    getStableSemanticGraph,
    haveSameSemanticEdges,
    haveSameSemanticNodes,
};
