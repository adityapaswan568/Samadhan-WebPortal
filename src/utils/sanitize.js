/**
 * Input Sanitization Utilities
 * Prevents XSS attacks and ensures data integrity
 */

/**
 * Escape HTML entities to prevent XSS attacks
 * @param {string} text - Raw text input
 * @returns {string} - Sanitized text with HTML entities escaped
 */
export const escapeHTML = (text) => {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Remove all HTML tags from input
 * @param {string} input - Input that may contain HTML
 * @returns {string} - Clean text without HTML tags
 */
export const stripHTML = (input) => {
    if (!input) return '';

    const div = document.createElement('div');
    div.innerHTML = input;
    return div.textContent || div.innerText || '';
};

/**
 * Sanitize text input (for titles, names, etc.)
 * Removes scripts, HTML tags, and dangerous characters
 * @param {string} input - User input text
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (input) => {
    if (!input) return '';

    // First strip any HTML tags
    let sanitized = stripHTML(input);

    // Remove potential script injection patterns
    sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/&lt;script/gi, '')
        .replace(/&lt;\/script/gi, '');

    // Trim whitespace
    return sanitized.trim();
};

/**
 * Sanitize email input
 * @param {string} email - Email address
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
    if (!email) return '';

    // Convert to lowercase and trim
    let sanitized = email.toLowerCase().trim();

    // Remove any HTML or scripts
    sanitized = stripHTML(sanitized);

    // Only allow valid email characters
    sanitized = sanitized.replace(/[^a-z0-9@._+-]/g, '');

    return sanitized;
};

/**
 * Sanitize textarea/description input
 * Allows some basic formatting but removes dangerous content
 * @param {string} input - Textarea content
 * @returns {string} - Sanitized content
 */
export const sanitizeDescription = (input) => {
    if (!input) return '';

    // Strip HTML but preserve line breaks
    let sanitized = stripHTML(input);

    // Remove script patterns
    sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');

    return sanitized.trim();
};

/**
 * Sanitize URL input
 * @param {string} url - URL string
 * @returns {string} - Sanitized URL
 */
export const sanitizeURL = (url) => {
    if (!url) return '';

    // Only allow http, https, and data URLs (for base64 images)
    const allowedProtocols = ['http://', 'https://', 'data:'];
    const hasAllowedProtocol = allowedProtocols.some(protocol =>
        url.toLowerCase().startsWith(protocol)
    );

    if (!hasAllowedProtocol) {
        return '';
    }

    // Remove javascript: and other dangerous protocols
    let sanitized = url.replace(/javascript:/gi, '');

    return sanitized.trim();
};

/**
 * Sanitize phone number input
 * @param {string} phone - Phone number
 * @returns {string} - Sanitized phone number
 */
export const sanitizePhone = (phone) => {
    if (!phone) return '';

    // Only keep numbers, spaces, hyphens, parentheses, and plus sign
    return phone.replace(/[^0-9\s\-\(\)\+]/g, '').trim();
};

/**
 * Sanitize file name
 * @param {string} fileName - Original file name
 * @returns {string} - Safe file name
 */
export const sanitizeFileName = (fileName) => {
    if (!fileName) return '';

    // Remove path traversal attempts
    let sanitized = fileName.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');

    // Remove special characters except dots, dashes, and underscores
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

    return sanitized;
};

/**
 * Sanitize an object's string properties
 * Useful for sanitizing form data objects
 * @param {Object} obj - Object with string properties
 * @param {Array<string>} fields - Field names to sanitize
 * @returns {Object} - Object with sanitized fields
 */
export const sanitizeObject = (obj, fields) => {
    if (!obj) return {};

    const sanitized = { ...obj };

    fields.forEach(field => {
        if (sanitized[field] && typeof sanitized[field] === 'string') {
            sanitized[field] = sanitizeText(sanitized[field]);
        }
    });

    return sanitized;
};

/**
 * Deep sanitize for display
 * Use this before rendering user content in the DOM
 * @param {any} value - Value to sanitize
 * @returns {any} - Sanitized value
 */
export const sanitizeForDisplay = (value) => {
    if (!value) return value;

    if (typeof value === 'string') {
        return escapeHTML(value);
    }

    if (Array.isArray(value)) {
        return value.map(sanitizeForDisplay);
    }

    if (typeof value === 'object') {
        const sanitized = {};
        Object.keys(value).forEach(key => {
            sanitized[key] = sanitizeForDisplay(value[key]);
        });
        return sanitized;
    }

    return value;
};

export default {
    escapeHTML,
    stripHTML,
    sanitizeText,
    sanitizeEmail,
    sanitizeDescription,
    sanitizeURL,
    sanitizePhone,
    sanitizeFileName,
    sanitizeObject,
    sanitizeForDisplay
};
