import Validator from './Validator.js';

export default class ProductValidator extends Validator {
    static rules = {
        name: 'required|minLength:3|maxLength:100|noDigitsOnly',
        price: 'required|type:number',
        image: 'required|type:string',
        description: 'required|maxLength:500'
    };

    static async validate(data, id = null) {
        // Add any product-specific validation logic here
        return await super.validate(data, this.rules);
    }
} 
