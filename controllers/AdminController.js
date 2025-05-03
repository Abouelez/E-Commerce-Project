import AdminView from "../views/adminView.js";
const AdminController = {
    showDashboard() {
        AdminView.renderAdminPanel();
    }
}

export default AdminController;