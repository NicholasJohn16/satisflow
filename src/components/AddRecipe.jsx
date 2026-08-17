import { useModal } from "../contexts/modal";
import { useReactFlow } from '@xyflow/react';

function AddRecipe() {
    const { openModal } = useModal();
    const { screenToFlowPosition } = useReactFlow();

    const addFactory = () => {
        const position = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });

        openModal('recipes', { position });
    };

    return (
        <>
            <button className="default" onClick={addFactory}>Add Factory</button>
        </>
    )

}

export default AddRecipe;

