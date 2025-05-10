import Model from "./Model.js";

export default class User extends Model {
    static table = 'users';
    static url = `http://localhost:3000/${this.table}`;
    
    static async getAll() {
        try {
            const response = await fetch(this.url);
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    static async addToCart(userId, productId, cnt, update = false) {
        const user = await User.get(userId);
        let product = null;
        if (user.cart.length > 0) {
           product  = user.cart.find(item => item.product_id == productId);
        }
        if (product) {
            if (update) product.count = cnt;
            else product.count += cnt;
        } else {
            user.cart.push({ product_id: productId, count: cnt });
        }

        return User.update(userId, user);
    }

    static async removeFromCart(userId, productId) {
        try {
            const user = await this.get(userId);
            const productIdNum = parseInt(productId);
            user.cart = user.cart.filter(item => parseInt(item.product_id) !== productIdNum);
            const result = await this.update(userId, user);
            
            return result;
        } catch (error) {
            console.error(`Error removing product ${productId} from cart:`, error);
            throw error;
        }
    }
}
