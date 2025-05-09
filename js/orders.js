import Order from '../models/Order.js';

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
    const orders = await Order.getAll();
    
    // Clear loading state
    tableBody.innerHTML = '';
    
    if (orders.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
      return;
    }
    
    // Add orders to table
    orders.forEach(order => {
      addOrderToTable(order);
    });
    
  } catch (error) {
    console.error('Error loading orders:', error);
    const tableBody = document.querySelector('.data-table tbody');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading orders. Please try again.</td></tr>';
  }
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
  
  // Get total
  const total = order.total || 0;
  
  // Get customer name
  const customerName = order.customer ? order.customer.name : 'Unknown Customer';
  
  // Format order ID
  const formattedOrderId = order.id ? `#ORD-${order.id.padStart(3, '0')}` : 'N/A';
  
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
      
      // Show update status modal
      showUpdateStatusModal(orderId, currentStatus);
    }
  });
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const tableRows = document.querySelectorAll('.data-table tbody tr');
      
      tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
}

// Initialize status filter
function initializeStatusFilter() {
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      const selectedStatus = e.target.value.toLowerCase();
      const tableRows = document.querySelectorAll('.data-table tbody tr');
      
      tableRows.forEach(row => {
        const statusBadge = row.querySelector('.status-badge');
        const rowStatus = statusBadge.textContent.toLowerCase();
        
        if (selectedStatus === 'all' || rowStatus === selectedStatus) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
}

// Show update status modal
function showUpdateStatusModal(orderId, currentStatus) {
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  
  // Create modal content
  modalContainer.innerHTML = `
    <div class="modal update-status-modal">
      <div class="modal-header">
        <h3>Update Order Status</h3>
        <button class="btn-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <form id="update-status-form">
          <div class="form-group">
            <label for="orderStatus">Status</label>
            <select id="orderStatus" required>
              <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="processing" ${currentStatus === 'processing' ? 'selected' : ''}>Processing</option>
              <option value="shipped" ${currentStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
              <option value="delivered" ${currentStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
          <div class="form-group">
            <label for="statusNote">Note (Optional)</label>
            <textarea id="statusNote" rows="3" placeholder="Add a note about this status change"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-save">Update Status</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Add modal to body
  document.body.appendChild(modalContainer);
  
  // Add event listeners
  const closeBtn = modalContainer.querySelector('.btn-close');
  const cancelBtn = modalContainer.querySelector('.btn-cancel');
  
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
  });
  
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
  });
  
  // Form submission
  const form = modalContainer.querySelector('#update-status-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const orderStatus = document.getElementById('orderStatus').value;
    const statusNote = document.getElementById('statusNote').value;
    
    try {
      // Update order status using Order model
      await Order.updateStatus(orderId, orderStatus, statusNote);
      
      // Update UI
      updateOrderStatusInTable(orderId, orderStatus);
      
      // Close modal
      document.body.removeChild(modalContainer);
      
      // Show success message
      alert('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status. Please try again.');
    }
  });
}

// Update order status in table
function updateOrderStatusInTable(orderId, status) {
  const row = document.querySelector(`tr[data-order-id="${orderId}"]`);
  if (row) {
    const statusBadge = row.querySelector('.status-badge');
    statusBadge.textContent = status;
    statusBadge.className = `status-badge ${status}`;
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








