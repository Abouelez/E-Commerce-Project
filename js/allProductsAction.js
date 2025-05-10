import loadHeader from "../components/loadWebsiteHeaderwthNav.js";
import Product from "../models/Product.js";
import Pagination from "/js/utils/pagination.js";
import Category from "../models/Category.js";

const searchInput = document.querySelector(".search-input");
const categoryDropdown = document.querySelector(".filter-dropdown");
const minPriceInput = document.querySelectorAll(".price-input")[0];
const maxPriceInput = document.querySelectorAll(".price-input")[1];
const applyBtn = document.querySelector(".filter-btn");
const container = document.getElementById("productsContainer");
const paginationContainer = document.getElementById("paginationContainer");

let allProducts = [];
let pagination;

function renderProducts(products) {
    container.innerHTML = '';
    if (products.length == 0) {
        container.innerHTML = `<p>No Data</p>`;
        return;
    }
    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.id = product.id;
        card.innerHTML = `
        <img src="${product.image || 'placeholder.jpg'}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>$${product.price}</p>
        `;
        container.appendChild(card);
    });
}
function renderPagination() {
    const { totalPages, currentPage } = pagination.getPageInfo();
    paginationContainer.innerHTML = "";

    // Prev button
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "«";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        renderProducts(pagination.setPage(currentPage - 1));
        renderPagination();
    });
    paginationContainer.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = currentPage === i ? "active" : "";
        btn.addEventListener("click", () => {
            renderProducts(pagination.setPage(i));
            renderPagination();
        });
        paginationContainer.appendChild(btn);
    }

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "»";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        renderProducts(pagination.setPage(currentPage + 1));
        renderPagination();
    });
    paginationContainer.appendChild(nextBtn);
}

  
function applyFilters() {
    const search = searchInput.value.trim().toLowerCase();
    const category = categoryDropdown.value;
    const min = parseFloat(minPriceInput.value) || 0;
    const max = parseFloat(maxPriceInput.value) || Infinity;

    let filtered = [...allProducts];

    // Filter by search
    if (search) {
        filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search)
        );
    }

    // Filter by category
    if (category) {
        filtered = filtered.filter(p =>
        p.category?.toLowerCase() === category
        );
    }
    
    // Filter by price
    filtered = filtered.filter(p =>
        p.price >= min && p.price <= max
    );

    // Create pagination and render
    pagination = new Pagination(filtered, 30); 
    renderProducts(pagination.getCurrentPageItems());
    renderPagination();
}

async function renderCategories() {
    const categories = await Category.getAll();
    categoryDropdown.innerHTML = `<option value="">All</option>`;
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.name.toLowerCase(); // match filtering logic
        option.textContent = cat.name;
        categoryDropdown.appendChild(option);
    });
}

window.addEventListener('load', async function () {
    document.getElementById('header').appendChild(loadHeader());
    renderCategories();
    allProducts = await Product.getAll();
    allProducts = allProducts.filter(product => product.status == 'approved');
    pagination = new Pagination(allProducts, 30);
    renderProducts(pagination.getCurrentPageItems());
    renderPagination();

    container.addEventListener("click", (e) => {
        const card = e.target.closest(".product-card");
        if (card && card.dataset.id) {
            window.location.href = `/product.html?id=${card.dataset.id}`;
        }
    });
    
    applyBtn.addEventListener("click", applyFilters);
})