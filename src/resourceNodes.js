const RESOURCE_NODE_RESOURCES = [
    'Desc_OreIron_C',
    'Desc_OreCopper_C',
    'Desc_Stone_C',
    'Desc_Coal_C',
    'Desc_OreGold_C',
    'Desc_RawQuartz_C',
    'Desc_Sulfur_C',
    'Desc_OreBauxite_C',
    'Desc_OreUranium_C',
    'Desc_SAM_C',
    'Desc_LiquidOil_C',
    'Desc_Water_C',
    'Desc_NitrogenGas_C',
];

const RESOURCE_NODE_QUALITIES = {
    impure: {
        label: 'Impure',
        amount: 30,
    },
    normal: {
        label: 'Normal',
        amount: 60,
    },
    pure: {
        label: 'Pure',
        amount: 120,
    },
};

const RESOURCE_NODE_MINERS = {
    1: {
        image: './img/Miner_Mk.1.png',
        label: 'Miner Mk.1',
        length: 14,
        multiplier: 1,
        powerUsage: 5,
        width: 6,
    },
    2: {
        image: './img/Miner_Mk.2.png',
        label: 'Miner Mk.2',
        length: 14,
        multiplier: 2,
        powerUsage: 15,
        width: 6,
    },
    3: {
        image: './img/Miner_Mk.3.png',
        label: 'Miner Mk.3',
        length: 14,
        multiplier: 4,
        powerUsage: 45,
        width: 6,
    },
};

// Define or replace extractor images here. Paths are served from public/img.
const RESOURCE_NODE_EXTRACTORS = {
    ...RESOURCE_NODE_MINERS,
    oil: {
        image: './img/Oil_Extractor.png',
        label: 'Oil Extractor',
        length: 20,
        multiplier: 2,
        powerUsage: 40,
        width: 12,
    },
    water: {
        image: './img/Water_Extractor.png',
        label: 'Water Extractor',
        length: 19.5,
        multiplier: 1,
        powerUsage: 20,
        width: 20,
    },
    well: {
        image: './img/Resource_Well_Pressurizer.png',
        label: 'Resource Well Pressurizer',
        length: 4,
        multiplier: 1,
        powerUsage: 150,
        width: 4,
    },
};

const clamp = (value, minimum, maximum) => (
    Math.min(Math.max(Number(value) || minimum, minimum), maximum)
);

const getClockSpeedForResourceOutput = (amount, baseAmount) => {
    const numericBaseAmount = Number(baseAmount);

    if (!Number.isFinite(numericBaseAmount) || numericBaseAmount <= 0) {
        return 0.01;
    }

    return clamp(Number(amount) / numericBaseAmount, 0.01, 2.5);
};

const getResourceNodeData = (resource, quality = 'normal', settings = {}) => {
    const selectedResource = RESOURCE_NODE_RESOURCES.includes(resource)
        ? resource
        : RESOURCE_NODE_RESOURCES[0];
    const isWater = selectedResource === 'Desc_Water_C';
    const isOil = selectedResource === 'Desc_LiquidOil_C';
    const selectedQuality = !isWater && Object.hasOwn(RESOURCE_NODE_QUALITIES, quality)
        ? quality
        : 'normal';
    const isGas = selectedResource === 'Desc_NitrogenGas_C';
    const requestedMinerTier = String(settings.minerTier ?? '3');
    const minerTier = isWater
        ? 'water'
        : isGas
            ? 'well'
        : isOil
            ? 'oil'
        : Object.hasOwn(RESOURCE_NODE_MINERS, requestedMinerTier)
            ? requestedMinerTier
            : '3';
    const machineCount = Math.max(Math.round(Number(settings.machineCount) || 1), 1);
    const clockSpeed = clamp(settings.clockSpeed ?? 1, 0.01, 2.5);
    const extractor = RESOURCE_NODE_EXTRACTORS[minerTier];
    const minerMultiplier = extractor.multiplier;
    const basePowerUsage = extractor.powerUsage;
    const energyUsage = Math.round(
        basePowerUsage
        * (clockSpeed ** (Math.log(2.5) / Math.log(2)))
        * machineCount
        * 1e10,
    ) / 1e10;
    const amount = Math.round(
        (isWater ? 120 : RESOURCE_NODE_QUALITIES[selectedQuality].amount)
        * minerMultiplier
        * clockSpeed
        * machineCount
        * 1e10,
    ) / 1e10;

    return {
        clockSpeed,
        energyUsage,
        ingredients: {},
        machineCount,
        minerTier,
        products: {
            [selectedResource]: amount,
        },
        quality: selectedQuality,
        resource: selectedResource,
    };
};

const getResourceNodeDataForOutput = (
    resource,
    amount,
    quality = 'normal',
    settings = {},
) => {
    const baseData = getResourceNodeData(resource, quality, {
        ...settings,
        clockSpeed: 1,
        machineCount: 1,
    });
    const baseAmount = baseData.products[baseData.resource];
    const requestedAmount = Math.max(Number(amount) || 0, baseAmount * 0.01);
    const machineCount = Math.max(Math.ceil(requestedAmount / baseAmount), 1);
    const clockSpeed = getClockSpeedForResourceOutput(
        requestedAmount,
        baseAmount * machineCount,
    );

    return getResourceNodeData(resource, quality, {
        ...settings,
        clockSpeed,
        machineCount,
    });
};

export {
    getClockSpeedForResourceOutput,
    getResourceNodeData,
    getResourceNodeDataForOutput,
    RESOURCE_NODE_EXTRACTORS,
    RESOURCE_NODE_MINERS,
    RESOURCE_NODE_QUALITIES,
    RESOURCE_NODE_RESOURCES,
};
