import { addEdge, useReactFlow } from '@xyflow/react';
import Modal from 'react-modal';
import { useData } from '../contexts/data';
import { useModal } from '../contexts/modal';
import { getInputHandleId, getOutputHandleId } from '../resourceConnections';
import { getResourceNodeDataForOutput } from '../resourceNodes';
import {
    getPowerPlantDataForFuelAmount,
    isPowerPlantFuel,
} from '../powerPlants';
import ItemImage from './ItemImage';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '.5rem',
        minWidth: '20rem',
    },
};

export default function ConnectionNodeTypeModal() {
    const {
        closeModal,
        connectionDropOptions,
        isOpen,
        openModal,
        setNode,
    } = useModal();
    const { addNodes, setEdges } = useReactFlow();
    const { items } = useData();

    if (!connectionDropOptions) return null;

    const { connection, position, recipeFilter, search } = connectionDropOptions;
    const resource = connection.resource;
    const isFuelOutput = connection.fromHandleType === 'source'
        && isPowerPlantFuel(resource);

    const addFactory = () => {
        openModal('recipes', {
            connection,
            position,
            recipeFilter,
            search,
        });
    };

    const addResourceNode = () => {
        const newNodeId = `resource-${Date.now()}`;
        const data = getResourceNodeDataForOutput(resource, connection.amount);

        addNodes([{
            id: newNodeId,
            type: 'resourceNode',
            position,
            origin: [0.5, 0.5],
            data,
        }]);
        setEdges((edges) => addEdge({
            source: newNodeId,
            sourceHandle: getOutputHandleId(newNodeId, resource),
            target: connection.fromNodeId,
            targetHandle: connection.fromHandleId,
            type: 'itemEdge',
            data: {
                item: items[resource],
                resource,
            },
        }, edges));
        closeModal();
    };

    const addPowerPlant = () => {
        const data = getPowerPlantDataForFuelAmount(resource, connection.amount);

        if (!data) return;

        const newNodeId = `power-${Date.now()}`;
        const targetHandleIndex = Object.keys(data.ingredients).indexOf(resource);
        const newNode = {
            id: newNodeId,
            type: 'powerPlantNode',
            position,
            origin: [0.5, 0.5],
            data,
        };

        addNodes([newNode]);
        setEdges((edges) => addEdge({
            source: connection.fromNodeId,
            sourceHandle: connection.fromHandleId,
            target: newNodeId,
            targetHandle: getInputHandleId(newNodeId, targetHandleIndex),
            type: 'itemEdge',
            data: {
                item: items[resource],
                resource,
            },
        }, edges));
        setNode(newNode);
        openModal('powerPlantNode', { isNew: true });
    };

    return (
        <Modal
            isOpen={isOpen.connectionNodeType}
            onRequestClose={closeModal}
            style={customStyles}
        >
            <div className="connection-node-type-modal__resource">
                <ItemImage item={resource} />
                <div>
                    <h2>{isFuelOutput ? `Use ${items[resource]?.displayName}` : `Add ${items[resource]?.displayName}`}</h2>
                    <p>
                        {isFuelOutput
                            ? 'Choose how this output should be used.'
                            : 'Choose how this input should be supplied.'}
                    </p>
                </div>
            </div>
            <div className="connection-node-type-modal__actions">
                <button className="default" onClick={addFactory}>Add Factory</button>
                {isFuelOutput && (
                    <button className="default" onClick={addPowerPlant}>Add Power Plant</button>
                )}
                {!isFuelOutput && (
                    <button className="default" onClick={addResourceNode}>Add Resource Node</button>
                )}
                <button className="default" onClick={closeModal}>Cancel</button>
            </div>
        </Modal>
    );
}
