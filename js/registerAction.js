import UserValidator from '../validation/UserValidator.js';
import User from '../models/User.js';

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');
    
    // Function to clear all error messages
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
    }

    // Function to show error for a specific field
    function showError(fieldId, message) {
        const input = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (input && errorElement) {
            input.classList.add('error');
            errorElement.textContent = message;
        }
    }
    
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const roleInput = document.querySelector('input[name="role"]:checked');
        
        const userData = {
            name: name,
            email: email,
            password: password,
            role: roleInput ? roleInput.value : null
        };

        // Basic validation
        // if (!name) showError('name', 'Name is required');
        // if (!email) showError('email', 'Email is required');
        // if (!password) showError('password', 'Password is required');
        // if (!roleInput) showError('role', 'Please select an account type');

        // If any basic validation failed, return
        // if (!name || !email || !password || !roleInput) {
        //     return;
        // }

        UserValidator.validate(userData).then((errors) => {
            if (errors == null) {
                User.create(userData)
                    .then((response) => {
                        alert('Registration successful! Go to login');
                    })
                    .catch((error) => {
                        showError('password', 'Registration failed. Please try again.');
                    });
            } else {
                // Display validation errors
                if (errors.name) showError('name', errors.name);
                if (errors.email) showError('email', errors.email);
                if (errors.password) showError('password', errors.password);
                if (errors.role) showError('role', errors.role);
            }
        });
    });
});


