import { GoArrowRight, GoArrowLeft } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import ItemImage from "./ItemImage";
import { humanize } from "../humanize";

export default function RecipeCard({recipe, onClick}) {
    const cardRef = useRef(null);
    const [shouldLoadImages, setShouldLoadImages] = useState(
        () => typeof IntersectionObserver === 'undefined',
    );
    const isAlternate = recipe.className?.startsWith('Recipe_Alternate_')
        || /^Alternate:\s*/i.test(recipe.displayName);
    const title = recipe.displayName.replace(/^Alternate:\s*/i, '');
    const deferredImageProps = shouldLoadImages
        ? { decoding: 'async', loading: 'lazy' }
        : { src: undefined };

    useEffect(() => {
        if (shouldLoadImages || !cardRef.current) return undefined;

        const card = cardRef.current;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setShouldLoadImages(true);
                observer.disconnect();
            }
        }, {
            root: card.closest('.recipes'),
            rootMargin: '500px 0px',
        });

        observer.observe(card);
        return () => observer.disconnect();
    }, [shouldLoadImages]);

    return (
        <div className="recipe-card" onClick={onClick} ref={cardRef}>
            {isAlternate && (
                <div className="recipe-alternate">ALT</div>
            )}
            <div className="recipe-image">
                <ItemImage
                    height="256"
                    item={Object.values(recipe.products)[0]}
                    width="256"
                    {...deferredImageProps}
                />
            </div>
            <h5 className="recipe-title" title={title}>{title}</h5>
            <div className="recipe-body">
                <div className="recipe-ingredients">
                    <div className="recipe-arrow">
                        <GoArrowRight size={'16px'} />
                    </div>
                    {Object.values(recipe.ingredients).map(ingredient => (
                        <div className="recipe-ingredient" key={ingredient.name}>
                            <ItemImage
                                height="16"
                                item={ingredient}
                                width="16"
                                {...deferredImageProps}
                            />
                            <span className="recipe-ingredient-amount">{humanize(ingredient.amount)}</span>
                        </div>
                    ))}
                </div>
                <div className="recipe-products">
                    <div className="recipe-arrow">
                        <GoArrowLeft size={'16px'} />
                    </div>
                    {Object.values(recipe.products).map(product => (
                        <div className="recipe-product" key={product.name}>
                            <ItemImage
                                height="16"
                                item={product}
                                width="16"
                                {...deferredImageProps}
                            />
                            <span className="recipe-product-amount">{humanize(product.amount)}</span>
                        </div>
                    ))}
                </div>
            </div>
        
        </div>
    )
}
