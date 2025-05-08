import Validator from './Validator.js';

export default class OrderValidator extends Validator {
    static rules = {
        user_id: 'required|type:number',
        price: 'required|type:number',
        status: 'required|type:string',
        items: 'required|type:object'
    };

    static async validate(data, id = null) {
        // Add any order-specific validation logic here
        return await super.validate(data, this.rules);
    }
} 