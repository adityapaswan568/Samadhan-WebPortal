// Session Security Utilities
// Protects against session hijacking and unauthorized access

/**
 * Session timeout configuration
 */
export const SESSION_CONFIG = {
    // Auto-logout after 30 minutes of inactivity
    INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes

    // Warning before auto-logout (5 minutes before timeout)
    WARNING_BEFORE_TIMEOUT: 5 * 60 * 1000, // 5 minutes

    // Maximum session duration (24 hours)
    MAX_SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours

    // Session validation interval (check every 5 minutes)
    VALIDATION_INTERVAL: 5 * 60 * 1000 // 5 minutes
};

/**
 * Activity tracker for session timeout
 */
class ActivityTracker {
    constructor() {
        this.lastActivity = Date.now();
        this.sessionStart = Date.now();
        this.timeoutId = null;
        this.warningTimeoutId = null;
        this.onTimeout = null;
        this.onWarning = null;
    }

    /**
     * Update last activity timestamp
     */
    updateActivity() {
        this.lastActivity = Date.now();
        this.resetTimeouts();
    }

    /**
     * Start tracking user activity
     */
    startTracking(onTimeout, onWarning) {
        this.onTimeout = onTimeout;
        this.onWarning = onWarning;
        this.resetTimeouts();

        // Track user interactions
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            window.addEventListener(event, () => this.updateActivity(), { passive: true });
        });
    }

    /**
     * Reset timeout timers
     */
    resetTimeouts() {
        // Clear existing timers
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);

        // Set warning timer (5 minutes before logout)
        const warningTime = SESSION_CONFIG.INACTIVITY_TIMEOUT - SESSION_CONFIG.WARNING_BEFORE_TIMEOUT;
        this.warningTimeoutId = setTimeout(() => {
            if (this.onWarning) this.onWarning();
        }, warningTime);

        // Set logout timer
        this.timeoutId = setTimeout(() => {
            if (this.onTimeout) this.onTimeout();
        }, SESSION_CONFIG.INACTIVITY_TIMEOUT);
    }

    /**
     * Stop tracking
     */
    stopTracking() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
    }

    /**
     * Get time until logout (in seconds)
     */
    getTimeUntilLogout() {
        const elapsed = Date.now() - this.lastActivity;
        const remaining = SESSION_CONFIG.INACTIVITY_TIMEOUT - elapsed;
        return Math.max(0, Math.floor(remaining / 1000));
    }

    /**
     * Get session duration (in seconds)
     */
    getSessionDuration() {
        return Math.floor((Date.now() - this.sessionStart) / 1000);
    }
}

/**
 * Session validation - checks if session is still valid
 */
export class SessionValidator {
    constructor(auth) {
        this.auth = auth;
        this.validationIntervalId = null;
    }

    /**
     * Start periodic session validation
     */
    startValidation(onInvalid) {
        this.validationIntervalId = setInterval(async () => {
            const isValid = await this.validateSession();
            if (!isValid && onInvalid) {
                onInvalid();
            }
        }, SESSION_CONFIG.VALIDATION_INTERVAL);
    }

    /**
     * Validate current session
     */
    async validateSession() {
        try {
            const user = this.auth.currentUser;

            if (!user) {
                return false;
            }

            // Force token refresh to check validity
            await user.getIdToken(true);

            return true;
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    }

    /**
     * Stop validation
     */
    stopValidation() {
        if (this.validationIntervalId) {
            clearInterval(this.validationIntervalId);
        }
    }
}

/**
 * Secure session storage
 */
export const SessionStorage = {
    /**
     * Store session data securely
     */
    setSessionData(key, value) {
        try {
            // Use sessionStorage (cleared on tab close) instead of localStorage
            sessionStorage.setItem(key, JSON.stringify({
                value,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Failed to store session data:', error);
        }
    },

    /**
     * Get session data
     */
    getSessionData(key) {
        try {
            const item = sessionStorage.getItem(key);
            if (!item) return null;

            const { value, timestamp } = JSON.parse(item);

            // Check if data is expired (older than MAX_SESSION_DURATION)
            if (Date.now() - timestamp > SESSION_CONFIG.MAX_SESSION_DURATION) {
                sessionStorage.removeItem(key);
                return null;
            }

            return value;
        } catch (error) {
            console.error('Failed to get session data:', error);
            return null;
        }
    },

    /**
     * Clear all session data
     */
    clearSession() {
        sessionStorage.clear();
    }
};

/**
 * Browser fingerprinting (basic)
 * Helps detect if session is being used from different device
 */
export const getDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);

    return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvasFingerprint: canvas.toDataURL().substring(0, 50) // First 50 chars
    };
};

/**
 * Compare device fingerprints
 */
export const compareFingerprints = (fp1, fp2) => {
    if (!fp1 || !fp2) return false;

    // Must match on critical fields
    return fp1.userAgent === fp2.userAgent &&
        fp1.platform === fp2.platform &&
        fp1.timezone === fp2.timezone;
};

// Export singleton instance
export const activityTracker = new ActivityTracker();

export default {
    SESSION_CONFIG,
    ActivityTracker,
    SessionValidator,
    SessionStorage,
    activityTracker,
    getDeviceFingerprint,
    compareFingerprints
};
