const POWER_PLANTS = {
    coal: {
        label: 'Coal-Powered Generator',
        length: 26,
        power: 75,
        width: 10,
        supplement: { resource: 'Desc_Water_C', amount: 45 },
        fuels: {
            coal: { label: 'Coal', resource: 'Desc_Coal_C', amount: 15 },
            compactedCoal: {
                label: 'Compacted Coal',
                resource: 'Desc_CompactedCoal_C',
                amount: 50 / 7,
            },
            petroleumCoke: {
                label: 'Petroleum Coke',
                resource: 'Desc_PetroleumCoke_C',
                amount: 25,
            },
        },
        img: 'Coal-Powered_Generator',
    },
    fuel: {
        label: 'Fuel-Powered Generator',
        length: 20,
        power: 250,
        width: 20,
        fuels: {
            fuel: { label: 'Fuel', resource: 'Desc_LiquidFuel_C', amount: 20 },
            liquidBiofuel: {
                label: 'Liquid Biofuel',
                resource: 'Desc_LiquidBiofuel_C',
                amount: 20,
            },
            turbofuel: {
                label: 'Turbofuel',
                resource: 'Desc_LiquidTurboFuel_C',
                amount: 7.5,
            },
            rocketFuel: {
                label: 'Rocket Fuel',
                resource: 'Desc_RocketFuel_C',
                amount: 25 / 6,
            },
            ionizedFuel: {
                label: 'Ionized Fuel',
                resource: 'Desc_IonizedFuel_C',
                amount: 3,
            },
        },
        img: 'Fuel-Powered_Generator',
    },
    nuclear: {
        label: 'Nuclear Power Plant',
        length: 43,
        power: 2500,
        width: 38,
        supplement: { resource: 'Desc_Water_C', amount: 240 },
        fuels: {
            uranium: {
                label: 'Uranium Fuel Rod',
                resource: 'Desc_NuclearFuelRod_C',
                amount: 0.2,
                product: { resource: 'Desc_NuclearWaste_C', amount: 10 },
            },
            plutonium: {
                label: 'Plutonium Fuel Rod',
                resource: 'Desc_PlutoniumFuelRod_C',
                amount: 0.1,
                product: { resource: 'Desc_PlutoniumWaste_C', amount: 1 },
            },
            ficsonium: {
                label: 'Ficsonium Fuel Rod',
                resource: 'Desc_FicsoniumFuelRod_C',
                amount: 1,
            },
        },
        img: 'Nuclear_Power_Plant',
    },
};

const clamp = (value, minimum, maximum) => (
    Math.min(Math.max(Number(value) || minimum, minimum), maximum)
);

const round = (value) => Math.round(value * 1e10) / 1e10;

const getPowerPlantFuelIds = (plantType) => (
    Object.keys(POWER_PLANTS[plantType]?.fuels ?? {})
);

const getPowerPlantFuelForResource = (resource) => {
    for (const [plantType, plant] of Object.entries(POWER_PLANTS)) {
        for (const [fuelId, fuel] of Object.entries(plant.fuels)) {
            if (fuel.resource === resource) {
                return { fuel, fuelId, plant, plantType };
            }
        }
    }

    return null;
};

const isPowerPlantFuel = (resource) => (
    getPowerPlantFuelForResource(resource) !== null
);

const getClockSpeedForPowerPlantFuel = (amount, baseAmount) => {
    const numericBaseAmount = Number(baseAmount);

    if (!Number.isFinite(numericBaseAmount) || numericBaseAmount <= 0) {
        return 0.01;
    }

    return clamp(Number(amount) / numericBaseAmount, 0.01, 2.5);
};

const getPowerPlantData = (plantType = 'coal', fuelId, settings = {}) => {
    const selectedPlantType = Object.hasOwn(POWER_PLANTS, plantType)
        ? plantType
        : 'coal';
    const plant = POWER_PLANTS[selectedPlantType];
    const fuelIds = getPowerPlantFuelIds(selectedPlantType);
    const selectedFuelId = Object.hasOwn(plant.fuels, fuelId)
        ? fuelId
        : fuelIds[0];
    const fuel = plant.fuels[selectedFuelId];
    const machineCount = Math.max(Math.round(Number(settings.machineCount) || 1), 1);
    const clockSpeed = clamp(settings.clockSpeed ?? 1, 0.01, 2.5);
    const multiplier = machineCount * clockSpeed;
    const ingredients = {
        [fuel.resource]: round(fuel.amount * multiplier),
    };
    const products = {};

    if (plant.supplement) {
        ingredients[plant.supplement.resource] = round(
            plant.supplement.amount * multiplier,
        );
    }
    if (fuel.product) {
        products[fuel.product.resource] = round(fuel.product.amount * multiplier);
    }

    return {
        clockSpeed,
        energyProduction: round(plant.power * multiplier),
        fuel: selectedFuelId,
        ingredients,
        machineCount,
        plantType: selectedPlantType,
        products,
    };
};

const getPowerPlantDataForFuelAmount = (resource, amount) => {
    const match = getPowerPlantFuelForResource(resource);

    if (!match) return null;

    const requestedAmount = Math.max(Number(amount) || 0, match.fuel.amount * 0.01);
    const machineCount = Math.max(
        Math.ceil(requestedAmount / (match.fuel.amount * 2.5)),
        1,
    );
    const clockSpeed = getClockSpeedForPowerPlantFuel(
        requestedAmount,
        match.fuel.amount * machineCount,
    );

    return getPowerPlantData(match.plantType, match.fuelId, {
        clockSpeed,
        machineCount,
    });
};

export {
    getClockSpeedForPowerPlantFuel,
    getPowerPlantData,
    getPowerPlantDataForFuelAmount,
    getPowerPlantFuelForResource,
    getPowerPlantFuelIds,
    isPowerPlantFuel,
    POWER_PLANTS,
};
