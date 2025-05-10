import loadHeader from "/components/loadWebsiteHeaderwthNav.js";

window.addEventListener('load', function () {
    this.document.getElementById('header').append(loadHeader());
})