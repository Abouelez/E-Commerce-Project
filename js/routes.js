// Define content routes
const routes = {
  'dashboard': {
    title: 'Dashboard - Bookify Admin',
    template: '/templates/dashboard.html'
  },
  'users': {
    title: 'Users - Bookify Admin',
    template: '/templates/users.html'
  },
  'categories': {
    title: 'Categories - Bookify Admin',
    template: '/templates/categories.html'
  },
  'products': {
    title: 'Products - Bookify Admin',
    template: '/templates/products.html'
  },
  'subscribers': {
    title: 'Subscribers - Bookify Admin',
    template: '/templates/subscribers.html'
  },
  'reports': {
    title: 'Reports - Bookify Admin',
    template: '/templates/reports.html'
  },
  'search': {
    title: 'Search - Bookify Admin',
    template: '/templates/search.html'
  }
};

// Router function
const Router = {
  init() {
    // Initial load
    this.loadContent(this.getCurrentRoute());
    
    // Set up event listeners for navigation
    document.addEventListener('DOMContentLoaded', () => {
      this.setupNavigation();
      
      // Handle browser back/forward buttons
      window.addEventListener('hashchange', () => {
        this.loadContent(this.getCurrentRoute());
      });
    });
  },
  
  getCurrentRoute() {
    // Get route from hash, default to dashboard
    return window.location.hash.slice(1) || 'dashboard';
  },
  
  setupNavigation() {
    const navLinks = document.querySelectorAll('.admin-sidebar a[data-route]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Get the route from data attribute
        const route = link.getAttribute('data-route');
        
        // Update active class
        document.querySelector('.admin-sidebar li.active')?.classList.remove('active');
        link.parentElement.classList.add('active');
        
        // Load content (hash change will trigger loadContent)
      });
    });
  },
  
  loadContent(route) {
    // Get the content area
    const contentArea = document.getElementById('main-content');
    
    // Check if route exists
    if (routes[route]) {
      // Update page title
      document.title = routes[route].title;
      
      // Update active menu item
      this.updateActiveMenuItem(route);
      
      // Fetch and load template
      fetch(routes[route].template)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error loading template: ${routes[route].template}`);
          }
          return response.text();
        })
        .then(html => {
          // Update content area
          contentArea.innerHTML = html;
          
          // Initialize event listeners for the new content
          this.initContentEventListeners(route);
        })
        .catch(error => {
          console.error(error);
          contentArea.innerHTML = `<p>Error loading content. Please try again.</p>`;
        });
    } else {
      // Route not found, redirect to dashboard
      window.location.hash = 'dashboard';
    }
  },
  
  updateActiveMenuItem(route) {
    // Remove active class from all menu items
    document.querySelectorAll('.admin-sidebar li').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to current menu item
    const activeLink = document.querySelector(`.admin-sidebar a[data-route="${route}"]`);
    if (activeLink) {
      activeLink.parentElement.classList.add('active');
    }
  },
  
  initContentEventListeners(route) {
    // Initialize specific event listeners based on the route
    switch(route) {
      case 'products':
        if (typeof initializeProductsPage === 'function') {
          initializeProductsPage();
        }
        break;
      case 'users':
        if (typeof initializeUsersPage === 'function') {
          initializeUsersPage();
        }
        break;
      // Add more cases for other pages as needed
    }
    
    // Common event listeners for all pages
    
    // Add User/Product button
    const addBtn = document.querySelector('.btn-add');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (route === 'users') {
          showAddUserModal();
        } else if (route === 'products') {
          showAddProductModal();
        }
      });
    }
    
    // Action dropdown functionality
    const actionButtons = document.querySelectorAll('.btn-action');
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Close any open dropdowns first
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
          if (menu !== button.nextElementSibling) {
            menu.classList.remove('show');
          }
        });
        
        // Toggle dropdown
        const dropdown = button.nextElementSibling;
        if (dropdown) {
          dropdown.classList.toggle('show');
          
          // Close dropdown when clicking outside
          document.addEventListener('click', function closeDropdown(event) {
            if (!button.contains(event.target) && !dropdown.contains(event.target)) {
              dropdown.classList.remove('show');
              document.removeEventListener('click', closeDropdown);
            }
          });
        }
      });
    });
  }
};

// Initialize router
Router.init();

export default routes;
