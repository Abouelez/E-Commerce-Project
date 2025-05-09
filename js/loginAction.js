import User from '../models/User.js';
import { formValidation } from './utils/formValidation.js';
import { auth } from './utils/auth.js';

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is already logged in
    if (auth.isLoggedIn()) {
        auth.redirectToDashboard();
        return;
    }

    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        formValidation.clearErrors();
        
        // Get form values
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const loginData = {
            email: email,
            password: password
        };

        // Validate required fields
        const requiredErrors = formValidation.validateRequired({
            email: email,
            password: password
        });

        if (Object.keys(requiredErrors).length > 0) {
            formValidation.showErrors(requiredErrors);
            return;
        }

        // Get all users and find matching credentials
        User.getAll().then((users) => {
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Store user info in localStorage
                auth.saveUser({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                });
                
                // Redirect based on role
                auth.redirectToDashboard();
            } else {
                formValidation.showError('password', 'Invalid email or password');
            }
        }).catch((error) => {
            formValidation.showError('password', 'Login failed. Please try again.');
        });
    });
}); 