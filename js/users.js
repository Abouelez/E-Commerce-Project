import User from '../models/User.js';
import UserValidator from '../validation/UserValidator.js';

document.addEventListener('DOMContentLoaded', function() {
  // Load users from server
  loadUsers();
  
  // Initialize add user button
  initializeAddUserButton();
  
  // Initialize search functionality
  initializeSearch();
});

// Load users from server
async function loadUsers() {
  try {
    const users = await User.getAll();
    
    // Clear existing table rows
    const tableBody = document.querySelector('.data-table tbody');
    tableBody.innerHTML = '';
    
    // Add users to table
    users.forEach(user => {
      addUserToTable(user);
    });
    
    // Initialize action buttons after populating the table
    initializeActionButtons();
  } catch (error) {
    console.error('Error loading users:', error);
    alert('Error loading users. Please try again.');
  }
}

// Initialize action buttons
function initializeActionButtons() {
  // Edit user
  const editButtons = document.querySelectorAll('.btn-edit');
  editButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const row = button.closest('tr');
      const userId = row.dataset.userId;
      const name = row.querySelector('td:nth-child(1)').textContent;
      const email = row.querySelector('td:nth-child(2)').textContent;
      const role = row.querySelector('td:nth-child(3)').textContent;
      
      showEditUserModal(userId, name, email, role);
    });
  });
  
  // Delete user
  const deleteButtons = document.querySelectorAll('.btn-delete');
  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const row = button.closest('tr');
      const userId = row.dataset.userId;
      const name = row.querySelector('td:nth-child(1)').textContent;
      
      showConfirmationDialog(
        `Are you sure you want to delete user "${name}"?`,
        () => {
          // Delete from server first
          deleteUser(userId).then(success => {
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

// Initialize add user button
function initializeAddUserButton() {
  const addButton = document.querySelector('.btn-add-user');
  if (addButton) {
    addButton.addEventListener('click', () => {
      showAddUserModal();
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

// Show add user modal
function showAddUserModal() {
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
        <h3>Add User</h3>
        <button class="btn-close">&times;</button>
      </div>
      <div class="modal-body">
        <form id="add-user-form">
          <div class="form-group">
            <input type="text" id="userName" placeholder="Full Name" required>
            <span class="error-message" id="userName-error"></span>
          </div>
          <div class="form-group">
            <input type="email" id="userEmail" placeholder="Email" required>
            <span class="error-message" id="userEmail-error"></span>
          </div>
          <div class="form-group">
            <input type="password" id="userPassword" placeholder="Password" required>
            <span class="error-message" id="userPassword-error"></span>
          </div>
          <div class="form-group">
            <select id="userRole" required>
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
            </select>
            <span class="error-message" id="userRole-error"></span>
          </div>
          <div class="form-group" style="display: flex; align-items: end;">
            <button type="submit" class="btn-submit btn-save" style="width: 25%;">Add User</button>
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
  
  // Form submission for adding a user
  const form = modalContainer.querySelector('#add-user-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    const userPassword = document.getElementById('userPassword').value;
    const userRole = document.getElementById('userRole').value;
    
    try {
      // Clear previous error messages
      document.getElementById('userName-error').textContent = '';
      document.getElementById('userEmail-error').textContent = '';
      document.getElementById('userRole-error').textContent = '';
      
      // Validate user data
      const userData = {
        name: userName,
        email: userEmail,
        role: userRole,
        password: userPassword
      };
      
      const validationErrors = await UserValidator.validate(userData);
      
      // If validation fails, show error messages and return
      if (validationErrors) {
        if (validationErrors.name) {
          document.getElementById('userName-error').textContent = validationErrors.name;
        }
        if (validationErrors.email) {
          document.getElementById('userEmail-error').textContent = validationErrors.email;
        }
        if (validationErrors.role) {
          document.getElementById('userRole-error').textContent = validationErrors.role;
        }
        if (validationErrors.password) {
          document.getElementById('userPassword-error').textContent = validationErrors.password;
        }
        return;
      }
      
      // Get the next available ID
      const users = await User.getAll();
      const maxId = users.length > 0 ? Math.max(...users.map(u => parseInt(u.id))) : 0;
      const nextId = (maxId + 1).toString();
      
      // Create new user object
      const newUser = {
        id: nextId,
        name: userName,
        email: userEmail,
        password: userPassword,
        role: userRole,
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Send to server
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Add user to table
      addUserToTable(data);
      
      // Close modal
      document.body.removeChild(modalContainer);
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user. Please try again.');
    }
  });
}

// Show edit user modal
function showEditUserModal(userId, name, email, role) {
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
        <h3>Edit User</h3>
        <button class="btn-close">&times;</button>
      </div>
      <div class="modal-body">
        <form id="edit-user-form">
          <input type="hidden" id="userId" value="${userId}">
          <input type="hidden" id="userEmail" value="${email}">
          <div class="form-group">
            <input type="text" id="userName" placeholder="Full Name" value="${name}" required>
            <span class="error-message" id="userName-error"></span>
          </div>
          <div class="form-group">
            <select id="userRole" required>
              <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
              <option value="customer" ${role === 'customer' ? 'selected' : ''}>Customer</option>
              <option value="seller" ${role === 'seller' ? 'selected' : ''}>Seller</option>
            </select>
            <span class="error-message" id="userRole-error"></span>
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
  const form = modalContainer.querySelector('#edit-user-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value; // Get from hidden field
    const userRole = document.getElementById('userRole').value;
    
    try {
      // Get the current user first
      const getResponse = await fetch(`http://localhost:3000/users/${userId}`);
      if (!getResponse.ok) {
        throw new Error('Failed to fetch user');
      }
      
      const currentUser = await getResponse.json();
      
      // Create updated user object
      const updatedUser = {
        ...currentUser,
        name: userName,
        role: userRole,
        updatedAt: new Date().toISOString()
      };
      
      // Send to server
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Update user in table
      updateUserInTable(userId, data);
      
      // Close modal
      document.body.removeChild(modalContainer);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Please try again.');
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
        <h3>Confirm Action</h3>
        <button class="btn-close">&times;</button>
      </div>
      <div class="modal-body">
        <p>${message}</p>
        <div class="confirmation-buttons">
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

// Delete user from server
async function deleteUser(userId) {
  try {
    const response = await fetch(`http://localhost:3000/users/${userId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Error deleting user. Please try again.');
    return false;
  }
}

// Add user to table
function addUserToTable(user) {
  const tableBody = document.querySelector('.data-table tbody');
  
  // Format dates
  const createdDate = new Date(user.createdAt || Date.now());
  const updatedDate = new Date(user.updatedAt || Date.now());
  
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
  row.dataset.userId = user.id;
  row.innerHTML = `
    <td>${user.name}</td>
    <td>${user.email}</td>
    <td>${user.role}</td>
    <td><span class="status-badge ${user.status || 'available'}">${user.status || 'Available'}</span></td>
    <td>${createdDateString}</td>
    <td>${updatedDateString}</td>
    <td class="actions-cell">
      <button class="btn-edit" title="Edit User"><i class="fas fa-edit"></i></button>
      <button class="btn-delete" title="Delete User"><i class="fas fa-trash"></i></button>
    </td>
  `;
  
  tableBody.appendChild(row);
  
  // Add event listeners to the new buttons
  const editBtn = row.querySelector('.btn-edit');
  const deleteBtn = row.querySelector('.btn-delete');
  
  editBtn.addEventListener('click', () => {
    showEditUserModal(user.id, user.name, user.email, user.role);
  });
  
  deleteBtn.addEventListener('click', () => {
    showConfirmationDialog(
      `Are you sure you want to delete user "${user.name}"?`,
      () => {
        deleteUser(user.id).then(success => {
          if (success) {
            row.remove();
          }
        });
      }
    );
  });
}

// Update user in table
function updateUserInTable(userId, user) {
  const row = document.querySelector(`tr[data-user-id="${userId}"]`);
  if (row) {
    row.querySelector('td:nth-child(1)').textContent = user.name;
    row.querySelector('td:nth-child(2)').textContent = user.email;
    row.querySelector('td:nth-child(3)').textContent = user.role;
    
    // Update status if it exists
    if (user.status) {
      const statusBadge = row.querySelector('.status-badge');
      statusBadge.className = `status-badge ${user.status}`;
      statusBadge.textContent = user.status.charAt(0).toUpperCase() + user.status.slice(1);
    }
    
    // Update last updated date
    const updatedDate = new Date(user.updatedAt || Date.now());
    const updatedDateString = updatedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    row.querySelector('td:nth-child(6)').textContent = updatedDateString;
  }
}




