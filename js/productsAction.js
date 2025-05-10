import Product from "../models/Product.js";
import loadHeader from "/components/loadWebsiteHeaderwthNav.js";
import { auth } from './utils/auth.js';
import User from "../models/User.js";
const productId = new URLSearchParams(window.location.search).get('id');
const user = auth.getCurrentUser();

window.addEventListener('load', async function () {
    this.document.getElementById('header').append(loadHeader());
    let product = await Product.get(productId);
    if (!product)
        this.window.location.href = '/index.html';

    document.querySelector('.main-image').src = product.image;
    document.querySelector('h1').textContent = product.name;
    document.querySelector('.product-price').textContent = `$${product.price.toFixed(2)}`;
    document.querySelector('.product-description').textContent = product.description;

    const quantityInput = document.getElementById('quan');
    document.querySelector('.increment').onclick = () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
    };
    document.querySelector('.decrement').onclick = () => {
        const current = parseInt(quantityInput.value);
        if (current > 1) quantityInput.value = current - 1;
    };
    
    document.querySelector('.buy-now').addEventListener('click', async function (e) {
        e.preventDefault();
        
        if (!user) {
            alert('Please login to continue!');
            window.location.href = '/pages/login.html';
            return;
        }
        
        const quantity = parseInt(quantityInput.value);
        
        try {
            // إضافة المنتج إلى سلة المستخدم
            await User.addToCart(user.id, productId, quantity);
            
            // الانتقال إلى صفحة الدفع
            window.location.href = '/pages/cart.html';
        } catch (error) {
            console.error('Error adding product to cart:', error);
            alert('error adding product to cart');
        }
    });
})
