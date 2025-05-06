export default class Model{
    static table = '';
    static url = `http://localhost:3000/${Model.table}`;
    constructor() {
    }

    // set Url(_url) {
    //     this.url = `${_url}/${this.table}`;
    // }
    // get Url() {
    //     return Model.url;
    // }

    static async getLatestId() {
        const all = await this.getAll();
        const maxId = Math.max(...all.map(item => item.id));
        return maxId;
    }

    static async getAll() {
        try {
            console.log(this.url); 
            const response = await fetch(this.url);
            const data = await response.json();
            return data;
        } catch (e) {
            alert(e);
        }
    }

    static async get(id) {
        try {
            const response = await fetch(`${this.url}/${id}`);
            const data = await response.json();
            return data;
        } catch(e) {
            alert(e);
        }
    }

    static async create(data) {
        try {
            data.id = await this.getLatestId() + 1;
            let response = await fetch(this.url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            return response.ok;
        } catch (e) {
            alert(e);
        }
    } 

    static async update(id, data) {
        try {
            const response = await fetch(`${this.url}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            return response.ok;
        } catch (e) {
            alert(e);
        }
    }

    static async delete(id) {
        try {
            const response = await fetch(`${this.url}/${id}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (e) {
            alert(e);
        }
    }
}