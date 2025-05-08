// Form validation utility functions
export const formValidation = {
    /**
     * Clear all error messages and error states from form fields
     */
    clearErrors: () => {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
    },

    /**
     * Show error message for a specific field
     * @param {string} fieldId - The ID of the input field
     * @param {string} message - The error message to display
     */
    showError: (fieldId, message) => {
        const input = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (input && errorElement) {
            input.classList.add('error');
            errorElement.textContent = message;
        }
    },

    /**
     * Show multiple errors for different fields
     * @param {Object} errors - Object containing field IDs and their error messages
     */
    showErrors: (errors) => {
        Object.entries(errors).forEach(([fieldId, message]) => {
            formValidation.showError(fieldId, message);
        });
    },

    /**
     * Check if a field is empty
     * @param {string} value - The field value to check
     * @returns {boolean} - True if empty, false otherwise
     */
    isEmpty: (value) => {
        return !value || value.trim() === '';
    },

    /**
     * Validate required fields
     * @param {Object} fields - Object containing field IDs and their values
     * @returns {Object} - Object containing any validation errors
     */
    validateRequired: (fields) => {
        const errors = {};
        Object.entries(fields).forEach(([fieldId, value]) => {
            if (formValidation.isEmpty(value)) {
                errors[fieldId] = `${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)} is required`;
            }
        });
        return errors;
    }
}; 