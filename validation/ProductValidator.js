import Validator from './Validator.js';

export default class ProductValidator extends Validator {
    static rules = {
        name: 'required|minLength:3|maxLength:100',
        price: 'required|type:number',
        image: 'required|type:string',
        category_id: 'required|type:number',
        is_approved: 'type:boolean',
        description: 'maxLength:500'
    };

    static async validate(data, id = null) {
        // Add any product-specific validation logic here
        return await super.validate(data, this.rules);
    }
} 