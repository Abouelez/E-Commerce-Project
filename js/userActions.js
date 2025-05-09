import User from '../models/User.js'
import Pagination from './utils/pagination.js'

// Global variables
let users = [];
let pagination;

// DOM Elements
const tableBody = document.querySelector('.data-table tbody');
const searchInput = document.querySelector('.search-box input');
const prevPageBtn = document.querySelector('.btn-prev');
const nextPageBtn = document.querySelector('.btn-next');
const pageNumbers = document.querySelector('.page-controls');

// Load users and initialize the page
async function loadUsers() {
    try {
        users = await User.getAll();
        pagination = new Pagination(users, 10); // 10 items per page
        renderUsers();
        updatePagination();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Handle search functionality
function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(query)
    );
    pagination = new Pagination(filteredUsers, 10);
    renderUsers();
    updatePagination();
}

// Update pagination controls
function updatePagination() {
    const pageInfo = pagination.getPageInfo();
    
    // Update page numbers
    pageNumbers.innerHTML = '';
    
    // Add prev button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn-prev';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.addEventListener('click', () => {
        pagination.setPage(pageInfo.currentPage - 1);
        renderUsers();
        updatePagination();
    });
    pageNumbers.appendChild(prevBtn);

    // Add page numbers
    for (let i = 1; i <= pageInfo.totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `btn-page ${i === pageInfo.currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            pagination.setPage(i);
            renderUsers();
            updatePagination();
        });
        pageNumbers.appendChild(pageBtn);
    }

    // Add next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-next';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.addEventListener('click', () => {
        pagination.setPage(pageInfo.currentPage + 1);
        renderUsers();
        updatePagination();
    });
    pageNumbers.appendChild(nextBtn);

    // Update navigation buttons state
    prevPageBtn.disabled = pageInfo.currentPage === 1;
    nextPageBtn.disabled = pageInfo.currentPage === pageInfo.totalPages;
}

// Render users in the table
function renderUsers() {
    // Clear existing table content
    tableBody.innerHTML = '';
    
    // Get current page items from pagination
    const currentPageItems = pagination.getCurrentPageItems();
    
    // Add each user to the table
    currentPageItems.forEach(user => {
        const row = document.createElement('tr');
        row.setAttribute('data-user-id', user.id);
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action edit-user" data-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete-user" data-id="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners for edit and delete buttons
    tableBody.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.dataset.id;
            console.log('Edit user:', userId);
            // Add your edit logic here
        });
    });

    tableBody.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const UserId = e.currentTarget.dataset.id;
            console.log('Delete user:', UserId);
            // Add your delete logic here
        });
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);

    // Pagination controls
    prevPageBtn.addEventListener('click', () => {
        pagination.setPage(pagination.getPageInfo().currentPage - 1);
        renderUsers();
        updatePagination();
    });
    
    nextPageBtn.addEventListener('click', () => {
        pagination.setPage(pagination.getPageInfo().currentPage + 1);
        renderUsers();
        updatePagination();
    });
}

// Initialize when the page loads
window.addEventListener('load', () => {
    initializeEventListeners();
    loadUsers();
});