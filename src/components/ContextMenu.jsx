import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { isEdge, isNode } from '@xyflow/react';
import { useModal } from '../contexts/modal';
 
export default function ContextMenu({
  element,
  top,
  left,
  right,
  bottom,
  ...props
}) {
  console.log(arguments, 'arguments');
  const { deleteElements, getNode, getEdges } = useReactFlow();
  const { openModal, setNode } = useModal();
  const isDev = process.env.NODE_ENV === 'development';

  const deleteEdge = () => {
    const elements = {};

    if(isNode(element)) { elements.nodes = [element]};
    if(isEdge(element)) { elements.edges = [element]};

    deleteElements(elements);
  }

  const showRecipeModal = () => {
    setNode(element);
    openModal('recipe');
  }

  const logConnections = () => {

  };
  const logEdges = () => {
    console.log(element);
    console.log(getEdges());
  };
 
  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu"
      {...props}
    >
      <button onClick={deleteEdge}>Delete</button>
      {isNode(element) && <button onClick={showRecipeModal}>Edit</button>}
      {isDev && isNode(element) && <button onClick={logConnections}>Log Connections</button>}
      {isDev && isNode(element) && <button onClick={logEdges}>Log Edges</button>}
    </div>
  );
}