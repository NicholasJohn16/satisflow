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
  const { deleteElements, getNode } = useReactFlow();
  const { openModal, setRecipe } = useModal();

  const deleteEdge = () => {
    const elements = {};

    if(isNode(element)) { elements.nodes = [element]};
    if(isEdge(element)) { elements.edges = [element]};

    deleteElements(elements);
  }

  const showRecipeModal = () => {
    setRecipe(element.data.recipe);
    openModal('recipe');
  }
 
  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu"
      {...props}
    >
      <button onClick={deleteEdge}>Delete</button>
      {isNode(element) && <button onClick={showRecipeModal}>Edit</button>}
    </div>
  );
}