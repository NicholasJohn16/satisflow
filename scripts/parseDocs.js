import { readFileSync, writeFileSync } from 'fs';
import Item from './models/Item.js'
import Recipe from './models/Recipe.js';

// Load and parse JSON file
const filePath = `C:\\Program Files (x86)\\Steam\\steamapps\\common\\Satisfactory\\CommunityResources\\Docs\\en-US.json`;
const file = readFileSync(filePath, 'utf16le').slice(1);
const json = JSON.parse(file);

const constructors = {
    "Build_AssemblerMk1_C": "Assembler",
    "Build_Blender_C": "Blender",
    "Build_ConstructorMk1_C": "Constructor",
    "Build_Converter_C": "Converter",
    "Build_FoundryMk1_C": "Foundry",
    "Build_HadronCollider_C": "Hadron Collider",
    "Build_ManufacturerMk1_C": "Manufacturer",
    "Build_OilRefinery_C": "Oil Refinery",
    "Build_Packager_C": "Packer",
    "Build_QuantumEncoder_C": "Quantum Encoder",
    "Build_SmelterMk1_C": "Smelter",
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