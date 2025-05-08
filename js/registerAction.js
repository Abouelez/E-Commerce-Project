import UserValidator from '../validation/UserValidator.js';
import User from '../models/User.js';
import { formValidation } from './utils/formValidation.js';

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');
    
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        formValidation.clearErrors();
        
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

        // Validate required fields
        const requiredErrors = formValidation.validateRequired({
            name: name,
            email: email,
            password: password,
            role: roleInput ? roleInput.value : null
        });

        if (Object.keys(requiredErrors).length > 0) {
            formValidation.showErrors(requiredErrors);
            return;
        }

        UserValidator.validate(userData).then((errors) => {
            if (errors == null) {
                User.create(userData)
                    .then((response) => {
                        alert('Registration successful! Go to login');
                        window.location.href = '/pages/login.html';
                    })
                    .catch((error) => {
                        formValidation.showError('password', 'Registration failed. Please try again.');
                    });
            } else {
                formValidation.showErrors(errors);
            }
        });
    });
});


