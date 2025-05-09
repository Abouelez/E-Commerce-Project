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
}
