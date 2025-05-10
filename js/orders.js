import Order from '../models/Order.js';
import Pagination from './utils/pagination.js';

// Global variables
let orders = [];
let pagination;

document.addEventListener('DOMContentLoaded', async function() {
  // Load orders from db.json
  await loadOrders();
  
  // Initialize view order buttons
  initializeViewOrderButtons();
  
  // Initialize update status buttons
  initializeUpdateStatusButtons();
  
  // Initialize search functionality
  initializeSearch();
  
  // Initialize status filter
  initializeStatusFilter();
});

// Load orders from server
async function loadOrders() {
  try {
    // Show loading state
    const tableBody = document.querySelector('.data-table tbody');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading orders...</td></tr>';
    
    // Fetch orders using Order model
    orders = await Order.getAll();
    
    // Initialize pagination
    pagination = new Pagination(orders, 10); // 10 orders per page
    
    // Render first page
    renderOrders(pagination.getCurrentPageItems());
    
    // Initialize pagination controls
    renderPagination();
    
  } catch (error) {
    console.error('Error loading orders:', error);
    const tableBody = document.querySelector('.data-table tbody');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading orders. Please try again.</td></tr>';
  }
}

// Render orders
function renderOrders(ordersToRender) {
  const tableBody = document.querySelector('.data-table tbody');
  
  // Clear table
  tableBody.innerHTML = '';
  
  if (ordersToRender.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
    return;
  }
  
  // Add orders to table
  ordersToRender.forEach(order => {
    addOrderToTable(order);
  });
}

// Add order to table
function addOrderToTable(order) {
  const tableBody = document.querySelector('.data-table tbody');
  
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
  const formattedOrderId = order.id ? `#ORD-${order.id.toString().padStart(3, '0')}` : 'N/A';
  
  // Calculate total
  const total = order.total || 0;
  
  // Create table row
  const row = document.createElement('tr');
  row.dataset.orderId = order.id;
  
  row.innerHTML = `
    <td>${formattedOrderId}</td>
    <td>${customerName}</td>
    <td>${formattedDate}</td>
    <td>$${total.toFixed(2)}</td>
    <td>
      <span class="status-badge ${order.status || 'pending'}">${order.status || 'pending'}</span>
    </td>
    <td class="actions">
      <button class="btn-view view-order" title="View Order">
        <i class="fas fa-eye"></i>
      </button>
      <button class="btn-edit update-status" title="Update Status">
        <i class="fas fa-edit"></i>
      </button>
    </td>
  `;
  
  tableBody.appendChild(row);
}

// Render pagination controls
function renderPagination() {
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination';
  
  const { totalPages, currentPage } = pagination.getPageInfo();
  
  // Create pagination controls
  const pageControls = document.createElement('div');
  pageControls.className = 'page-controls';
  
  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn-prev';
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      pagination.setPage(currentPage - 1);
      renderOrders(pagination.getCurrentPageItems());
      renderPagination();
    }
  });
  pageControls.appendChild(prevBtn);
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `btn-page ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      pagination.setPage(i);
      renderOrders(pagination.getCurrentPageItems());
      renderPagination();
    });
    pageControls.appendChild(pageBtn);
  }
  
  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn-next';
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      pagination.setPage(currentPage + 1);
      renderOrders(pagination.getCurrentPageItems());
      renderPagination();
    }
  });
  pageControls.appendChild(nextBtn);
  
  paginationContainer.appendChild(pageControls);
  
  // Replace existing pagination
  const existingPagination = document.querySelector('.pagination');
  if (existingPagination) {
    existingPagination.replaceWith(paginationContainer);
  } else {
    // Append to content card if no existing pagination
    document.querySelector('.content-card').appendChild(paginationContainer);
  }
}

// Initialize view order buttons
function initializeViewOrderButtons() {
  document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-view.view-order')) {
      const button = e.target.closest('.btn-view.view-order');
      const row = button.closest('tr');
      const orderId = row.dataset.orderId;
      
      // Redirect to order details page
      window.location.href = `/pages/admin/order-details.html?id=${orderId}`;
    }
  });
}

// Initialize update status buttons
function initializeUpdateStatusButtons() {
  document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-edit.update-status')) {
      const button = e.target.closest('.btn-edit.update-status');
      const row = button.closest('tr');
      const orderId = row.dataset.orderId;
      const statusBadge = row.querySelector('.status-badge');
      const currentStatus = statusBadge.textContent;
      
      // Show status update dialog
      showStatusUpdateDialog(orderId, currentStatus);
    }
  });
}

// Show status update dialog
function showStatusUpdateDialog(orderId, currentStatus) {
  // Create modal backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  // Create modal content
  modal.innerHTML = `
    <div class="modal-header">
      <h3>Update Order Status</h3>
      <button class="close-modal">&times;</button>
    </div>
    <div class="modal-body">
      <form id="status-form">
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" name="status">
            <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${currentStatus === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${currentStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${currentStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel">Cancel</button>
          <button type="submit" class="btn-save">Save Changes</button>
        </div>
      </form>
    </div>
  `;
  
  // Append modal to body
  document.body.appendChild(backdrop);
  document.body.appendChild(modal);
  
  // Add event listeners
  modal.querySelector('.close-modal').addEventListener('click', closeModal);
  modal.querySelector('.btn-cancel').addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  
  // Handle form submission
  modal.querySelector('#status-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const newStatus = modal.querySelector('#status').value;
    
    try {
      // Update order status
      await updateOrderStatus(orderId, newStatus);
      
      // Close modal
      closeModal();
      
      // Refresh orders
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status. Please try again.');
    }
  });
  
  // Close modal function
  function closeModal() {
    document.body.removeChild(backdrop);
    document.body.removeChild(modal);
  }
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
  try {
    // Get order
    const response = await fetch(`http://localhost:3000/orders/${orderId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    
    const order = await response.json();
    
    // Update status
    order.status = newStatus;
    
    // Save order
    const updateResponse = await fetch(`http://localhost:3000/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update order');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      
      if (query === '') {
        // Reset to original orders
        pagination = new Pagination(orders, 10);
      } else {
        // Filter orders
        const filteredOrders = orders.filter(order => {
          // Search by order ID
          if (order.id && order.id.toString().includes(query)) {
            return true;
          }
          
          // Search by customer name
          if (order.customer && order.customer.name && 
              order.customer.name.toLowerCase().includes(query)) {
            return true;
          }
          
          return false;
        });
        
        pagination = new Pagination(filteredOrders, 10);
      }
      
      renderOrders(pagination.getCurrentPageItems());
      renderPagination();
    });
  }
}

// Initialize status filter
function initializeStatusFilter() {
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      const selectedStatus = e.target.value.toLowerCase();
      
      if (selectedStatus === 'all') {
        // Reset to original orders
        pagination = new Pagination(orders, 10);
      } else {
        // Filter orders by status
        const filteredOrders = orders.filter(order => 
          order.status && order.status.toLowerCase() === selectedStatus
        );
        
        pagination = new Pagination(filteredOrders, 10);
      }
      
      renderOrders(pagination.getCurrentPageItems());
      renderPagination();
    });
  }
}

// Add CSS for print mode
const style = document.createElement('style');
style.textContent = `
  @media print {
    body * {
      visibility: hidden;
    }
    .modal-container, .modal-container * {
      visibility: visible;
    }
    .modal-container {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .modal {
      width: 90%;
      max-width: 800px;
      box-shadow: none;
    }
    .modal-header, .modal-footer {
      display: none;
    }
    .modal-body {
      padding: 20px;
    }
    .btn-print-order {
      display: none;
    }
  }
`;
document.head.appendChild(style);









