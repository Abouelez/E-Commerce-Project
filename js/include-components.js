document.addEventListener('DOMContentLoaded', () => {
  const includes = document.querySelectorAll('[data-include]');

  includes.forEach(element => {
    const file = element.getAttribute('data-include');
    fetch(file)
      .then(response => response.text())
      .then(html => {
        element.innerHTML = html;
        if (file === '/components/sidebar.html')
          setActiveMenuItem();
      })
      .catch(() => {
        element.innerHTML = 'Error loading component';
      });
  });

  function setActiveMenuItem() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('li[data-route]');
    links.forEach(link => {
      if (path.includes(link.getAttribute('data-route'))) {
        link.classList.add('active');
      }
    });
  }
});