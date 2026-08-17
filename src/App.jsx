// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import '@xyflow/react/dist/style.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  MiniMap,
  Controls,
  Panel,
} from '@xyflow/react';
import RecipeNode from './components/RecipeNode';
import AddRecipe from './components/AddRecipe';
import AddResourceNode from './components/AddResourceNode';
import AddPowerPlant from './components/AddPowerPlant';
import TestNode from './components/TestNode';
import ContextMenu from './components/ContextMenu';
import { ModalProvider, useModal } from './contexts/modal';
import { DataProvider, useData } from './contexts/data';
import RecipeModal from './components/RecipeModal';
import RecipesModal from './components/RecipesModal';
import ItemEdge from './components/ItemEdge';
import Modals from './components/Modals';
import ResourceKey from './components/ResourceKey';
import ResourceNode from './components/ResourceNode';
import PowerPlantNode from './components/PowerPlantNode';
import {
  getInputAssignments,
  getNodeProductionRatio,
  getResourceFromSourceHandle,
} from './resourceConnections';
import {
  hydrateFlowState,
  readFlowStateFromUrl,
  replaceFlowStateInUrl,
  serializeFlowState,
} from './flowUrlState';
import {
  readDisplayPreferences,
  writeDisplayPreferences,
} from './displayPreferences';
import { RESOURCE_NODE_RESOURCES } from './resourceNodes';
import BlueprintBackground from './components/BlueprintBackground';
import { autoLayoutNodes } from './autoLayout';
import { isPowerPlantFuel } from './powerPlants';
import {
  FlowMetricsProvider,
  useFlowMetricsValue,
} from './contexts/flowMetrics';

const proOptions = { hideAttribution: true };
const initialNodes = [];
const initialEdges = [];

const nodeTypes = {
  recipeNode: RecipeNode,
  resourceNode: ResourceNode,
  powerPlantNode: PowerPlantNode,
  testNode: TestNode,
};
const edgeTypes = {itemEdge: ItemEdge};

const getMiniMapNodeColor = (node) => {
  if (node.type === 'powerPlantNode') return '#8e44ad';
  if (node.type === 'resourceNode') return '#2e9d55';

  return undefined;
};

const getConnectorIconScale = (zoom) => Math.min(
  2,
  Math.max(1, 1 / (Number(zoom) || 1)),
);


if(false) {
  initialNodes.push({
    id: '1',
    data: { label: 'Hello' },
    position: { x: 0, y: 0 },
    type: 'testNode',
  })
  initialNodes.push({
    id: '2',
    data: { label: 'Hello' },
    position: { x: 100, y: 100 },
    type: 'testNode',
  });

  nodeTypes.testNode = TestNode;
}

