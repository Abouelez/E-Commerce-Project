// Auth utility functions
export const auth = {
    /**
     * Check if user is logged in
     * @returns {boolean} - True if user is logged in
     */
    isLoggedIn: () => {
        return !!localStorage.getItem('currentUser');
    },

    /**
     * Get current user data
     * @returns {Object|null} - User data or null if not logged in
     */
    getCurrentUser: () => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Get current user's role
     * @returns {string|null} - User's role or null if not logged in
     */
    getUserRole: () => {
        const user = auth.getCurrentUser();
        return user ? user.role : null;
    },

    /**
     * Save user data
     * @param {Object} userData - User data to save
     */
    saveUser: (userData) => {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    },

    /**
     * Remove user data
     */
    logout: () => {
        localStorage.removeItem('currentUser');
    },

    /**
     * Check if user is admin
     * @returns {boolean} - True if user is admin
     */
    isAdmin: () => {
        const user = auth.getCurrentUser();
        return user && user.role === 'admin';
    },

    /**
     * Check if user is seller
     * @returns {boolean} - True if user is seller
     */
    isSeller: () => {
        const user = auth.getCurrentUser();
        return user && user.role === 'seller';
    },

    /**
     * Check if user is customer
     * @returns {boolean} - True if user is customer
     */
    isCustomer: () => {
        const user = auth.getCurrentUser();
        return user && user.role === 'customer';
    },

    /**
     * Redirect to appropriate dashboard based on user role
     */
    redirectToDashboard: () => {
        const user = auth.getCurrentUser(); 
        if (!user) return;
        window.location.href = '/index.html';
        // switch (user.role) {
        //     case 'admin':
        //         window.location.href = '../../pages/dashboard.html';
        //         break;
        //     case 'seller':
        //         window.location.href = '/pages/seller/dashboard.html';
        //         break;
        //     case 'customer':
        //         window.location.href = '/pages/customer/dashboard.html';
        //         break;
        //     default:
        //         window.location.href = '/';
        // }
    }
}; 