import Model from "./Model.js";

export default class Category extends Model {
    static table = 'categories';
    static url = `http://localhost:3000/${this.table}`;
    
    static async getAll() {
        try {
            const response = await fetch(this.url);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }
}
