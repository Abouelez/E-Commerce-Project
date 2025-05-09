document.addEventListener('DOMContentLoaded', async function() {
  // Fetch data for dashboard
  await loadDashboardData();
  
  // Initialize charts
  initializeCharts();
});

// Load dashboard data from server
async function loadDashboardData() {
  try {
    // Fetch products, orders, users, and revenue data
    const [products, orders, users, revenue] = await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchUsers(),
      calculateRevenue()
    ]);
    
    // Update dashboard stats
    updateDashboardStats(products.length, orders.length, users.length, revenue);
    
    // Update recent orders
    updateRecentOrders(orders.slice(0, 5));
    
    // Update popular products
    updatePopularProducts(products);
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// Fetch products from server
async function fetchProducts() {
  try {
    const response = await fetch('http://localhost:3000/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Fetch orders from server
async function fetchOrders() {
  try {
    const response = await fetch('http://localhost:3000/orders');
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const orders = await response.json();
    
    // Fetch customer details for each order
    for (const order of orders) {
      if (order.customerId) {
        try {
          const customerResponse = await fetch(`http://localhost:3000/users/${order.customerId}`);
          if (customerResponse.ok) {
            const customer = await customerResponse.json();
            order.customer = {
              name: customer.name,
              email: customer.email,
              phone: customer.phone || 'N/A'
            };
          }
        } catch (error) {
          console.error(`Error fetching customer for order ${order.id}:`, error);
        }
      }
    }
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

// Fetch users from server
async function fetchUsers() {
  try {
    const response = await fetch('http://localhost:3000/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const users = await response.json();
    
    // Filter only customers
    return users.filter(user => user.role === 'customer');
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Calculate total revenue from orders
async function calculateRevenue() {
  try {
    const response = await fetch('http://localhost:3000/orders');
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const orders = await response.json();
    
    // Calculate total revenue
    return orders.reduce((total, order) => {
      return total + (order.total || 0);
    }, 0);
  } catch (error) {
    console.error('Error calculating revenue:', error);
    return 0;
  }
}

// Update dashboard stats
function updateDashboardStats(productsCount, ordersCount, customersCount, revenue) {
  // Update products count
  const productsElement = document.querySelector('.stat-card:nth-child(2) .stat-info p');
  if (productsElement) {
    productsElement.textContent = productsCount;
  }
  
  // Update orders count
  const ordersElement = document.querySelector('.stat-card:nth-child(1) .stat-info p');
  if (ordersElement) {
    ordersElement.textContent = ordersCount;
  }
  
  // Update customers count
  const customersElement = document.querySelector('.stat-card:nth-child(3) .stat-info p');
  if (customersElement) {
    customersElement.textContent = customersCount;
  }
  
  // Update revenue
  const revenueElement = document.querySelector('.stat-card:nth-child(4) .stat-info p');
  if (revenueElement) {
    revenueElement.textContent = `$${revenue.toFixed(2)}`;
  }
}

// Update recent orders
function updateRecentOrders(orders) {
  const recentOrdersContainer = document.getElementById('recent-orders');
  if (!recentOrdersContainer) return;
  
  // Clear existing content
  recentOrdersContainer.innerHTML = '';
  
  if (orders.length === 0) {
    recentOrdersContainer.innerHTML = '<p class="no-data">No recent orders</p>';
    return;
  }
  
  // Create table
  const table = document.createElement('table');
  table.className = 'data-table';
  
  // Create table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Order ID</th>
      <th>Customer</th>
      <th>Date</th>
      <th>Total</th>
      <th>Status</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  // Add orders to table
  orders.forEach(order => {
    // Format date
    const orderDate = order.date ? new Date(order.date) : new Date();
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Get customer name
    const customerName = order.customer ? order.customer.name : 'Unknown Customer';
    
    // Format order ID
    const formattedOrderId = order.id ? `#ORD-${order.id.padStart(3, '0')}` : 'N/A';
    
    // Create table row
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formattedOrderId}</td>
      <td>${customerName}</td>
      <td>${formattedDate}</td>
      <td>$${(order.total || 0).toFixed(2)}</td>
      <td><span class="status-badge ${order.status || 'pending'}">${order.status || 'pending'}</span></td>
    `;
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  recentOrdersContainer.appendChild(table);
}

// Update popular products
function updatePopularProducts(products) {
  // Sort products by status (approved first) and then by date (newest first)
  const sortedProducts = [...products].sort((a, b) => {
    // First sort by status (approved first)
    if (a.status === 'approved' && b.status !== 'approved') return -1;
    if (a.status !== 'approved' && b.status === 'approved') return 1;
    
    // Then sort by date (newest first)
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });
  
  // Get top 5 products
  const topProducts = sortedProducts.slice(0, 5);
  
  const popularProductsContainer = document.getElementById('popular-products');
  if (!popularProductsContainer) return;
  
  // Clear existing content
  popularProductsContainer.innerHTML = '';
  
  if (topProducts.length === 0) {
    popularProductsContainer.innerHTML = '<p class="no-data">No products found</p>';
    return;
  }
  
  // Create product cards
  topProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image || '/assets/products/image-placeholder.jpg'}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h4>${product.name}</h4>
        <p class="product-price">$${(product.price || 0).toFixed(2)}</p>
        <p class="product-category">${product.category || 'Uncategorized'}</p>
      </div>
    `;
    
    popularProductsContainer.appendChild(productCard);
  });
}

// Initialize charts
function initializeCharts() {
  // This function would initialize charts using a library like Chart.js
  // For now, we'll just display a message in the chart placeholders
  
  const chartPlaceholders = document.querySelectorAll('.chart-placeholder');
  chartPlaceholders.forEach(placeholder => {
    placeholder.innerHTML = '<p>Chart data loaded. Connect Chart.js to visualize.</p>';
  });
  
  // If you want to implement actual charts, you would need to:
  // 1. Include Chart.js in your HTML
  // 2. Create canvas elements in your chart containers
  // 3. Initialize charts with data from your API
}