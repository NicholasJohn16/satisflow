import { useData } from '../contexts/data';
import ItemImage from './ItemImage';

const styles = {
    img: {
        verticalAlign: 'middle',
        height: '1rem',
        marginLeft: '.25rem'
    },
}

export default function RecipeItem({recipe, item}) {
    const { items } = useData();
    const amount = (60 / recipe.duration ) * item.amount;
    return (
        <div 
            className="recipe-item"
            key={item.className}
            style={styles.div}
            title={`${amount}x ${items[item.name].displayName}`}
        >
            {amount.toLocaleString()}
            <ItemImage
                style={styles.img} 
                item={item}
            />
        </div>
    )
}