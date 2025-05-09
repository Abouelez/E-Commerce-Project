import Order from '../models/Order.js';

document.addEventListener('DOMContentLoaded', function() {
  // Get order ID from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');
  
  if (!orderId) {
    // Redirect back to orders page if no ID provided
    window.location.href = '/pages/admin/orders.html';
    return;
  }
  
  // Fetch order details
  Order.getById(orderId)
    .then(order => {
      if (order) {
        populateOrderDetails(order);
        
        // Initialize update status button
        const updateStatusBtn = document.getElementById('update-status-btn');
        if (updateStatusBtn) {
          updateStatusBtn.addEventListener('click', () => {
            showUpdateStatusModal(orderId, order.status || 'pending');
          });
        }
      } else {
        showErrorMessage('Order not found');
      }
    })
    .catch(error => {
      console.error('Error fetching order details:', error);
      showErrorMessage('Failed to load order details');
    });
});

// Show error message
function showErrorMessage(message) {
  const orderIdElement = document.getElementById('order-id');
  if (orderIdElement) {
    orderIdElement.textContent = 'Error';
  }
  
  const orderItemsElement = document.getElementById('order-items');
  if (orderItemsElement) {
    orderItemsElement.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
          </div>
        </td>
      </tr>
    `;
  }
}

// Populate order details
function populateOrderDetails(order) {
  // Format order ID
  const formattedOrderId = order.id ? `ORD-${order.id.padStart(3, '0')}` : 'N/A';
  
  // Update order ID in page title
  const orderIdElement = document.getElementById('order-id');
  if (orderIdElement) {
    orderIdElement.textContent = formattedOrderId;
  }
  
  // Format date
  const orderDate = order.date ? new Date(order.date) : new Date();
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get customer info
  const customer = order.customer || {
    name: 'Unknown Customer',
    email: 'N/A',
    phone: 'N/A'
  };
  
  // Get shipping address
  const shippingAddress = order.shippingAddress || {
    street: 'N/A',
    city: 'N/A',
    state: 'N/A',
    zip: 'N/A',
    country: 'N/A'
  };
  
  // Update customer information
  document.getElementById('customer-name').textContent = customer.name;
  document.getElementById('customer-email').textContent = customer.email;
  document.getElementById('customer-phone').textContent = customer.phone;
  
  // Update order information
  document.getElementById('order-number').textContent = formattedOrderId;
  document.getElementById('order-date').textContent = formattedDate;
  
  const orderStatusElement = document.getElementById('order-status');
  orderStatusElement.textContent = order.status || 'pending';
  orderStatusElement.className = `status-badge ${order.status || 'pending'}`;
  
  document.getElementById('payment-method').textContent = order.paymentMethod || 'N/A';
  
  // Update shipping address
  document.getElementById('shipping-street').textContent = shippingAddress.street;
  document.getElementById('shipping-city-state').textContent = 
    `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`;
  document.getElementById('shipping-country').textContent = shippingAddress.country;
  
  // Format items
  let itemsHtml = '';
  let subtotal = 0;
  
  if (order.products && Array.isArray(order.products)) {
    order.products.forEach(item => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      subtotal += itemTotal;
      
      itemsHtml += `
        <tr>
          <td>
            <div class="product-info">
              <img src="${item.image || '/assets/products/image-placeholder.jpg'}" alt="${item.name || 'Product'}">
              <span>${item.name || 'Unknown Product'}</span>
            </div>
          </td>
          <td>$${(item.price || 0).toFixed(2)}</td>
          <td>${item.quantity || 1}</td>
          <td>$${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    });
  }
  
  // Update order items
  document.getElementById('order-items').innerHTML = itemsHtml || 
    '<tr><td colspan="4" class="text-center">No items found</td></tr>';
  
  // Calculate totals if not present
  const shipping = order.shipping || 0;
  const tax = order.tax || 0;
  const total = order.total || (subtotal + shipping + tax);
  
  // Update order totals
  document.getElementById('order-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('order-shipping').textContent = `$${shipping.toFixed(2)}`;
  document.getElementById('order-tax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('order-total').textContent = `$${total.toFixed(2)}`;
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
      const statusBadge = document.querySelector('#order-status');
      if (statusBadge) {
        statusBadge.textContent = orderStatus;
        statusBadge.className = `status-badge ${orderStatus}`;
      }
      
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




