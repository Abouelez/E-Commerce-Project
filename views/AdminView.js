const AdminView = {
    renderAdminPanel() {
        const app = document.getElementById('app');
        app.innerHTML = '';
        let testContent = document.createElement('div');
        testContent.innerText = 'hello from admin panel';
        app.append(testContent);
    }
}

export default AdminView;