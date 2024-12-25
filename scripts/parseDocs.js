import { readFileSync, writeFileSync } from 'fs';
import Item from './models/Item.js'
import Recipe from './models/Recipe.js';

// Load and parse JSON file
const filePath = `C:\\Program Files (x86)\\Steam\\steamapps\\common\\Satisfactory\\CommunityResources\\Docs\\en-US.json`;
const file = readFileSync(filePath, 'utf16le').slice(1);
const json = JSON.parse(file);

const constructors = {
    "Build_AssemblerMk1_C": { 
        name: "Assembler",
        powerUsage: 15,
        somersloopSlots: 2,
        width: 10,
        length: 15,
        height: 11,
        className: "Build_AssemblerMk1_C"
    },
    "Build_Blender_C": {
        name: "Blender",
        powerUsage: 75,
        somersloopSlots: 4,
        width: 18,
        length: 16,
        height: 15,
        className: "Build_Blender_C"
    },
    "Build_ConstructorMk1_C": {
        name: "Constructor",
        powerUsage: 4,
        somersloopSlots: 1,
        width: 7.9,
        length: 9.9,
        height: 8,
        className: "Build_ConstructorMk1_C"
    },
    "Build_Converter_C": {
        name: "Converter",
        powerUsage: 250,
        somersloopSlots: 2,
        width: 16,
        length: 16,
        height: 16,
        className: "Build_Converter_C"
    },
    "Build_FoundryMk1_C": {
        name: "Foundry",
        powerUsage: 16,
        somersloopSlots: 2,
        width: 10,
        length: 9,
        height: 9,
        className: "Build_FoundryMk1_C"
    },
    "Build_HadronCollider_C": {
        name: "Hadron Collider",
        powerUsage: 750,
        somersloopSlots: 4,
        width: 24,
        length: 38,
        height: 32,
        className: "Build_HadronCollider_C"
    },
    "Build_ManufacturerMk1_C": {
        name: "Manufacturer",
        powerUsage: 55,
        somersloopSlots: 4,
        width: 18,
        length: 20,
        height: 12,
        className: "Build_ManufacturerMk1_C"
    },
    "Build_OilRefinery_C": {
        name: "Oil Refinery",
        powerUsage: 30,
        somersloopSlots: 2,
        width: 10,
        length: 20,
        height: 31,
        className: "Build_OilRefinery_C"
    },
    "Build_Packager_C": {
        name: "Packer",
        powerUsage: 10,
        somersloopSlots: 0,
        width: 8,
        length: 8,
        height: 12,
        className: "Build_Packager_C"
    },
    "Build_QuantumEncoder_C": {
        name: "Quantum Encoder",
        powerUsage: 1000,
        somersloopSlots: 4,
        width: 22,
        length: 48,
        height: 18,
        className: "Build_QuantumEncoder_C"
    },
    "Build_SmelterMk1_C": {
        name: "Smelter",
        powerUsage: 4,
        somersloopSlots: 1,
        width: 5,
        length: 9,
        height: 9,
        className: "Build_SmelterMk1_C"
    },
};

const nativeClasses = {
    items: "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptor'",
    recipes: "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'",
    special: "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptorPowerBoosterFuel'",
    resources: "/Script/CoreUObject.Class'/Script/FactoryGame.FGResourceDescriptor'",
    nuclearFuel: "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptorNuclearFuel'",
    biomass: "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptorBiomass'",
    ammo: "/Script/CoreUObject.Class'/Script/FactoryGame.FGAmmoTypeProjectile'",
    shard: "/Script/CoreUObject.Class'/Script/FactoryGame.FGPowerShardDescriptor'",
    ammo2: "/Script/CoreUObject.Class'/Script/FactoryGame.FGAmmoTypeInstantHit'",
    shatter: "/Script/CoreUObject.Class'/Script/FactoryGame.FGAmmoTypeSpreadshot'",
};

// Filter recipes
let recipes = json.filter(item => item.NativeClass === nativeClasses.recipes);
let items = json.filter(item => item.NativeClass === nativeClasses.items);
let special = json.filter(item => item.NativeClass === nativeClasses.special);
let resources = json.filter(item => item.NativeClass === nativeClasses.resources);
let nuclearFuel = json.filter(item => item.NativeClass === nativeClasses.nuclearFuel);
let biomass = json.filter(item => item.NativeClass === nativeClasses.biomass);
let ammo = json.filter(item => item.NativeClass === nativeClasses.ammo);
let shard = json.filter(item => item.NativeClass === nativeClasses.shard);
let ammo2 = json.filter(item => item.NativeClass === nativeClasses.ammo2);
let shatter = json.filter(item => item.NativeClass === nativeClasses.shatter);

// Extract classes
recipes = [...recipes[0].Classes];
items = [
    ...items[0].Classes,
    ...special[0].Classes,
    ...resources[0].Classes,
    ...nuclearFuel[0].Classes,
    ...biomass[0].Classes,
    ...ammo[0].Classes,
    ...shard[0].Classes,
    ...ammo2[0].Classes,
    ...shatter[0].Classes,
];

// Sort recipes and items by mDisplayName
recipes.sort((a, b) => a.mDisplayName.localeCompare(b.mDisplayName));
items.sort((a, b) => a.mDisplayName.localeCompare(b.mDisplayName));

// const allProducedIn = new Set();
// recipes.forEach(recipe => {
//     allProducedIn.add(recipe.mProducedIn);
// });
// writeFileSync('./src/allProducedIn.json', JSON.stringify([...allProducedIn], (key, value) => value, 2));

let outputItems = items.map(item => new Item(item));
let outputRecipes = recipes.map(recipe => new Recipe(recipe));

outputRecipes = outputRecipes.filter(recipe => {
    if(recipe.ClassName === 'Recipe_IronRod_C') {
        console.log(recipe, 'recipe');
    }
    // return recipe.producedIn.some(value => Object.keys(constructors).includes(value));
    if(recipe.className.includes('Recipe_Alternate_AutomatedMiner_C')) { return false; }
    return Object.keys(constructors).includes(recipe.producedIn);
});

outputItems = outputItems.reduce((accumulator, item) => {
    accumulator[item.className] = item;
    return accumulator;
}, {});

outputRecipes = outputRecipes.reduce((accumulator, recipe) => {
    accumulator[recipe.className] = recipe;
    return accumulator;
}, {});


let output = {recipes: outputRecipes, items: outputItems, constructors};
output = JSON.stringify(output, (key, value) => value, 2);

writeFileSync('./src/data.json', output);

console.log(`${Object.keys(outputItems).length} items and ${Object.keys(outputRecipes).length} recipes saved to data.json.`);