import Validator from './Validator.js';

export default class CategoryValidator extends Validator {
    static rules = {
        name: 'required|minLength:2|maxLength:50|unique:Category,name',
        description: 'maxLength:200'
    };

    static async validate(data, id = null) {
        // Add id to unique validation if updating
        const rules = { ...this.rules };
        if (id) {
            rules.name = `${rules.name},${id}`;
        }
        return await super.validate(data, rules);
    }
} 