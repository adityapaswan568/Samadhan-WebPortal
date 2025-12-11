/**
 * Form Validation Utilities
 * Provides comprehensive validation for user inputs
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }

    if (email.length > 254) {
        return { isValid: false, error: 'Email is too long' };
    }

    return { isValid: true, error: '' };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, error: string, strength: number (0-4) }
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, error: 'Password is required', strength: 0 };
    }

    const minLength = 8;
    let strength = 0;
    const errors = [];

    // Check minimum length
    if (password.length < minLength) {
        errors.push(`at least ${minLength} characters`);
    } else {
        strength++;
    }

    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
        errors.push('one uppercase letter');
    } else {
        strength++;
    }

    // Check for lowercase
    if (!/[a-z]/.test(password)) {
        errors.push('one lowercase letter');
    } else {
        strength++;
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
        errors.push('one number');
    } else {
        strength++;
    }

    // Bonus: Special character (doesn't affect validity, just strength)
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength++;
    }

    const isValid = errors.length === 0;
    const error = errors.length > 0
        ? `Password must contain ${errors.join(', ')}`
        : '';

    return { isValid, error, strength };
};

/**
 * Get password strength label and color
 * @param {number} strength - Strength score (0-4)
 * @returns {Object} - { label: string, color: string }
 */
export const getPasswordStrength = (strength) => {
    switch (strength) {
        case 0:
        case 1:
            return { label: 'Weak', color: 'red' };
        case 2:
            return { label: 'Fair', color: 'orange' };
        case 3:
            return { label: 'Good', color: 'yellow' };
        case 4:
        case 5:
            return { label: 'Strong', color: 'green' };
        default:
            return { label: 'Weak', color: 'red' };
    }
};

/**
 * Validate name (first name, last name, full name)
 * @param {string} name - Name to validate
 * @param {number} minLength - Minimum length (default: 2)
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateName = (name, minLength = 2) => {
    if (!name) {
        return { isValid: false, error: 'Name is required' };
    }

    if (name.length < minLength) {
        return { isValid: false, error: `Name must be at least ${minLength} characters` };
    }

    if (name.length > 100) {
        return { isValid: false, error: 'Name is too long' };
    }

    // Allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s\-']+$/.test(name)) {
        return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    return { isValid: true, error: '' };
};

/**
 * Validate text field with length constraints
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error messages
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateText = (text, minLength, maxLength, fieldName = 'Field') => {
    if (!text) {
        return { isValid: false, error: `${fieldName} is required` };
    }

    const trimmed = text.trim();

    if (trimmed.length < minLength) {
        return {
            isValid: false,
            error: `${fieldName} must be at least ${minLength} characters`
        };
    }

    if (trimmed.length > maxLength) {
        return {
            isValid: false,
            error: `${fieldName} must not exceed ${maxLength} characters`
        };
    }

    return { isValid: true, error: '' };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validatePhone = (phone) => {
    if (!phone) {
        return { isValid: false, error: 'Phone number is required' };
    }

    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length < 10) {
        return { isValid: false, error: 'Phone number must be at least 10 digits' };
    }

    if (digitsOnly.length > 15) {
        return { isValid: false, error: 'Phone number is too long' };
    }

    return { isValid: true, error: '' };
};

/**
 * Validate file upload
 * @param {File} file - File object
 * @param {Object} options - Validation options
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateFile = (file, options = {}) => {
    const {
        maxSize = 800 * 1024, // 800KB default
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        allowedExtensions = ['jpg', 'jpeg', 'png', 'gif']
    } = options;

    if (!file) {
        return { isValid: false, error: 'No file selected' };
    }

    // Check file size
    if (file.size > maxSize) {
        const maxSizeKB = Math.floor(maxSize / 1024);
        return {
            isValid: false,
            error: `File size must not exceed ${maxSizeKB}KB`
        };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: `File type must be one of: ${allowedExtensions.join(', ')}`
        };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext =>
        fileName.endsWith(`.${ext}`)
    );

    if (!hasValidExtension) {
        return {
            isValid: false,
            error: `File extension must be one of: ${allowedExtensions.join(', ')}`
        };
    }

    return { isValid: true, error: '' };
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateURL = (url) => {
    if (!url) {
        return { isValid: false, error: 'URL is required' };
    }

    try {
        const urlObj = new URL(url);

        // Only allow http and https protocols
        if (!['http:', 'https:', 'data:'].includes(urlObj.protocol)) {
            return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
        }

        return { isValid: true, error: '' };
    } catch (e) {
        return { isValid: false, error: 'Please enter a valid URL' };
    }
};

/**
 * Validate that two fields match (e.g., password confirmation)
 * @param {string} value1 - First value
 * @param {string} value2 - Second value
 * @param {string} fieldName - Field name for error message
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateMatch = (value1, value2, fieldName = 'Fields') => {
    if (value1 !== value2) {
        return { isValid: false, error: `${fieldName} do not match` };
    }

    return { isValid: true, error: '' };
};

/**
 * Validate required field
 * @param {any} value - Value to check
 * @param {string} fieldName - Field name for error message
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateRequired = (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return { isValid: false, error: `${fieldName} is required` };
    }

    return { isValid: true, error: '' };
};

/**
 * Validate form object
 * Runs multiple validations and collects all errors
 * @param {Object} formData - Form data object
 * @param {Object} validationRules - Validation rules { field: validationFunction }
 * @returns {Object} - { isValid: boolean, errors: { field: error } }
 */
export const validateForm = (formData, validationRules) => {
    const errors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
        const validator = validationRules[field];
        const result = validator(formData[field]);

        if (!result.isValid) {
            errors[field] = result.error;
            isValid = false;
        }
    });

    return { isValid, errors };
};

export default {
    validateEmail,
    validatePassword,
    getPasswordStrength,
    validateName,
    validateText,
    validatePhone,
    validateFile,
    validateURL,
    validateMatch,
    validateRequired,
    validateForm
};
