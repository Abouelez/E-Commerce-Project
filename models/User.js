export default class User {
  static async getAll() {
    try {
      const response = await fetch('http://localhost:3000/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  static async get(id) {
    try {
      const response = await fetch(`http://localhost:3000/users/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user with ID ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }

  static async create(userData) {
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async update(id, userData) {
    try {
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error(`Failed to update user with ID ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      return null;
    }
  }

  static async delete(id) {
    try {
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete user with ID ${id}`);
      }
      return true;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return false;
    }
  }

  static async addToCart(userId, productId, count = 1, replace = false) {
    try {
      // Get current user data
      const user = await this.get(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Ensure cart exists
      if (!Array.isArray(user.cart)) {
        user.cart = [];
      }
      
      // Convert IDs to numbers for consistent comparison
      const productIdNum = parseInt(productId);
      
      // Check if product already exists in cart
      const existingItemIndex = user.cart.findIndex(
        item => parseInt(item.product_id) === productIdNum
      );
      
      if (existingItemIndex !== -1) {
        // If replace is true, replace the count
        // Otherwise, add to the existing count
        if (replace) {
          user.cart[existingItemIndex].count = count;
        } else {
          user.cart[existingItemIndex].count += count;
        }
      } else {
        // Add new product to cart
        user.cart.push({
          product_id: productIdNum,
          count: count
        });
      }
      
      // Update user data in database
      const result = await this.update(userId, user);
      
      return result;
    } catch (error) {
      console.error(`Error adding product ${productId} to cart:`, error);
      throw error;
    }
  }

  static async removeFromCart(userId, productId) {
    try {
      // Get current user data
      const user = await this.get(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Ensure cart exists and is an array
      if (!Array.isArray(user.cart)) {
        user.cart = [];
      }
      
      // Convert productId to number to ensure correct comparison
      const productIdNum = parseInt(productId);
      
      // Filter out the product to remove
      const originalLength = user.cart.length;
      user.cart = user.cart.filter(item => parseInt(item.product_id) !== productIdNum);
      
      // Log for debugging
      console.log(`Removing product ${productIdNum} from cart`);
      console.log(`Cart before: ${originalLength} items, after: ${user.cart.length} items`);
      
      // Update user data in database
      const result = await this.update(userId, user);
      
      return result;
    } catch (error) {
      console.error(`Error removing product ${productId} from cart:`, error);
      throw error;
    }
  }
}
