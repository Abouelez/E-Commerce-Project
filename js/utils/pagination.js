export default class Pagination {
    constructor(items, itemsPerPage = 10) {
        this.items = items;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.totalPages = Math.ceil(items.length / itemsPerPage);
    }

    getCurrentPageItems() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.items.slice(start, end);
    }

    setPage(page) {
        if (page < 1) page = 1;
        if (page > this.totalPages) page = this.totalPages;
        this.currentPage = page;
        return this.getCurrentPageItems();
    }

    getPageInfo() {
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(startItem + this.itemsPerPage - 1, this.items.length);
        return {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalItems: this.items.length,
            startItem: this.items.length === 0 ? 0 : startItem,
            endItem: endItem
        };
    }

    search(query, searchFields) {
        if (!query) {
            return this.items;
        }
        
        query = query.toLowerCase();
        return this.items.filter(item => {
            return searchFields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(query);
            });
        });
    }
} 