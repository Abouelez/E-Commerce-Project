import Model from "./Model.js";

export default class Product extends Model{
    static table = 'products';
    static url = `http://localhost:3000/${User.table}`;
    // constructor(_url = 'http://localhost:3000', _table = 'products') {
    //     super(_url, _table);
    // }
}