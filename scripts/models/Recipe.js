import { MdAccountBalance } from "react-icons/md";

export default class Recipe {

    constructor(input) {
        this.className = input.ClassName;
        this.duration = parseFloat(input.mManufactoringDuration);
        this.displayName = input.mDisplayName;
        this.producedIn = this.convertConstructorsToArray(input.mProducedIn);
        this.ingredients = {...this.convertItemsToArray(input.mIngredients)};
        this.products = {...this.convertItemsToArray(input.mProduct)};
    }
    
    convertItemsToArray(input) {
        const pattern = /\.(Desc_[^\']+|BP_ItemDescriptorPortableMiner_C)'",Amount=(\d+)/g;
        const matches = [...input.matchAll(pattern)];

        // return matches.map(match => ({
        //     name: match[1],
        //     amount: parseInt(match[2], 10),
        // }));

        return matches.reduce((accumulator, match) => {
            return {...accumulator, [match[1]]: {
                name: match[1],
                amount: parseInt(match[2], 10),
            }}
        }, {});
    }

    convertConstructorsToArray(producedIn) {
        const pattern = /\.(Build_.*?_C)/g;
        const matches = [...producedIn.matchAll(pattern)];

        // return matches.map(match => match[1]);

        if(matches.length) {
            return matches[0][1];
        }

        return null;
    }

}