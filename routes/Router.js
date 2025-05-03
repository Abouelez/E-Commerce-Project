import AdminController from "../controllers/AdminController.js";
import HomeController from "../controllers/HomeController.js";
const Router = {
    init() {
        window.addEventListener('hashchange', this.handleRoute);
        this.handleRoute(); //initial load
    },
    
    handleRoute() {
        const route = location.hash.slice(1) || '/';
        if (route == '/admin') {
            AdminController.showDashboard();
        }
        if (route == '/') {
            HomeController.renderHomePage();
        }
    }
};

export default Router;