function FlowCanvas() {
  const { openModal } = useModal();
  const { constructors, items, recipes } = useData();
  const [initialFlow] = useState(() => hydrateFlowState(
    readFlowStateFromUrl(),
    { constructors, items, recipes },
  ));
  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes ?? initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges ?? initialEdges);
  const [initialDisplayPreferences] = useState(() => readDisplayPreferences());
  const [backgroundVariant, setBackgroundVariant] = useState(
    initialDisplayPreferences.backgroundVariant,
  );
  const { fitView, screenToFlowPosition } = useReactFlow();
  const snapGrid = [10, 10];
  const [menu, setMenu] = useState(null);
  const [colorMode, setColorMode] = useState(initialDisplayPreferences.colorMode);
  const [viewport, setViewport] = useState(initialFlow.viewport);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [isNodeDragging, setIsNodeDragging] = useState(false);
  const nodeDragInProgress = useRef(false);
  const ref = useRef(null);
  const flowMetrics = useFlowMetricsValue(nodes, edges);
  const { allocations, getNode: getFlowNode } = flowMetrics;

  const handleNodesChange = useCallback((changes) => {
    const dragStarted = changes.some((change) => (
      change.type === 'position' && change.dragging === true
    ));
    const dragFinished = changes.some((change) => (
      change.type === 'position' && change.dragging === false
    ));

    if (dragStarted && !nodeDragInProgress.current) {
      nodeDragInProgress.current = true;
      setIsNodeDragging(true);
    }
    onNodesChange(changes);
    if (dragFinished && nodeDragInProgress.current) {
      nodeDragInProgress.current = false;
      setIsNodeDragging(false);
    }
  }, [onNodesChange]);

  const updateConnectorIconScale = useCallback((nextViewport) => {
    ref.current?.style.setProperty(
      '--connector-icon-scale',
      getConnectorIconScale(nextViewport.zoom),
    );
  }, []);

  const autoOrganize = useCallback(async () => {
    if (isOrganizing || nodes.length < 2) return;

    setIsOrganizing(true);
    try {
      const nextNodes = await autoLayoutNodes(nodes, edges);

      setNodes(nextNodes);
      window.requestAnimationFrame(() => {
        fitView({ duration: 400, padding: 0.12 });
      });
    } catch (error) {
      console.error('Unable to auto organize nodes', error);
    } finally {
      setIsOrganizing(false);
    }
  }, [edges, fitView, isOrganizing, nodes, setNodes]);

  useEffect(() => {
    if (nodeDragInProgress.current) return undefined;

    const timeout = window.setTimeout(() => {
      replaceFlowStateInUrl(serializeFlowState({
        edges,
        nodes,
        viewport,
      }));
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [edges, nodes, viewport]);

  useEffect(() => {
    writeDisplayPreferences({ backgroundVariant, colorMode });
  }, [backgroundVariant, colorMode]);

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(colorMode);

    return () => document.body.classList.remove(colorMode);
  }, [colorMode]);

  // const onConnect = useCallback(
  //   (params) => console.log('App.onConnect', new Date()),
  //   [setEdges],
  // );

  const onContextMenu = useCallback(
    (event, node) => {
      console.log('edge context menu');
      event.preventDefault();

      const pane = ref.current.getBoundingClientRect();
      setMenu({
        element: node,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom:
          event.clientY >= pane.height - 200 && pane.height - event.clientY,
      });
    },
    [setMenu],
  )

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);
  const onConnectEnd = useCallback((event, connectionState) => {
    if (
      connectionState.isValid
      || connectionState.toNode
      || !connectionState.fromHandle
      || !connectionState.fromNode
    ) {
      return;
    }

    const pointer = 'changedTouches' in event
      ? event.changedTouches[0]
      : event;
    const dropElement = Number.isFinite(pointer?.clientX) && Number.isFinite(pointer?.clientY)
      ? document.elementFromPoint(pointer.clientX, pointer.clientY)
      : null;

    if (dropElement?.closest('.react-flow__node')) return;

    const { fromHandle, fromNode } = connectionState;
    const resource = fromHandle.type === 'source'
      ? getResourceFromSourceHandle(fromNode, fromHandle.id)
      : getInputAssignments(
          fromNode.id,
          fromNode.data?.ingredients ?? {},
          edges,
          getFlowNode,
        ).find((assignment) => assignment.handleId === fromHandle.id)?.resource;

    if (!resource) return;

    const connectorAmount = fromHandle.type === 'source'
      ? Number(fromNode.data?.products?.[resource] ?? 0) * getNodeProductionRatio(
          fromNode.id,
          fromNode.data?.ingredients,
          edges,
          allocations,
          getFlowNode,
        )
      : getInputAssignments(
          fromNode.id,
          fromNode.data?.ingredients ?? {},
          edges,
          getFlowNode,
        ).find((assignment) => assignment.handleId === fromHandle.id)?.amount;

    const position = Number.isFinite(pointer?.clientX) && Number.isFinite(pointer?.clientY)
      ? screenToFlowPosition({ x: pointer.clientX, y: pointer.clientY })
      : null;

    const connection = {
        amount: connectorAmount,
        fromHandleId: fromHandle.id,
        fromHandleType: fromHandle.type,
        fromNodeId: fromNode.id,
        resource,
      };
    const modalOptions = {
      connection,
      position,
      recipeFilter: {
        resource,
        recipeSide: fromHandle.type === 'source' ? 'ingredients' : 'products',
      },
      search: items[resource]?.displayName ?? '',
    };
    const canAddResourceNode = fromHandle.type === 'target'
      && RESOURCE_NODE_RESOURCES.includes(resource);
    const canAddPowerPlant = fromHandle.type === 'source'
      && isPowerPlantFuel(resource);

    openModal(
      canAddResourceNode || canAddPowerPlant ? 'connectionNodeType' : 'recipes',
      modalOptions,
    );
  }, [allocations, edges, getFlowNode, items, openModal, screenToFlowPosition]);
 
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FlowMetricsProvider value={flowMetrics}>
        <ReactFlow
              className={isNodeDragging ? 'is-node-dragging' : undefined}
              ref={ref}
              style={{ '--connector-icon-scale': getConnectorIconScale(initialFlow.viewport.zoom) }}
              nodes={nodes}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              // onConnect={onConnect}
              proOptions={proOptions}
              colorMode={colorMode}
              snapToGrid={true}
              snapGrid={snapGrid}
              defaultEdgeOptions={{type: 'smoothstep'}}
              defaultViewport={initialFlow.viewport}
              minZoom={0.1}
              onEdgeContextMenu={onContextMenu}
              onNodeContextMenu={onContextMenu}
              onConnectEnd={onConnectEnd}
              onPaneClick={onPaneClick}
              onlyRenderVisibleElements
              onMove={(event, nextViewport) => updateConnectorIconScale(nextViewport)}
              onMoveEnd={(event, nextViewport) => {
                updateConnectorIconScale(nextViewport);
                setViewport(nextViewport);
              }}
              >
              <Panel position='top-left'>
                <ResourceKey />
              </Panel>
              <Panel position='top-center'>
                <div className="add-node-controls">
                  <AddRecipe />
                  <AddResourceNode />
                  <AddPowerPlant />
                  <button
                    className="default auto-organize-button"
                    disabled={isOrganizing || nodes.length < 2}
                    onClick={autoOrganize}
                    type="button"
                  >
                    {isOrganizing ? 'Organizing…' : 'Auto Organize'}
                    <span className="auto-organize-button__beta">BETA</span>
                  </button>
                </div>
              </Panel>
              <Panel position='top-right'>
                <div className="display-controls">
                  <label className="background-selector">
                    <span>Background</span>
                    <select
                      value={backgroundVariant}
                      onChange={(event) => setBackgroundVariant(event.target.value)}
                    >
                      <option value="lines">Lines</option>
                      <option value="dots">Dots</option>
                      <option value="cross">Cross</option>
                      <option value="blueprint">Blueprint</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    className="default theme-toggle"
                    aria-pressed={colorMode === 'dark'}
                    onClick={() => setColorMode((current) => (
                      current === 'dark' ? 'light' : 'dark'
                    ))}
                  >
                    {colorMode === 'dark' ? 'Light mode' : 'Dark mode'}
                  </button>
                </div>
              </Panel>
              {backgroundVariant === 'blueprint' ? (
                <BlueprintBackground colorMode={colorMode} />
              ) : (
                <Background
                  id={`background-${backgroundVariant}`}
                  variant={backgroundVariant}
                />
              )}
              {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
              <Controls />
              <MiniMap nodeColor={getMiniMapNodeColor} />
        </ReactFlow>
      </FlowMetricsProvider>
      <Modals />
    </div>
  );
}

function App() {
  return (
    <DataProvider>
      <ReactFlowProvider>
        <ModalProvider>
          <FlowCanvas />
        </ModalProvider>
      </ReactFlowProvider>
    </DataProvider>
  );
}

export default App
