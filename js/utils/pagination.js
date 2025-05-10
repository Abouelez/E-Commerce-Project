/**
 * Pagination utility class
 * Handles pagination for arrays of items
 */
export default class Pagination {
  /**
   * Create a new pagination instance
   * @param {Array} items - The array of items to paginate
   * @param {Number} itemsPerPage - Number of items per page
   * @param {Number} initialPage - Initial page to display (1-based)
   */
  constructor(items = [], itemsPerPage = 10, initialPage = 1) {
    this.items = items;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = initialPage;
    this.totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    
    // Ensure current page is valid
    if (this.currentPage < 1) {
      this.currentPage = 1;
    } else if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }
  
  /**
   * Get items for the current page
   * @returns {Array} Items for the current page
   */
  getCurrentPageItems() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.items.length);
    return this.items.slice(startIndex, endIndex);
  }
  
  /**
   * Set the current page
   * @param {Number} pageNumber - Page number to set (1-based)
   * @returns {Array} Items for the new current page
   */
  setPage(pageNumber) {
    if (pageNumber < 1) {
      this.currentPage = 1;
    } else if (pageNumber > this.totalPages) {
      this.currentPage = this.totalPages;
    } else {
      this.currentPage = pageNumber;
    }
    
    return this.getCurrentPageItems();
  }
  
  /**
   * Get pagination information
   * @returns {Object} Object containing pagination info
   */
  getPageInfo() {
    return {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      itemsPerPage: this.itemsPerPage,
      totalItems: this.items.length,
      hasNextPage: this.currentPage < this.totalPages,
      hasPrevPage: this.currentPage > 1
    };
  }
  
  /**
   * Update the items array
   * @param {Array} newItems - New array of items
   */
  updateItems(newItems) {
    this.items = newItems;
    this.totalPages = Math.max(1, Math.ceil(newItems.length / this.itemsPerPage));
    
    // Ensure current page is still valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    return this.getCurrentPageItems();
  }
  
  /**
   * Go to next page
   * @returns {Array} Items for the next page
   */
  nextPage() {
    return this.setPage(this.currentPage + 1);
  }
  
  /**
   * Go to previous page
   * @returns {Array} Items for the previous page
   */
  prevPage() {
    return this.setPage(this.currentPage - 1);
  }
}
