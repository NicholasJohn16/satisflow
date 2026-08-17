import { useModal } from '../contexts/modal';
import RecipeModal from './RecipeModal';
import RecipesModal from './RecipesModal';
import ResourceNodeModal from './ResourceNodeModal';
import PowerPlantModal from './PowerPlantModal';
import ConnectionNodeTypeModal from './ConnectionNodeTypeModal';

export default function Modals() {
    const { isOpen } = useModal();

    return (
        <>
            {isOpen.recipe && <RecipeModal />}
            {isOpen.recipes && <RecipesModal />}
            {isOpen.resourceNode && <ResourceNodeModal />}
            {isOpen.powerPlantNode && <PowerPlantModal />}
            {isOpen.connectionNodeType && <ConnectionNodeTypeModal />}
        </>
    )
}
