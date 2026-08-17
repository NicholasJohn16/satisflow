import { useReactFlow } from '@xyflow/react';
import { useModal } from '../contexts/modal';
import { getPowerPlantData } from '../powerPlants';

export default function AddPowerPlant() {
    const { addNodes, screenToFlowPosition } = useReactFlow();
    const { openModal, setNode } = useModal();

    const addPowerPlant = () => {
        const viewportCenter = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });
        const newNode = {
            id: `power-${Date.now()}`,
            type: 'powerPlantNode',
            position: viewportCenter,
            origin: [0.5, 0.5],
            data: getPowerPlantData(),
        };

        addNodes([newNode]);
        setNode(newNode);
        openModal('powerPlantNode', { isNew: true });
    };

    return (
        <button className="default" onClick={addPowerPlant}>
            Add Power Plant
        </button>
    );
}
