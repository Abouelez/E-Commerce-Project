import Category from '../models/Category.js'
import Pagination from './utils/pagination.js'

// Global variables
let categories = [];
let pagination;

// DOM Elements
const tableBody = document.querySelector('.data-table tbody');
const searchInput = document.querySelector('.search-box input');
const prevPageBtn = document.querySelector('.btn-prev');
const nextPageBtn = document.querySelector('.btn-next');
const pageNumbers = document.querySelector('.page-controls');

// Load categories and initialize the page
async function loadCategories() {
    try {
        categories = await Category.getAll();
        pagination = new Pagination(categories, 10); // 10 items per page
        renderCategories();
        updatePagination();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Handle search functionality
function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    const filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes(query)
    );
    pagination = new Pagination(filteredCategories, 10);
    renderCategories();
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
        renderCategories();
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
            renderCategories();
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
        renderCategories();
        updatePagination();
    });
    pageNumbers.appendChild(nextBtn);

    // Update navigation buttons state
    prevPageBtn.disabled = pageInfo.currentPage === 1;
    nextPageBtn.disabled = pageInfo.currentPage === pageInfo.totalPages;
}

// Render categories in the table
function renderCategories() {
    // Clear existing table content
    tableBody.innerHTML = '';
    
    // Get current page items from pagination
    const currentPageItems = pagination.getCurrentPageItems();
    
    // Add each category to the table
    currentPageItems.forEach(category => {
        const row = document.createElement('tr');
        row.setAttribute('data-category-id', category.id);
        row.innerHTML = `
            <td>${category.name}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action edit-category" data-id="${category.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete-category" data-id="${category.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners for edit and delete buttons
    tableBody.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const categoryId = e.currentTarget.dataset.id;
            console.log('Edit category:', categoryId);
            // Add your edit logic here
        });
    });

    tableBody.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const categoryId = e.currentTarget.dataset.id;
            console.log('Delete category:', categoryId);
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
        renderCategories();
        updatePagination();
    });
    
    nextPageBtn.addEventListener('click', () => {
        pagination.setPage(pagination.getPageInfo().currentPage + 1);
        renderCategories();
        updatePagination();
    });
}

// Initialize when the page loads
window.addEventListener('load', () => {
    initializeEventListeners();
    loadCategories();
});