import { useReactFlow } from '@xyflow/react';
import { useModal } from '../contexts/modal';
import { getResourceNodeData } from '../resourceNodes';

export default function AddResourceNode() {
    const { addNodes, screenToFlowPosition } = useReactFlow();
    const { openModal, setNode } = useModal();

    const addResourceNode = () => {
        const viewportCenter = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });
        const newNode = {
            id: `resource-${Date.now()}`,
            type: 'resourceNode',
            position: viewportCenter,
            origin: [0.5, 0.5],
            data: getResourceNodeData('Desc_OreIron_C'),
        };

        addNodes([newNode]);
        setNode(newNode);
        openModal('resourceNode', { isNew: true });
    };

    return (
        <button className="default" onClick={addResourceNode}>
            Add Resource Node
        </button>
    );
}
