import { useData } from '../contexts/data';
import ItemImage from './ItemImage';

const styles = {
    img: {
        verticalAlign: 'middle',
        height: '1rem',
        marginLeft: '.25rem'
    },
}

export default function RecipeItem({item, amount}) {
    const { getItem } = useData();
    const currentItem = getItem(item);
    // const amount = (60 / recipe.duration ) * item.amount;
    return (
        <div 
            className="recipe-item"
            key={currentItem.className}
            style={styles.div}
            title={`${amount}x ${currentItem.displayName}`}
        >
            {amount.toLocaleString()}
            <ItemImage
                style={styles.img} 
                item={currentItem}
            />
        </div>
    )
}