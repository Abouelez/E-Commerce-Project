import Model from "./Model.js";

export default class Category extends Model{
    static table = 'categories';
    static url = `http://localhost:3000/${Category.table}`;
    // constructor(_url = 'http://localhost:3000', _table = 'categories') {
    //     super(_url, _table);
    // }
}