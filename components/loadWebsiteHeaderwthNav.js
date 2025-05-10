export default function loadHeader() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
    const isLoggedIn = !!currentUser;
    const isAdminOrSeller = isLoggedIn && ['admin', 'seller'].includes(currentUser.role);
  
    const header = document.createElement('header');
    header.classList.add('header', 'flex', 'space-between', 'align-center', 'wrap');
  
    // NAV LINKS
  let navLinks = `
    <a href="/index.html">Home</a>
      <a href="/pages/all.html">All Products</a>
    `;
  
    if (isAdminOrSeller) {
      navLinks = `<a href="/pages/admin/dashboard.html">Dashboard</a>` + navLinks;
    }
  
  
  
    const navHTML = `<nav class="nav-links flex wrap">${navLinks}</nav>`;
  
    // CART ICON
    const cartHTML = isLoggedIn
      ? `<div id="cart-icon" class="cart-icon relative">
           <i  class="fas fa-shopping-cart"></i>
           
         </div>`
      : '';
  
    // USER SECTION (Login Button for anonymous users)
    const userSection = isLoggedIn
      ? `<div class="user-menu relative">
           <div class="user-info flex align-center user-toggle" style="cursor:pointer;">
             <i class="fas fa-user"></i>
             <span class="username">Hi, ${currentUser.name}</span>
           </div>
           <div class="dropdown hidden absolute">
             <a href="profile.html">Profile</a>
             <a href="#" id="logout-btn">Logout</a>
           </div>
         </div>`
      : `<a href="pages/login.html" class="login-btn">Login</a>`;  // Show Login button for non-logged-in users
  
    // FINAL HEADER HTML
    header.innerHTML = `
      <div class="logo">Exclusive</div>
      ${navHTML}
      <div class="search-container flex align-center">
        <input type="text" placeholder="What are you looking for?" />
        <i class="fas fa-search"></i>
      </div>
      <div class="icons flex align-center">
        ${cartHTML}
        ${userSection}
      </div>
    `;
  
    // DROPDOWN HANDLING
    if (isLoggedIn) {
      setTimeout(() => {
        const toggle = header.querySelector('.user-toggle');
        const dropdown = header.querySelector('.dropdown');
  
        document.addEventListener('click', (e) => {
          if (toggle.contains(e.target)) {
            dropdown.classList.toggle('hidden');
          } else if (!e.target.closest('.user-menu')) {
            dropdown.classList.add('hidden');
          }
  
          if (e.target.id === 'logout-btn') {
            localStorage.removeItem('currentUser');
            location.reload();
          }
        });
      }, 0);
    }
  
    return header;
  }
  