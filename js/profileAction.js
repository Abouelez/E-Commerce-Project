import loadHeader from '/components/loadWebsiteHeaderwthNav.js';
import { auth } from "./utils/auth.js";
import UserValidator from '../validation/UserValidator.js';
import { formValidation } from './utils/formValidation.js';
import User from '../models/User.js';
const user = auth.getCurrentUser();

if (!user) {
    alert('plz login first')
    window.location.href = '/pages/login.html';
}
window.addEventListener('load', function () {
    this.document.getElementById('header').append(loadHeader());

    const form = document.getElementById("profile-form");
    form.name.value = user.name;
    form.email.value = user.email;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        UserValidator.validate({ name: form.name.value, email: form.email.value, password: form.password.value, role: user.role }).then((errors) => {
            if (errors == null) {
                User.update(user.id,{ name: form.name.value, email: form.email.value, password: form.password.value, role: user.role }).then((response) => {
                    if (response) {
                        alert('Your data updated successfully');
                        localStorage.setItem('currentUser', JSON.stringify({
                            id: user.id,
                            name: form.name.value,
                            email: form.email.value,
                            role: user.role
                        }));
                    }
                    else
                        alert('Something went wrong.');
                })
                
            }
            else {
                formValidation.showErrors(errors);
                return;
            }   
        })
        
    })
})