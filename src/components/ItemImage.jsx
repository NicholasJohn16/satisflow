import { useData } from '../contexts/data';

export default function ItemImage({item, ...props}) {
    const { items } = useData();
    const isObject = typeof item === 'object';
    const itemId = isObject ? item.className ?? item.name : item;
    const fallbackIcons = {
        Desc_NitrogenGas_C: 'IconDesc_NitrogenGas',
        Desc_Water_C: 'LiquidWater_Pipe',
        Desc_CrystalShard_C: 'PowerShard',
    };
    const icon = (isObject
        ? Object.hasOwn(item, 'icon') ? item.icon : items[item.name].icon
        : items[item].icon) ?? fallbackIcons[itemId];
    const title = isObject ? Object.hasOwn(item, 'displayName') ? item.displayName : items[item.name].displayName : items[item].displayName;

    return (
        <img
            title={`${item.amount} × ${title}`}
            className="no-drag"
            draggable="false"
            loading="lazy"
            src={`./img/icons/${icon}_256.png`} 
            {...props}
        />
    )
}
