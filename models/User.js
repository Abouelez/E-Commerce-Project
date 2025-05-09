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
        let product = user.cart.find(item => item.product_id == productId);
        // if (user.cart.length > 0) {
        //    product  = user.cart.find(item => item.product_id == productId);
        // }
        if (product) {
            if (update) product.count = cnt;
            else product.count += cnt;
        } else {
            user.cart.push({ product_id: productId, count: cnt });
        }

        return User.update(userId, user);
    }

    static async removeFromCart(userId, productId) {
        const user = await this.get(userId);
        user.cart = user.cart.filter(item => item.product_id !== productId);
        return User.update(userId, user);
    }
}
