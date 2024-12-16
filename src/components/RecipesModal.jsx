import data from '../data.json';
const { items, recipes, constructors } = data;
import { useModal } from '../contexts/modal';
import { useReactFlow } from '@xyflow/react';
import Modal from "react-modal";
import RecipeCard from "./RecipeCard";
import { memo } from 'react';

Modal.setAppElement('#root');

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    //   backgroundColor: '#000',
      overflowX: 'scroll',
      width: '75vw',
      height: '75vh',
      borderRadius: '.5rem'
    },
    recipes: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: "1rem"
    },
    recipe: {
        border: '1px solid #333',
        margin: '1rem',
        display: 'flex',
        flexDirection: 'column',
        width: 'calc( 8.33333333% - 2px - 3rem)',
        borderRadius: '.5rem',
        padding: '.5rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
};

const RecipesModal = memo(function RecipesModal() {
    const { isOpen, closeModal, search, setSearch } = useModal();
    const { addNodes } = useReactFlow();
    console.log('RecipesModal');

    const addRecipeNode = (recipe) => {
        console.log('addRecipeNode');
        const newNode = {
          id: Date.now().toString(),
          type: 'recipeNode',
          position: {x: 100, y: 100},
          data: {recipe}
        }
    
        addNodes([newNode]);
        setSearch('');
        closeModal();
    }

    const getName = (item) => items[item.name].displayName.toLowerCase();

    const filteredRecipes = !search ? Object.values(recipes) : Object.values(recipes).filter((recipe) => {
        if(!search) return true;
        
        if(recipe.displayName.toLowerCase().includes(search.toLowerCase())) {
            return true;
        }

        const filteredIngredients = Object.values(recipe.ingredients).some(ingredient => {
            return getName(ingredient).includes(search.toLowerCase());
        });

        if(filteredIngredients) { return true }

        const filteredProducts = Object.values(recipe.products).some(product => {
            return getName(product).includes(search.toLowerCase());
        });
        
        if(filteredProducts) { return true}

        return false;
    });

    // console.log(filteredRecipes, 'filteredRecipes');

    return (
        <Modal
            isOpen={isOpen.recipes}
            onRequestClose={closeModal}
            style={customStyles}
        >
            <input
                className="recipe-search"
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <div style={customStyles.recipes}>
                {filteredRecipes.map((recipe) => (
                    <RecipeCard 
                        key={recipe.className}
                        recipe={recipe} 
                        onClick={() => addRecipeNode(recipe)}
                    />
                ))}
            </div>
        </Modal>
    )
});

export default RecipesModal;