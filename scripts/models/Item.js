export default class Item {

    #forms = {
        'RF_SOLID': 'solid',
        'RF_LIQUID': 'liquid', 
        'RF_GAS': 'gas'
    }
    
    constructor(input) {
        this.className = input.ClassName;
        this.displayName = input.mDisplayName;
        this.description = input.mDescription;
        this.icon = this.fetchIcon(input.mSmallIcon);
        this.form = Object.hasOwn(this.#forms, input.mForm) ? this.#forms[input.mForm] : null;
    }

    convertToArray(string) {
        const temp = string.replace(/[\(\)"']/g, '');
        return temp.split(',').filter(Boolean);
    }

    fetchIcon(mSmallIcon) {
        const matches = mSmallIcon.match(/\.(IconDesc_.*)_/);

        return matches ? matches[1] : null;
    }
}