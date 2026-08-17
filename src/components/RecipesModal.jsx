import { useModal } from '../contexts/modal';
import { addEdge, useReactFlow } from '@xyflow/react';
import { IoCloseOutline , IoSearchOutline  } from "react-icons/io5";
import Modal from "react-modal";
import RecipeCard from "./RecipeCard";
import { memo } from 'react';
import { useData } from '../contexts/data';
import { getShape, getShapeForItemAmount } from '../functions';
import { getInputHandleId, getOutputHandleId } from '../resourceConnections';

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    overflow: 'hidden',
    width: '786px',
    height: '712px',
    borderRadius: '.5rem',
    padding: '0',
  }
};

const RecipesModal = memo(function RecipesModal() {
    const {
        isOpen,
        closeModal,
        recipeFilter,
        recipeConnection,
        recipePosition,
        search,
        setSearch,
    } = useModal();
    const { addNodes, setEdges } = useReactFlow();
    const { items, recipes, constructors } = useData();

    const addRecipeNode = (recipe) => {
        const factory = constructors[recipe.producedIn];
        const data = recipeConnection
          ? getShapeForItemAmount({
              recipe,
              factory,
              source: recipeConnection.fromHandleType === 'source'
                ? 'ingredients'
                : 'products',
              item: recipeConnection.resource,
              amount: recipeConnection.amount,
            })
          : getShape({ recipe, factory });
        const newNodeId = Date.now().toString();
        const newNode = {
          id: newNodeId,
          type: 'recipeNode',
          position: recipePosition ?? {x: 100, y: 100},
          origin: [0.5, 0.5],
          data,
        };

        addNodes([newNode]);
        if (recipeConnection) {
          const isExtendingOutput = recipeConnection.fromHandleType === 'source';
          const targetHandleIndex = Object.keys(data.ingredients)
            .indexOf(recipeConnection.resource);
          const connection = isExtendingOutput
            ? {
                source: recipeConnection.fromNodeId,
                sourceHandle: recipeConnection.fromHandleId,
                target: newNodeId,
                targetHandle: getInputHandleId(newNodeId, targetHandleIndex),
              }
            : {
                source: newNodeId,
                sourceHandle: getOutputHandleId(newNodeId, recipeConnection.resource),
                target: recipeConnection.fromNodeId,
                targetHandle: recipeConnection.fromHandleId,
              };

          setEdges((edges) => addEdge({
            ...connection,
            type: 'itemEdge',
            data: {
              item: items[recipeConnection.resource],
              resource: recipeConnection.resource,
            },
          }, edges));
        }
        setSearch('');
        closeModal();
    }

    const getName = (item) => items[item.name].displayName.toLowerCase();

    const filteredRecipes = Object.values(recipes).filter((recipe) => {
        if (recipeFilter && !Object.hasOwn(
            recipe[recipeFilter.recipeSide] ?? {},
            recipeFilter.resource,
        )) {
            return false;
        }

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

    return (
        <Modal
            isOpen={isOpen.recipes}
            onRequestClose={closeModal}
            style={customStyles}
        >
            <div className="modal-header">
                Select a recipe
                <button className="modal-close" onClick={closeModal}>
                    <IoCloseOutline />
                </button>
            </div>
            <div className="modal-subheader">
                <div className="recipe-search">
                    <IoSearchOutline aria-hidden="true" />
                    <input
                        aria-label="Search recipes"
                        className="recipe-search__input"
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search recipes, ingredients, or products"
                    />
                </div>
            </div>
            <div className="recipes">
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
