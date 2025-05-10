import Order from '../models/Order.js';

document.addEventListener('DOMContentLoaded', function() {
  // Load cart items from localStorage
  loadCartItems();
  
  // Add event listeners
  document.getElementById('place-order-btn').addEventListener('click', placeOrder);
});

// Load cart items from localStorage
function loadCartItems() {
  const orderItemsContainer = document.getElementById('order-items');
  
  let cartItems = JSON.parse(localStorage.getItem('cart')) || [];  
  console.log('Cart items from localStorage:', cartItems);
  
  if (cartItems.length === 0) {
    orderItemsContainer.innerHTML = '<li class="empty-cart">Your cart is empty</li>';
    
    // Disable place order button
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.style.backgroundColor = '#cccccc';
      placeOrderBtn.style.cursor = 'not-allowed';
    }
    return;
  }
  
  let subtotal = 0;
  let itemsHtml = '';
  
  // Check if cart items have the expected structure
  // If items have product_id instead of id, adjust accordingly
  cartItems.forEach(item => {
    // Handle different cart item structures
    const itemId = item.id || item.product_id;
    const itemName = item.name || item.productName || 'Product';
    const itemPrice = item.price || 0;
    const itemQuantity = item.quantity || item.count || 1;
    const itemImage = item.image || 'images/placeholder.jpg';
    
    const itemTotal = itemPrice * itemQuantity;
    subtotal += itemTotal;
    
    itemsHtml += `
      <li>
        <div class="item">
          <img src="${itemImage}" alt="${itemName}">
          <div class="item-name">${itemName} <span class="item-quantity">x${itemQuantity}</span></div>
          <div class="item-price">$${itemTotal.toFixed(2)}</div>
        </div>
      </li>
    `;
  });
  
  // Add subtotal, shipping, and total
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;
  
  itemsHtml += `
    <li class="summary-line"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></li>
    <li class="summary-line"><span>Tax (10%)</span><span>$${tax.toFixed(2)}</span></li>
    <li class="summary-line"><span>Shipping</span><span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></li>
    <li class="total"><span>Total</span><span>$${total.toFixed(2)}</span></li>
  `;
  
  orderItemsContainer.innerHTML = itemsHtml;
  
  // Store order totals for later use
  localStorage.setItem('orderTotals', JSON.stringify({
    subtotal: subtotal,
    shipping: shipping,
    tax: tax,
    total: total
  }));
}

// Place order
async function placeOrder() {
  // Validate form
  const form = document.getElementById('checkout-form');
  if (!validateForm(form)) {
    return;
  }
  
  // Get form data
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const street = document.getElementById('street').value;
  const city = document.getElementById('city').value;
  const state = document.getElementById('state').value;
  const zip = document.getElementById('zip').value;
  const country = document.getElementById('country').value;
  
  // Get cart items
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const orderTotals = JSON.parse(localStorage.getItem('orderTotals')) || {};
  
  // Create products array for order
  const products = cartItems.map(item => {
    // Handle different cart item structures
    return {
      productId: item.id || item.product_id,
      quantity: item.quantity || item.count || 1,
      price: item.price || 0,
      name: item.name || item.productName || 'Product'
    };
  });
  
  // Create order object
  const orderData = {
    customerId: localStorage.getItem('userId') || null, // If user is logged in
    date: new Date().toISOString(),
    status: "pending",
    shippingAddress: {
      street: street,
      city: city,
      state: state,
      zip: zip,
      country: country
    },
    products: products,
    subtotal: orderTotals.subtotal || 0,
    shipping: orderTotals.shipping || 0,
    tax: orderTotals.tax || 0,
    total: orderTotals.total || 0,
    customer: {
      name: name,
      email: email,
      phone: phone
    }
  };
  
  try {
    // Create order using Order model
    const order = await Order.create(orderData);
    
    // Clear cart from localStorage
    localStorage.removeItem('cart');
    localStorage.removeItem('orderTotals');
    
    // If user is logged in, clear their cart in the database too
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        // Clear user's cart in database
        const response = await fetch(`http://localhost:3000/users/${userId}`, {
          method: 'GET'
        });
        
        if (response.ok) {
          const userData = await response.json();
          userData.cart = []; 
          
          // Update user data
          await fetch(`http://localhost:3000/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });
        }
      } catch (error) {
        console.error('Error clearing user cart in database:', error);
        
      }
    }
    
    // Redirect to order confirmation page
    window.location.href = `order-confirmation.html?id=${order.id}`;
  } catch (error) {
    console.error('Error creating order:', error);
    alert('There was an error processing your order. Please try again.');
  }
}

// Validate form
function validateForm(form) {
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('error');
      isValid = false;
    } else {
      field.classList.remove('error');
    }
  });
  
  if (!isValid) {
    alert('Please fill in all required fields');
  }
  
  return isValid;
}



