import { useData } from '../contexts/data';

export default function ItemImage({item, ...props}) {
    const { items } = useData();
    const isObject = typeof item === 'object';
    const icon =  isObject ? Object.hasOwn(item, 'icon') ? item.icon : items[item.name].icon : items[item].icon;
    const title = isObject ? Object.hasOwn(item, 'displayName') ? item.displayName : items[item.name].displayName : items[item].displayName;

    return (
        <img
            title={title}
            className="no-drag"
            draggable="false"
            src={`./img/icons/${icon}_256.png`} 
            {...props}
        />
    )
}