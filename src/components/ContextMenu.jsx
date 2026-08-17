import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { isEdge, isNode } from '@xyflow/react';
import {
  MdDeleteOutline,
  MdEdit,
  MdLockOpen,
  MdLockOutline,
  MdRotateRight,
} from 'react-icons/md';
import { useModal } from '../contexts/modal';
import { getNextConnectorLayout } from '../connectorPositions';
 
export default function ContextMenu({
  element,
  top,
  left,
  right,
  bottom,
  ...props
}) {
  const { deleteElements, getNode, updateNode, updateNodeData } = useReactFlow();
  const { openModal, setNode } = useModal();
  const canRotateConnectors = isNode(element) && (
    element.type === 'recipeNode'
    || element.type === 'resourceNode'
    || element.type === 'powerPlantNode'
  );
  const canLockPosition = isNode(element) && element.type === 'resourceNode';
  const positionIsLocked = canLockPosition && element.data?.layoutLocked === true;

  const deleteEdge = () => {
    const elements = {};

    if(isNode(element)) { elements.nodes = [element]};
    if(isEdge(element)) { elements.edges = [element]};

    deleteElements(elements);
  }

  const showRecipeModal = () => {
    setNode(element);
    const modal = element.type === 'resourceNode'
      ? 'resourceNode'
      : element.type === 'powerPlantNode'
        ? 'powerPlantNode'
        : 'recipe';
    openModal(modal);
  }

  const rotateConnectorPosition = () => {
    const currentNode = getNode(element.id) ?? element;
    const connectorLayout = getNextConnectorLayout(
      currentNode.data?.connectorLayout ?? 'vertical',
    );

    updateNodeData(element.id, { connectorLayout });
  };

  const togglePositionLock = () => {
    const currentNode = getNode(element.id) ?? element;
    const layoutLocked = currentNode.data?.layoutLocked !== true;

    updateNode(element.id, {
      data: { ...currentNode.data, layoutLocked },
      draggable: layoutLocked ? false : undefined,
    }, { replace: false });
  };

  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu"
      role="menu"
      aria-label={isNode(element) ? 'Node actions' : 'Connection actions'}
      {...props}
    >
      {isNode(element) && (
        <button className="context-menu__item" onClick={showRecipeModal} role="menuitem" type="button">
          <MdEdit aria-hidden="true" />
          <span>Edit</span>
        </button>
      )}
      {canRotateConnectors && (
        <button className="context-menu__item" onClick={rotateConnectorPosition} role="menuitem" type="button">
          <MdRotateRight aria-hidden="true" />
          <span>Rotate Connectors</span>
        </button>
      )}
      {canLockPosition && (
        <button
          aria-checked={positionIsLocked}
          className="context-menu__item"
          onClick={togglePositionLock}
          role="menuitemcheckbox"
          type="button"
        >
          {positionIsLocked
            ? <MdLockOpen aria-hidden="true" />
            : <MdLockOutline aria-hidden="true" />}
          <span>{positionIsLocked ? 'Unlock Position' : 'Lock Position'}</span>
        </button>
      )}
      {isNode(element) && <div className="context-menu__separator" role="separator" />}
      <button
        className="context-menu__item context-menu__item--danger"
        onClick={deleteEdge}
        role="menuitem"
        type="button"
      >
        <MdDeleteOutline aria-hidden="true" />
        <span>Delete</span>
      </button>
    </div>
  );
}
