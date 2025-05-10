import loadHeader from "../components/loadWebsiteHeaderwthNav.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { auth } from "./utils/auth.js";

const userId = auth.getCurrentUser().id;
const cartContainer = document.getElementById('cart-container');
const totalContainer = document.getElementById('cart-total');

function createCartElement(product, cnt) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    const totalPrice = product.price * cnt;

    cartItem.innerHTML = `
        <div class="product-info">
            <img src="${product.image}" alt="${product.name}" />
            <span>${product.name}</span>
        </div>
        <div>$${product.price.toFixed(2)}</div>
        <div>
            <input type="number" min="1" value="${cnt}" data-id="${product.id}" class="qty-input" />
            <button class="remove-btn" data-id="${product.id}" title="Remove">
                <i  class="fas fa-trash"></i>
            </button>
        </div>
        <div class="item-total">$${totalPrice.toFixed(2)}</div>
    `;
    return cartItem;
}

async function renderCart() {
    const user = await User.get(userId);
    const cart = user.cart || [];

    cartContainer.innerHTML = `
        <h1>Shopping Cart</h1>
        <div class="cart-header">
            <div>Product</div>
            <div>Price</div>
            <div>Quantity</div>
            <div>Total</div>
        </div>
    `;

    let subtotal = 0;
    let formattedCart = [];

    for (const item of cart) {
        const product = await Product.get(item.product_id);
        subtotal += product.price * item.count;
        const cartItem = createCartElement(product, item.count);
        cartContainer.appendChild(cartItem);
        
        // إضافة العنصر إلى السلة المنسقة
        formattedCart.push({
            id: item.product_id,
            name: product.name,
            price: product.price,
            quantity: item.count,
            image: product.image
        });
    }

    // مزامنة السلة مع localStorage
    localStorage.setItem('cart', JSON.stringify(formattedCart));

    updateTotal(subtotal);
    attachEventListeners();
}

function updateTotal(subtotal) {
    totalContainer.innerHTML = `
        <h2>Cart Total</h2>
        <div class="total-line"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="total-line"><span>Shipping:</span><span>$0.00</span></div>
        <div class="total-line total"><span>Total:</span><span>$${subtotal.toFixed(2)}</span></div>
        <a href="../pages/Checkout.html" class="checkout-btn">Proceed to Checkout</a>
    `;
}

// Attach event listeners using event delegation
function attachEventListeners() {
    cartContainer.addEventListener('click', async (e) => {
        // Handle remove button click
        const r_btn = e.target.closest('.remove-btn');
        if (r_btn) {
            const productId = parseInt(r_btn.dataset.id);
            console.log(productId);
            console.log(userId);
            await User.removeFromCart(userId, productId);
            // renderCart();  // Re-render cart after removing item
        }
    });

    cartContainer.addEventListener('input', async (e) => {
        // Handle quantity change
        if (e.target.classList.contains('qty-input')) {
            const newCount = parseInt(e.target.value);
            const productId = parseInt(e.target.dataset.id);
            if (newCount >= 1) {
                await User.addToCart(userId, productId, newCount, true); // Update cart count
                renderCart();  // Re-render cart after updating quantity
                attachEventListeners();
            }
        }
    });
}

window.addEventListener('load', () => {
    document.getElementById('header').appendChild(loadHeader());
    renderCart();   // Initial render
    attachEventListeners();   // Attach event delegation

    
    console.log(document.querySelectorAll('button'))
});

// في نهاية الملف، أضف هذه الوظيفة للتأكد من أن السلة متاحة للصفحات الأخرى
function syncCartWithLocalStorage(cart) {
  // تحويل تنسيق السلة إلى التنسيق المستخدم في checkout.js
  const formattedCart = cart.map(item => {
    return {
      id: item.product_id,
      name: item.productName || 'Product',
      price: item.price || 0,
      quantity: item.count || 1,
      image: item.image || 'images/placeholder.jpg'
    };
  });
  
  // حفظ السلة بالتنسيق الجديد
  localStorage.setItem('cart', JSON.stringify(formattedCart));
}
