// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import '@xyflow/react/dist/style.css';
import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Panel
} from '@xyflow/react';
import RecipeNode from './components/RecipeNode';
import AddRecipe from './components/AddRecipe';
import TestNode from './components/TestNode';
import ContextMenu from './components/ContextMenu';
import DevTools from './components/Devtools/Devtools';
import { ModalProvider } from './contexts/modal';
import { DataProvider } from './contexts/data';
import RecipeModal from './components/RecipeModal';
import RecipesModal from './components/RecipesModal';
import ItemEdge from './components/ItemEdge';
import Modals from './components/Modals';

const proOptions = { hideAttribution: true };
const initialNodes = [];
const initialEdges = [];

const nodeTypes = {recipeNode: RecipeNode, testNode: TestNode};
const edgeTypes = {itemEdge: ItemEdge};


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

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const snapGrid = [10, 10];
  const [menu, setMenu] = useState(null);
  const ref = useRef(null);
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
 
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <DataProvider>
        <ReactFlowProvider>
          <ModalProvider>
            <ReactFlow
              ref={ref}
              nodes={nodes}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              // onConnect={onConnect}
              proOptions={proOptions}
              // colorMode="dark"
              snapToGrid={true}
              snapGrid={snapGrid}
              defaultEdgeOptions={{type: 'smoothstep'}}
              onEdgeContextMenu={onContextMenu}
              onNodeContextMenu={onContextMenu}
              onPaneClick={onPaneClick}
              >
              <Panel position='top-center'>
                <AddRecipe />
              </Panel>
              <Background color="#ccc" variant='dots' />
              {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
              <Controls />
              <MiniMap />
              <DevTools />
            </ReactFlow>
            <Modals />
          </ModalProvider>
        </ReactFlowProvider>
      </DataProvider>
    </div>
  );
}

export default App
