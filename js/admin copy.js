document.addEventListener('DOMContentLoaded', () => {

  const contentArea = document.querySelector('.admin-content');
  const menuLinks = document.querySelectorAll('.admin-sidebar a');
  
  // Function to load content
  function loadContent(url) {
    fetch(url)
      .then(response => response.text())
      .then(html => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        const newContent = temp.querySelector('.admin-content').innerHTML;
        contentArea.innerHTML = newContent;
        
        const title = temp.querySelector('title').textContent;
        document.title = title;
        
        initContentEventListeners();
      })
      .catch(error => {
        console.error('Error loading content:', error);
        contentArea.innerHTML = '<p>Error loading content. Please try again.</p>';
      });
  }
  
  function initContentEventListeners() {
    // Add User button - only on users page
    const addUserBtn = document.querySelector('.btn-add');
    const currentPage = window.location.pathname;
    
    if (addUserBtn && currentPage.includes('/pages/admin/users.html')) {
      addUserBtn.addEventListener('click', () => {
        showAddUserModal();
      });
    }
    
    // Handle direct action buttons
    const editButtons = document.querySelectorAll('.edit-user');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const row = button.closest('tr');
        const userId = row.dataset.userId;
        const name = row.querySelector('td:nth-child(1)').textContent;
        const username = row.querySelector('td:nth-child(2)').textContent;
        const email = row.querySelector('td:nth-child(3)').textContent;
        const status = row.querySelector('.status-badge').textContent;
        
        showEditUserModal(userId, name, username, email, status);
      });
    });
    
    const deleteButtons = document.querySelectorAll('.delete-user');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const row = button.closest('tr');
        const userId = row.dataset.userId;
        const name = row.querySelector('td:nth-child(1)').textContent;
        
        showConfirmationDialog(
          `Are you sure you want to delete user "${name}"?`,
          () => {
            // Remove row from table
            row.remove();
            
            // Delete from server
            deleteUser(userId);
          }
        );
      });
    });

    // Search functionality
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
  
  // Show Edit User Modal
  function showEditUserModal(userId, name, username, email, status) {
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
            <div class="form-group">
              <input type="text" id="fullName" placeholder="Full Name" value="${name}" required>
            </div>
            <div class="form-group">
              <input type="text" id="username" placeholder="Username" value="${username}" required>
            </div>
            <div class="form-group">
              <input type="email" id="email" placeholder="Email" value="${email}" required>
            </div>
            <div class="form-group">
              <select id="role" required>
                <option value="admin" ${status === 'Admin' ? 'selected' : ''}>Admin</option>
                <option value="customer" ${status === 'Customer' ? 'selected' : ''}>Customer</option>
                <option value="seller" ${status === 'Seller' ? 'selected' : ''}>Seller</option>
              </select>
            </div>
            <div class="form-group">
              <input type="password" id="password" placeholder="New Password (leave blank to keep current)">
            </div>
            <div class="form-group">
              <input type="password" id="confirmPassword" placeholder="Confirm password">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel">Close</button>
          <button class="btn-save">Save</button>
        </div>
      </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modalContainer);
    
    // Add event listeners
    const closeBtn = modalContainer.querySelector('.btn-close');
    const cancelBtn = modalContainer.querySelector('.btn-cancel');
    const saveBtn = modalContainer.querySelector('.btn-save');
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });
    
    saveBtn.addEventListener('click', () => {
      const form = document.getElementById('edit-user-form');
      const userId = document.getElementById('userId').value;
      const fullName = document.getElementById('fullName').value;
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const role = document.getElementById('role').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      // Validate form
      if (!fullName || !username || !email || !role) {
        alert('Please fill in all required fields');
        return;
      }
      
      if (password && password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      // Create updated user object
      const updatedUser = {
        id: userId,
        name: fullName,
        username: username,
        email: email,
        role: role
      };
      
      // Add password only if provided
      if (password) {
        updatedUser.password = password;
      }
      
      // Send to server
      fetch(`http://localhost:3000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Update user in table
        updateUserInTable(data);
        // Close modal
        document.body.removeChild(modalContainer);
      })
      .catch(error => {
        console.error('Error updating user:', error);
        alert('Error updating user. Please try again.');
      });
    });
  }

  // Update user in table
  function updateUserInTable(user) {
    const tableBody = document.querySelector('.data-table tbody');
    if (!tableBody) return;
    
    const row = document.querySelector(`tr[data-user-id="${user.id}"]`);
    if (row) {
      const now = new Date();
      const dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
      
      row.querySelector('td:nth-child(1)').textContent = user.name;
      row.querySelector('td:nth-child(2)').textContent = user.username;
      row.querySelector('td:nth-child(3)').textContent = user.email;
      row.querySelector('td:nth-child(6)').textContent = dateString;
    }
  }

  // Update user status
  function updateUserStatus(userId, status) {
    fetch(`http://localhost:3000/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: status })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error updating user status:', error);
      alert('Error updating user status. Please try again.');
    });
  }

  // Show Add User Modal
  function showAddUserModal() {
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
              <input type="text" id="fullName" placeholder="Full Name" required>
            </div>
            <div class="form-group">
              <input type="text" id="username" placeholder="Username" required>
            </div>
            <div class="form-group">
              <input type="email" id="email" placeholder="Email" required>
            </div>
            <div class="form-group">
              <select id="role" required>
                <option value="" disabled selected>Select role</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
            <div class="form-group">
              <input type="password" id="password" placeholder="Password" required>
            </div>
            <div class="form-group">
              <input type="password" id="confirmPassword" placeholder="Confirm password" required>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel">Close</button>
          <button class="btn-save">Save</button>
        </div>
      </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modalContainer);
    
    // Add event listeners
    const closeBtn = modalContainer.querySelector('.btn-close');
    const cancelBtn = modalContainer.querySelector('.btn-cancel');
    const saveBtn = modalContainer.querySelector('.btn-save');
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });
    
    saveBtn.addEventListener('click', () => {
      const form = document.getElementById('add-user-form');
      const fullName = document.getElementById('fullName').value;
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const role = document.getElementById('role').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      // Validate form
      if (!fullName || !username || !email || !role || !password) {
        alert('Please fill in all required fields');
        return;
      }
      
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      // Create new user object
      const newUser = {
        name: fullName,
        username: username,
        email: email,
        role: role,
        password: password,
        status: 'available'
      };
      
      // Send to server
      fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Add user to table
        addUserToTable(data);
        // Close modal
        document.body.removeChild(modalContainer);
      })
      .catch(error => {
        console.error('Error adding user:', error);
        alert('Error adding user. Please try again.');
      });
    });
  }

  // Add user to table
  function addUserToTable(user) {
    const tableBody = document.querySelector('.data-table tbody');
    if (!tableBody) return;
    
    const now = new Date();
    const dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    
    const row = document.createElement('tr');
    row.dataset.userId = user.id;
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td><span class="status-badge available">Available</span></td>
      <td>${dateString}</td>
      <td>${dateString}</td>
      <td>
        <div class="action-dropdown">
          <button class="btn-action">Actions <i class="fas fa-chevron-down"></i></button>
          <div class="dropdown-menu">
            <button class="dropdown-item edit-user">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="dropdown-item toggle-status">
              <i class="fas fa-toggle-on"></i> Toggle Status
            </button>
          </div>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
    
    // Add event listeners to the new buttons
    const editBtn = row.querySelector('.edit-user');
    const toggleBtn = row.querySelector('.toggle-status');
    
    editBtn.addEventListener('click', () => {
      showEditUserModal(
        user.id,
        user.name,
        user.username,
        user.email,
        user.role
      );
    });
    
    toggleBtn.addEventListener('click', () => {
      const statusBadge = row.querySelector('.status-badge');
      const currentStatus = statusBadge.textContent;
      
      // Toggle status
      const newStatus = currentStatus === 'Available' ? 'Deleted' : 'Available';
      
      // Update UI
      statusBadge.textContent = newStatus;
      statusBadge.className = 'status-badge ' + (newStatus === 'Available' ? 'available' : 'deleted');
      
      // Update server
      updateUserStatus(user.id, newStatus.toLowerCase());
    });
  }
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    loadContent(window.location.pathname);
  });
  
  // Load initial content based on current URL
  if (contentArea) {
    // Initialize event listeners for the initial content
    initContentEventListeners();
    
    // Only load content if we're not on the initial page load
    const currentPath = window.location.pathname;
    const currentLink = document.querySelector(`.admin-sidebar a[href="${currentPath}"]`);
    
    if (currentLink) {
      currentLink.parentElement.classList.add('active');
    }
  }
});

// Show confirmation dialog
function showConfirmationDialog(message, onConfirm) {
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  
  // Create modal content
  modalContainer.innerHTML = `
    <div class="modal confirmation-modal">
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel">No</button>
        <button class="btn-confirm">Yes</button>
      </div>
    </div>
  `;
  
  // Add modal to body
  document.body.appendChild(modalContainer);
  
  // Add event listeners
  const closeBtn = modalContainer.querySelector('.btn-close');
  const cancelBtn = modalContainer.querySelector('.btn-cancel');
  const confirmBtn = modalContainer.querySelector('.btn-confirm');
  
  // Close modal function
  const closeModal = () => {
    document.body.removeChild(modalContainer);
  };
  
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  
  confirmBtn.addEventListener('click', () => {
    // Execute the callback function
    onConfirm();
    // Close the modal
    closeModal();
  });
}






