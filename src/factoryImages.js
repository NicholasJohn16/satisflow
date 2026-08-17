const FACTORY_IMAGE_FILES = {
    Build_AssemblerMk1_C: 'assembler.png',
    Build_ConstructorMk1_C: 'constructor.png',
    Build_FoundryMk1_C: 'foundry.png',
    Build_ManufacturerMk1_C: 'manufacturer.png',
    Build_OilRefinery_C: 'refinery.png',
    Build_SmelterMk1_C: 'smelter.png',
};

const getFactoryImagePath = (factory) => {
    const imageFile = factory?.img ?? FACTORY_IMAGE_FILES[factory?.className];

    return imageFile ? `./img/${imageFile}.png` : null;
};

export { FACTORY_IMAGE_FILES, getFactoryImagePath };
