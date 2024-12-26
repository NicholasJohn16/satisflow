import { MdLogin, MdLogout } from "react-icons/md";
import ItemImage from "./ItemImage";

export default function RecipeCard({recipe, onClick}) {
    const title = recipe.displayName.replace("Alternate: ", "");

    return (
        <div className="recipe-card" onClick={onClick}>
            <div className="recipe-image">
                <ItemImage item={Object.values(recipe.products)[0]} />
            </div>
            <h5 className="recipe-title" title={title}>{title}</h5>
            <div className="recipe-body">
                <div>
                    <MdLogin size={'16px'} />
                    {Object.values(recipe.ingredients).map(ingredient => (
                        <ItemImage item={ingredient} height="16" key={ingredient.name} />
                    ))}
                </div>
                <div>
                    {Object.values(recipe.products).map(product => (
                        <ItemImage item={product} height="16" key={product.name} />
                    ))}
                    <MdLogout size={'16px'} />
                </div>
            </div>
        
        </div>
    )
}