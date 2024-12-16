import { useModal } from '../contexts/modal';
import RecipeModal from './RecipeModal';
import RecipesModal from './RecipesModal';

export default function Modals() {
    const { isOpen } = useModal();

    return (
        <>
            {isOpen.recipe && <RecipeModal />}
            {isOpen.recipes && <RecipesModal />}
        </>
    )
}