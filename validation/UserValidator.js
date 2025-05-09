import Validator from './Validator.js';

export default class UserValidator extends Validator {
    static rules = {
        name: 'required|minLength:3|maxLength:50|noNumbers',
        email: 'required|regex:^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$|unique:User,email',
        role: 'required|type:string'
    };

    static async validate(data, id = null) {
        // Add id to unique validation if updating
        const rules = { ...this.rules };
        if (id) {
            rules.name = `${rules.name},${id}`;
            rules.email = `${rules.email},${id}`;
            rules.role = `${rules.role},${id}`;
        }
        return await super.validate(data, rules);
    }
} 
