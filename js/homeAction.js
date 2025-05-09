import loadHeader from "../components/loadWebsiteHeaderwthNav.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { auth } from "./utils/auth.js";
let categories = [];
let currentStart = 0;

async function loadCategories() {
    categories = await Category.getAll();
    customPaginate(currentStart);
}

function renderCategories(st, end) {
    let categoriesContainer = document.getElementById('categories-container');
    categoriesContainer.innerHTML = ``;
    for (let i = st; i <= end; i++) {
        if (categories[i]) {
            let div = document.createElement('div');
            div.classList.add('category-card');
            div.setAttribute('data-id', categories[i].id);
            let p = document.createElement('p');
            p.innerText = categories[i].name;
            div.append(p);
            categoriesContainer.append(div);
        }
    }
}

function customPaginate(st = 0) {
    let end = st + 3;
    renderCategories(st, end);
}

function setupPaginationButtons() {
    const prevBtn = document.querySelectorAll('.arrow-btn')[0];
    const nextBtn = document.querySelectorAll('.arrow-btn')[1];

    prevBtn.addEventListener('click', () => {
        if (currentStart > 0) {
            currentStart--;
            customPaginate(currentStart);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentStart + 4 < categories.length) {
            currentStart++;
            customPaginate(currentStart);
        }
    });
}

async function loadFeaturedProducts() {
    const products = await Product.getAll();
    const featured = [...products].sort(() => Math.random() - 0.5).slice(0, 4);
    console.log(featured);
    renderFeaturedProducts(featured);
}

function renderFeaturedProducts(products) {
    let featuredContainer = document.getElementById('featured');
    featuredContainer.innerHTML = '';
    for (let product of products) {
        let div = document.createElement('div');
        div.classList.add('product-card');
        div.innerHTML = `<img src="${product.image}"/>
                         <h3>${product.name}</h3>
                         <p>$${product.price}</p>
                         <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart
                         </button>`;
        featuredContainer.append(div);
    }

}
window.addEventListener('load', function () {
    const header = document.getElementById('header');
    header.appendChild(loadHeader());
    loadCategories();
    setupPaginationButtons();
    loadFeaturedProducts();

    this.document.getElementById('categories-container').addEventListener('click', function (e) {
        const card = e.target.closest('.category-card');
        if (card) {
            const categoryId = card.getAttribute('data-id');
            window.location.href = `allProducts.html?category=${categoryId}`;
        }
    });

    this.document.getElementById('featured').addEventListener('click', function (e) {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = e.target.dataset.id;
            User.addToCart(auth.getCurrentUser().id, productId, 1);
        }
    })

    this.document.getElementById('cart-icon').addEventListener('click', function () {
        window.location.href = './cart.html';
    })
});