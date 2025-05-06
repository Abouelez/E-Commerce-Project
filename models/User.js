import Model from "./Model.js";

export default class User extends Model{
    static table = 'users';
    static url = `http://localhost:3000/${User.table}`;
    // constructor(_url = 'http://localhost:3000', _table = 'users') {
    //     super(_url, _table);
    // }
}