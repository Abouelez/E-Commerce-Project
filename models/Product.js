import Model from "./Model.js";

export default class Product extends Model {
    static table = 'products';
    static url = `http://localhost:3000/${this.table}`;
    
    static async getAll() {
        try {
            const response = await fetch(this.url);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }
    
    static async getById(id) {
        try {
            const response = await fetch(`${this.url}/${id}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch product with id ${id}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching product with id ${id}:`, error);
            return null;
        }
    }
    
    static async getByCategoryId(categoryId) {
        try {
            const products = await this.getAll();
            return products.filter(product => product.categoryId === categoryId);
        } catch (error) {
            console.error(`Error fetching products by category id ${categoryId}:`, error);
            return [];
        }
    }
    
    static async create(productData) {
        try {
            // Get the next available ID
            const products = await this.getAll();
            const maxId = products.length > 0 ? Math.max(...products.map(p => parseInt(p.id))) : 0;
            const nextId = (maxId + 1).toString();
            
            // Create product object with ID and timestamps
            const product = {
                id: nextId,
                ...productData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Ensure image path is set
            if (!product.image) {
                product.image = "/assets/image-placeholder.jpg";
            }
            
            // Send to server
            const response = await fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create product');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }
    
    static async update(id, productData) {
        try {
            // Get current product
            const currentProduct = await this.getById(id);
            if (!currentProduct) {
                throw new Error(`Product with id ${id} not found`);
            }
            
            // Create updated product object
            const updatedProduct = {
                ...currentProduct,
                ...productData,
                updatedAt: new Date().toISOString()
            };
            
            // Send to server
            const response = await fetch(`${this.url}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedProduct)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to update product with id ${id}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error updating product with id ${id}:`, error);
            throw error;
        }
    }
    
    static async delete(id) {
        try {
            const response = await fetch(`${this.url}/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Failed to delete product with id ${id}`);
            }
            
            return true;
        } catch (error) {
            console.error(`Error deleting product with id ${id}:`, error);
            throw error;
        }
    }
}
