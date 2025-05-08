import User from './models/User.js';
import UserValidator from './validation/UserValidator.js';

// user.update(1, {
//     name: "Abdulrahman"
// }).then((d) => {
//     console.log(d);
// })
// // console.log(user.get(1));
// (
//     async () => {
//         let u = await user.get(1);
//         document.body.innerHTML = JSON.stringify(u);
//     }
// )();
// (() => {
//     let u = user.get(1).then((data) =>{
//         document.body.innerHTML = JSON.stringify(data);
//         })
//     }
// )();
// user.getAll().then((d) => {
//     document.body.innerHTML = JSON.stringify(d);
// })
// user.create({ name: 'test add', username: 'test', role: "admin" });
// user.create({ name: 'test new', username: 'testusername', role: 'admin' }).then((d) => {
//     console.log(d);
// });
// user.delete(3).then((d) => {
//     console.log(d);
// })
// window.addEventListener('load', function () {
//     Router.init();
// })

// User.getAll().then((d)=>{
//     console.log(d); //view on html page instead.
// })

UserValidator.validate({
    name: "Abdulrahman Ezz",
    username: "admin5",
    email: "admin@gmail.com",
    role: "admin"
}).then((d) => {
    console.log(d);
});
