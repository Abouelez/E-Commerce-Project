document.addEventListener('DOMContentLoaded', async function() {
  // Load products from db.json
  await loadProducts();
  
  // Initialize filters
  initializeFilters();
  
  // Initialize search
  initializeSearch();
});

// Load products from server
async function loadProducts() {
  try {
    const response = await fetch('http://localhost:3000/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const products = await response.json();
    
    // Clear existing table rows
    const tableBody = document.querySelector('.data-table tbody');
    tableBody.innerHTML = '';
    
    // Add products to table
    for (const product of products) {
      // Get seller name if available
      let sellerName = "Unknown";
      if (product.sellerId) {
        try {
          const sellerResponse = await fetch(`http://localhost:3000/users/${product.sellerId}`);
          if (sellerResponse.ok) {
            const seller = await sellerResponse.json();
            sellerName = seller.name;
          }
        } catch (error) {
          console.error('Error fetching seller:', error);
        }
      }
      
      // Add product to table with seller name
      addProductToTable(product, sellerName);
    }
    
    // Load categories for filter
    await loadCategoriesForFilter();
    
  } catch (error) {
    console.error('Error loading products:', error);
    alert('Error loading products. Please try again.');
  }
}

// Load categories for filter
async function loadCategoriesForFilter() {
  try {
    const response = await fetch('http://localhost:3000/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const categories = await response.json();
    const categoryFilter = document.getElementById('category-filter');
    
    // Add categories to filter
    categories.forEach(category => {
      if (category.status === 'available') {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
      }
    });
  } catch (error) {
    console.error('Error loading categories for filter:', error);
  }
}

// Initialize filters
function initializeFilters() {
  const statusFilter = document.getElementById('status-filter');
  const categoryFilter = document.getElementById('category-filter');
  
  statusFilter.addEventListener('change', filterProducts);
  categoryFilter.addEventListener('change', filterProducts);
}

// Initialize search
function initializeSearch() {
  const searchInput = document.getElementById('product-search');
  searchInput.addEventListener('input', filterProducts);
}

// Filter products
async function filterProducts() {
  const statusFilter = document.getElementById('status-filter').value;
  const categoryFilter = document.getElementById('category-filter').value;
  const searchInput = document.getElementById('product-search').value.toLowerCase();
  
  try {
    const response = await fetch('http://localhost:3000/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    let products = await response.json();
    
    // Filter by status
    if (statusFilter !== 'all') {
      products = products.filter(product => product.status === statusFilter);
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      products = products.filter(product => product.categoryId === categoryFilter);
    }
    
    // Filter by search term
    if (searchInput) {
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchInput) || 
        product.category.toLowerCase().includes(searchInput)
      );
    }
    
    // Clear existing table rows
    const tableBody = document.querySelector('.data-table tbody');
    tableBody.innerHTML = '';
    
    // Add filtered products to table
    for (const product of products) {
      // Get seller name if available
      let sellerName = "Unknown";
      if (product.sellerId) {
        try {
          const sellerResponse = await fetch(`http://localhost:3000/users/${product.sellerId}`);
          if (sellerResponse.ok) {
            const seller = await sellerResponse.json();
            sellerName = seller.name;
          }
        } catch (error) {
          console.error('Error fetching seller:', error);
        }
      }
      
      // Add product to table with seller name
      addProductToTable(product, sellerName);
    }
    
  } catch (error) {
    console.error('Error filtering products:', error);
  }
}

// Show confirmation dialog
function showConfirmationDialog(message, onConfirm) {
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  
  // Create modal content
  modalContainer.innerHTML = `
    <div class="modal confirmation-modal">
      <div class="modal-header">
        <h3>Confirm Action</h3>
        <button class="btn-close">&times;</button>
      </div>
      <div class="modal-body">
        <p>${message}</p>
        <div class="form-actions">
          <button class="btn-cancel">Cancel</button>
          <button class="btn-confirm">Confirm</button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to body
  document.body.appendChild(modalContainer);
  
  // Add event listeners
  const closeBtn = modalContainer.querySelector('.btn-close');
  const cancelBtn = modalContainer.querySelector('.btn-cancel');
  const confirmBtn = modalContainer.querySelector('.btn-confirm');
  
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
  });
  
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
  });
  
  confirmBtn.addEventListener('click', () => {
    onConfirm();
    document.body.removeChild(modalContainer);
  });
}

// Add product to table
function addProductToTable(product, sellerName) {
  const tableBody = document.querySelector('.data-table tbody');
  
  // Format date
  const createdDate = new Date(product.createdAt);
  const dateString = createdDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Format price
  const formattedPrice = `$${product.price.toLocaleString()}`;
  
  // Create row
  const row = document.createElement('tr');
  row.dataset.productId = product.id;
  
  // Determine which buttons to show based on status
  let actionButtons = '';
  if (product.status === 'pending') {
    actionButtons = `
      <button class="btn-approve" title="Approve Product"><i class="fas fa-check"></i> Approve</button>
      <button class="btn-reject" title="Reject Product"><i class="fas fa-times"></i> Reject</button>
    `;
  } else {
    actionButtons = `
      <button class="btn-edit" title="Edit Product"><i class="fas fa-edit"></i> Edit</button>
      <button class="btn-delete" title="Delete Product"><i class="fas fa-trash"></i> Delete</button>
    `;
  }
  
  row.innerHTML = `
    <td>${product.name}</td>
    <td>${formattedPrice}</td>
    <td>${product.category}</td>
    <td>${sellerName}</td>
    <td><span class="status-badge ${product.status}">${product.status.charAt(0).toUpperCase() + product.status.slice(1)}</span></td>
    <td>${dateString}</td>
    <td class="actions-cell">
      ${actionButtons}
    </td>
  `;
  
  tableBody.appendChild(row);
  
  // Add event listeners to the new buttons
  if (product.status === 'pending') {
    const approveBtn = row.querySelector('.btn-approve');
    const rejectBtn = row.querySelector('.btn-reject');
    
    approveBtn.addEventListener('click', () => {
      showConfirmationDialog(
        'Are you sure you want to approve this product?',
        async () => {
          try {
            // Update product status on the server
            await updateProductStatus(product.id, 'approved');
            
            // Update UI
            row.querySelector('.status-badge').textContent = 'Approved';
            row.querySelector('.status-badge').className = 'status-badge approved';
            
            // Replace approve/reject buttons with edit/delete buttons
            const actionsCell = row.querySelector('.actions-cell');
            actionsCell.innerHTML = `
              <button class="btn-edit" title="Edit Product"><i class="fas fa-edit"></i> Edit</button>
              <button class="btn-delete" title="Delete Product"><i class="fas fa-trash"></i> Delete</button>
            `;
            
            // Add event listeners to new buttons
            const editBtn = actionsCell.querySelector('.btn-edit');
            const deleteBtn = actionsCell.querySelector('.btn-delete');
            
            editBtn.addEventListener('click', () => {
              showEditProductModal(product.id, product.name, formattedPrice, product.categoryId, product.sellerId);
            });
            
            deleteBtn.addEventListener('click', () => {
              showConfirmationDialog(
                `Are you sure you want to delete product "${product.name}"?`,
                async () => {
                  await deleteProduct(product.id);
                  row.remove();
                }
              );
            });
            
            // Show success notification
            showNotification('Product approved successfully', 'success');
            
            // Send notification to seller (in a real app)
            notifySeller(product.sellerId, 'product_approved', product.id, product.name);
          } catch (error) {
            console.error('Error approving product:', error);
            showNotification('Error approving product', 'error');
          }
        }
      );
    });
    
    rejectBtn.addEventListener('click', () => {
      showRejectProductModal(product.id, product.name, async (reason) => {
        try {
          // Update product status and rejection reason on the server
          await updateProductStatus(product.id, 'rejected', reason);
          
          // Update UI
          row.querySelector('.status-badge').textContent = 'Rejected';
          row.querySelector('.status-badge').className = 'status-badge rejected';
          
          // Replace approve/reject buttons with edit/delete buttons
          const actionsCell = row.querySelector('.actions-cell');
          actionsCell.innerHTML = `
            <button class="btn-edit" title="Edit Product"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn-delete" title="Delete Product"><i class="fas fa-trash"></i> Delete</button>
          `;
          
          // Add event listeners to new buttons
          const editBtn = actionsCell.querySelector('.btn-edit');
          const deleteBtn = actionsCell.querySelector('.btn-delete');
          
          editBtn.addEventListener('click', () => {
            showEditProductModal(product.id, product.name, formattedPrice, product.categoryId, product.sellerId);
          });
          
          deleteBtn.addEventListener('click', () => {
            showConfirmationDialog(
              `Are you sure you want to delete product "${product.name}"?`,
              async () => {
                await deleteProduct(product.id);
                row.remove();
              }
            );
          });
          
          // Show success notification
          showNotification('Product rejected successfully', 'success');
          
          // Send notification to seller (in a real app)
          notifySeller(product.sellerId, 'product_rejected', product.id, product.name, reason);
        } catch (error) {
          console.error('Error rejecting product:', error);
          showNotification('Error rejecting product', 'error');
        }
      });
    });
  } else {
    const editBtn = row.querySelector('.btn-edit');
    const deleteBtn = row.querySelector('.btn-delete');
    
    editBtn.addEventListener('click', () => {
      showEditProductModal(product.id, product.name, formattedPrice, product.categoryId, product.sellerId);
    });
    
    deleteBtn.addEventListener('click', () => {
      showConfirmationDialog(
        `Are you sure you want to delete product "${product.name}"?`,
        async () => {
          await deleteProduct(product.id);
          row.remove();
        }
      );
    });
  }
}

// Update product status
async function updateProductStatus(productId, status, reason = '') {
  try {
    // Get the current product first
    const getResponse = await fetch(`http://localhost:3000/products/${productId}`);
    if (!getResponse.ok) {
      throw new Error('Failed to fetch product');
    }
    
    const product = await getResponse.json();
    
    // Update the status and add additional fields
    product.status = status;
    product.updatedAt = new Date().toISOString();
    
    // Add rejection reason if provided
    if (status === 'rejected' && reason) {
      product.rejectionReason = reason;
    }
    
    // Add approval date if approved
    if (status === 'approved') {
      product.approvedAt = new Date().toISOString();
    }
    
    // Send to server
    const response = await fetch(`http://localhost:3000/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    console.log(`Product ${productId} status updated to ${status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
}

// Delete product from server
async function deleteProduct(productId) {
  try {
    const response = await fetch(`http://localhost:3000/products/${productId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    console.log(`Product ${productId} deleted`);
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Error deleting product. Please try again.');
  }
}

// Show edit product modal
function showEditProductModal(productId, name, price, categoryId, sellerId) {
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  
  // Format price for input (remove $ and commas)
  const formattedPrice = price.replace('$', '').replace(',', '');
  
  // Create modal content with empty category and seller selects that will be populated
  modalContainer.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Edit Product</h3>
        <button class="btn-close">&times;</button>
      </div>
      <div class="modal-body">
        <form id="edit-product-form">
          <input type="hidden" id="productId" value="${productId}">
          <div class="form-group">
            <label for="productName">Product Name</label>
            <input type="text" id="productName" placeholder="Product Name" value="${name}" required>
          </div>
          <div class="form-group">
            <label for="productPrice">Price</label>
            <input type="number" id="productPrice" placeholder="Price" value="${formattedPrice}" required>
          </div>
          <div class="form-group">
            <label for="productCategory">Category</label>
            <select id="productCategory" required>
              <option value="" disabled>Loading categories...</option>
            </select>
          </div>
          <div class="form-group">
            <label for="productSeller">Seller</label>
            <select id="productSeller" required>
              <option value="" disabled>Loading sellers...</option>
            </select>
          </div>
          <div class="form-group">
            <button type="submit" class="btn-submit">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Add modal to body
  document.body.appendChild(modalContainer);
  
  // Load categories and sellers from db.json
  loadCategoriesForSelect(document.getElementById('productCategory'), categoryId);
  loadSellersForSelect(document.getElementById('productSeller'), sellerId);
  
  // Add event listeners
  const closeBtn = modalContainer.querySelector('.btn-close');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
  });
  
  // Form submission
  const form = modalContainer.querySelector('#edit-product-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const productCategoryId = document.getElementById('productCategory').value;
    const productSellerId = document.getElementById('productSeller').value;
    
    // Get category name from selected option
    const categorySelect = document.getElementById('productCategory');
    const categoryName = categorySelect.options[categorySelect.selectedIndex].text;
    
    try {
      // Get the current product first
      const getResponse = await fetch(`http://localhost:3000/products/${productId}`);
      if (!getResponse.ok) {
        throw new Error('Failed to fetch product');
      }
      
      const currentProduct = await getResponse.json();
      
      // Create updated product object
      const updatedProduct = {
        ...currentProduct,
        name: productName,
        price: parseFloat(productPrice),
        categoryId: productCategoryId,
        category: categoryName,
        sellerId: productSellerId,
        updatedAt: new Date().toISOString()
      };
      
      // Send to server
      const response = await fetch(`http://localhost:3000/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      // Reload products to update the table
      await loadProducts();
      
      // Close modal
      document.body.removeChild(modalContainer);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again.');
    }
  });
}

// Load categories for select element
async function loadCategoriesForSelect(selectElement, selectedCategoryId) {
  try {
    const response = await fetch('http://localhost:3000/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const categories = await response.json();
    
    // Clear any existing options
    selectElement.innerHTML = '';
    
    // Add categories from db.json
    categories.forEach(category => {
      if (category.status === 'available') {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        if (category.id === selectedCategoryId) {
          option.selected = true;
        }
        selectElement.appendChild(option);
      }
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    // Add a default option if categories can't be loaded
    const option = document.createElement('option');
    option.value = "";
    option.textContent = "Error loading categories";
    selectElement.innerHTML = '';
    selectElement.appendChild(option);
  }
}

// Load sellers for select element
async function loadSellersForSelect(selectElement, selectedSellerId) {
  try {
    const response = await fetch('http://localhost:3000/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const users = await response.json();
    
    // Clear any existing options
    selectElement.innerHTML = '';
    
    // Add sellers from db.json
    users.forEach(user => {
      if (user.role === 'seller' && (!user.status || user.status === 'available')) {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        if (user.id === selectedSellerId) {
          option.selected = true;
        }
        selectElement.appendChild(option);
      }
    });
  } catch (error) {
    console.error('Error loading sellers:', error);
    // Add a default option if sellers can't be loaded
    const option = document.createElement('option');
    option.value = "";
    option.textContent = "Error loading sellers";
    selectElement.innerHTML = '';
    selectElement.appendChild(option);
  }
}

// Show reject product modal with reason field
function showRejectProductModal(productId, productName, onReject) {
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  
  // Create modal content
  modalContainer.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Reject Product</h3>
        <button class="btn-close">&times;</button>
      </div>
      <div class="modal-body">
        <p>You are about to reject the product: <strong>${productName}</strong></p>
        <form id="reject-product-form">
          <div class="form-group">
            <label for="rejectionReason">Rejection Reason (optional)</label>
            <textarea id="rejectionReason" placeholder="Provide a reason for rejection" rows="4"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-reject">Reject Product</button>
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
  const form = modalContainer.querySelector('#reject-product-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const rejectionReason = document.getElementById('rejectionReason').value;
    
    // Call the callback with the rejection reason
    onReject(rejectionReason);
    
    // Close modal
    document.body.removeChild(modalContainer);
  });
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Add close button event
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(notification);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 5000);
}

// Notify seller (in a real app, this would send an email or in-app notification)
function notifySeller(sellerId, notificationType, productId, productName, reason = '') {
  // In a real app, this would call an API to send a notification
  console.log(`Notification to seller ${sellerId}: Product "${productName}" (ID: ${productId}) has been ${notificationType.replace('product_', '')}`);
  
  if (reason) {
    console.log(`Reason: ${reason}`);
  }
  
  // For demo purposes, we'll just log to console
  // In a real app, you would:
  // 1. Create a notification record in the database
  // 2. Send an email to the seller
  // 3. Update the seller's notification count in the UI
}





