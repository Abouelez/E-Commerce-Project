import CategoryValidator from '../validation/CategoryValidator.js';

document.addEventListener('DOMContentLoaded', function() {
  // Load categories from server
  loadCategories();
  
  // Initialize add category button
  initializeAddCategoryButton();
  
  // Initialize search functionality
  initializeSearch();
});

// Load categories from server
async function loadCategories() {
  try {
    const response = await fetch('http://localhost:3000/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const categories = await response.json();
    
    // Clear existing table rows
    const tableBody = document.querySelector('.data-table tbody');
    tableBody.innerHTML = '';
    
    // Add categories to table
    categories.forEach(category => {
      addCategoryToTable(category);
    });
    
    // Initialize action buttons after populating the table
    initializeActionButtons();
  } catch (error) {
    console.error('Error loading categories:', error);
    alert('Error loading categories. Please try again.');
  }
}

// Initialize action buttons
function initializeActionButtons() {
  // Edit category
  const editButtons = document.querySelectorAll('.btn-edit');
  editButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const row = button.closest('tr');
      const categoryId = row.dataset.categoryId;
      const name = row.querySelector('td:nth-child(1)').textContent;
      
      showEditCategoryModal(categoryId, name);
    });
  });
  
  // Delete category
  const deleteButtons = document.querySelectorAll('.btn-delete');
  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const row = button.closest('tr');
      const categoryId = row.dataset.categoryId;
      
      showConfirmationDialog(
        'Are you sure you want to delete this category?',
        () => {
          // Delete from server first
          deleteCategory(categoryId).then(success => {
            if (success) {
              // Remove row from table if server deletion was successful
              row.remove();
            }
          });
        }
      );
    });
  });
}

// Initialize add category button
function initializeAddCategoryButton() {
  const addButton = document.querySelector('.btn-add-category');
  if (addButton) {
    addButton.addEventListener('click', () => {
      showAddCategoryModal();
    });
  }
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

// Show add category modal
function showAddCategoryModal() {
  // First, remove any existing modals to prevent duplicates
  const existingModals = document.querySelectorAll('.modal-container');
  existingModals.forEach(modal => {
    document.body.removeChild(modal);
  });
  
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  
  // Create modal content
  modalContainer.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Add Category</h3>
        <button class="btn-close">&times;</button>
      </div>
      <div class="modal-body">
        <form id="add-category-form">
          <div class="form-group">
            <input type="text" id="categoryName" placeholder="Category Name" required>
            <span class="error-message" id="categoryName-error"></span>
          </div>
          <div class="form-group" style="display: flex; align-items: end;">
            <button type="submit" class="btn-submit btn-save" style="width: 25%;">Add Category</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Add modal to body
  document.body.appendChild(modalContainer);
  
  // Add event listeners
  const closeBtn = modalContainer.querySelector('.btn-close');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
  });
  
  // Form submission
  const form = modalContainer.querySelector('#add-category-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const categoryName = document.getElementById('categoryName').value;
    
    try {
      // Validate category data
      const categoryData = { name: categoryName };
      const validationErrors = await CategoryValidator.validate(categoryData);
      
      // Clear previous error messages
      document.getElementById('categoryName-error').textContent = '';
      
      // If validation fails, show error messages and return
      if (validationErrors) {
        if (validationErrors.name) {
          document.getElementById('categoryName-error').textContent = validationErrors.name;
        }
        return;
      }
      
      // Get the next available ID
      const categoriesResponse = await fetch('http://localhost:3000/categories');
      const categories = await categoriesResponse.json();
      const maxId = categories.length > 0 ? Math.max(...categories.map(c => parseInt(c.id))) : 0;
      const nextId = (maxId + 1).toString();
      
      // Create new category object
      const newCategory = {
        id: nextId,
        name: categoryName,
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Send to server
      const response = await fetch('http://localhost:3000/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCategory)
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Add category to table
      addCategoryToTable(data);
      
      // Close modal
      document.body.removeChild(modalContainer);
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category. Please try again.');
    }
  });
}

