import Validator from './Validator.js';

export default class UserValidator extends Validator {
    static rules = {
        name: 'required|minLength:3|maxLength:50',
        username: 'required|minLength:3|maxLength:30|unique:User,username',
        email: 'required|regex:^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$|unique:User,email',
        role: 'required|type:string'
    };

    static async validate(data, id = null) {
        // Add id to unique validation if updating
        const rules = { ...this.rules };
        if (id) {
            rules.username = `${rules.username},${id}`;
            rules.email = `${rules.email},${id}`;
        }
        return await super.validate(data, rules);
    }
} 