// Show edit category modal
function showEditCategoryModal(categoryId, name) {
  // First, remove any existing modals to prevent duplicates
  const existingModals = document.querySelectorAll('.modal-container');
  existingModals.forEach(modal => {
    document.body.removeChild(modal);
  });
  
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  
  // Create modal content
  modalContainer.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Edit Category</h3>
        <button class="btn-close">&times;</button>
      </div>
      <div class="modal-body">
        <form id="edit-category-form">
          <input type="hidden" id="categoryId" value="${categoryId}">
          <div class="form-group">
            <input type="text" id="categoryName" placeholder="Category Name" value="${name}" required>
            <span class="error-message" id="categoryName-error"></span>
          </div>
          <div class="form-group" style="display: flex; align-items: end;">
            <button type="submit" class="btn-submit btn-save" style="width: 30%;">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Add modal to body
  document.body.appendChild(modalContainer);
  
  // Add event listeners
  const closeBtn = modalContainer.querySelector('.btn-close');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
  });
  
  // Form submission
  const form = modalContainer.querySelector('#edit-category-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const categoryName = document.getElementById('categoryName').value;
    
    try {
      // Validate category data
      const categoryData = { name: categoryName };
      const validationErrors = await CategoryValidator.validate(categoryData, categoryId);
      
      // Clear previous error messages
      document.getElementById('categoryName-error').textContent = '';
      
      // If validation fails, show error messages and return
      if (validationErrors) {
        if (validationErrors.name) {
          document.getElementById('categoryName-error').textContent = validationErrors.name;
        }
        return;
      }
      
      // Get the current category first
      const getResponse = await fetch(`http://localhost:3000/categories/${categoryId}`);
      if (!getResponse.ok) {
        throw new Error('Failed to fetch category');
      }
      
      const currentCategory = await getResponse.json();
      
      // Create updated category object
      const updatedCategory = {
        ...currentCategory,
        name: categoryName,
        updatedAt: new Date().toISOString()
      };
      
      // Send to server
      const response = await fetch(`http://localhost:3000/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedCategory)
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Update category in table
      updateCategoryInTable(categoryId, data);
      
      // Close modal
      document.body.removeChild(modalContainer);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category. Please try again.');
    }
  });
}

// Show confirmation dialog
function showConfirmationDialog(message, onConfirm) {
  // First, remove any existing confirmation modals to prevent duplicates
  const existingModals = document.querySelectorAll('.modal-container');
  existingModals.forEach(modal => {
    document.body.removeChild(modal);
  });
  
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  
  // Create modal content
  modalContainer.innerHTML = `
    <div class="modal confirmation-modal">
      <div class="modal-header">
        <h3>Confirmation</h3>
        <button class="btn-close">&times;</button>
      </div>
      <div class="modal-body">
        <p>${message}</p>
        <div class="confirmation-buttons" style="display: flex; gap: 10px; margin-top: 1rem; justify-content: end;">
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

// Delete category from server
async function deleteCategory(categoryId) {
  try {
    const response = await fetch(`http://localhost:3000/categories/${categoryId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    alert('Error deleting category. Please try again.');
    return false;
  }
}

// Add category to table
function addCategoryToTable(category) {
  const tableBody = document.querySelector('.data-table tbody');
  
  // Format dates
  const createdDate = new Date(category.createdAt || Date.now());
  const updatedDate = new Date(category.updatedAt || Date.now());
  
  const createdDateString = createdDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  const updatedDateString = updatedDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  const row = document.createElement('tr');
  row.dataset.categoryId = category.id;
  row.innerHTML = `
    <td>${category.name}</td>
    <td><span class="status-badge ${category.status || 'available'}">${category.status || 'Available'}</span></td>
    <td>${createdDateString}</td>
    <td>${updatedDateString}</td>
    <td class="actions-cell">
      <button class="btn-edit" title="Edit Category"><i class="fas fa-edit"></i></button>
      <button class="btn-delete" title="Delete Category"><i class="fas fa-trash"></i></button>
    </td>
  `;
  
  tableBody.appendChild(row);
  
  // Add event listeners to the new buttons
  const editBtn = row.querySelector('.btn-edit');
  const deleteBtn = row.querySelector('.btn-delete');
  
  editBtn.addEventListener('click', () => {
    showEditCategoryModal(category.id, category.name);
  });
  
  deleteBtn.addEventListener('click', () => {
    showConfirmationDialog(
      'Are you sure you want to delete this category?',
      () => {
        deleteCategory(category.id).then(success => {
          if (success) {
            row.remove();
          }
        });
      }
    );
  });
}

// Update category in table
function updateCategoryInTable(categoryId, category) {
  const row = document.querySelector(`tr[data-category-id="${categoryId}"]`);
  if (row) {
    row.querySelector('td:nth-child(1)').textContent = category.name;
    
    // Update status if it exists
    if (category.status) {
      const statusBadge = row.querySelector('.status-badge');
      statusBadge.className = `status-badge ${category.status}`;
      statusBadge.textContent = category.status.charAt(0).toUpperCase() + category.status.slice(1);
    }
    
    // Update last updated date
    const updatedDate = new Date(category.updatedAt || Date.now());
    const updatedDateString = updatedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    row.querySelector('td:nth-child(4)').textContent = updatedDateString;
  }
}











