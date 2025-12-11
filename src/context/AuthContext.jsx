import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import {
    activityTracker,
    SessionValidator,
    SessionStorage,
    getDeviceFingerprint,
    compareFingerprints
} from "../utils/sessionSecurity";
import SessionTimeoutWarning from "../components/SessionTimeoutWarning";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [timeoutSeconds, setTimeoutSeconds] = useState(0);

    // Logout handler
    const handleLogout = useCallback(async (reason = 'user_action') => {
        console.log(`Logging out: ${reason}`);

        // Stop tracking
        activityTracker.stopTracking();

        // Clear session data
        SessionStorage.clearSession();

        // Firebase logout
        await signOut(auth);

        setUser(null);
        setShowTimeoutWarning(false);
    }, []);

    // Handle session timeout
    const handleSessionTimeout = useCallback(() => {
        console.warn('Session timed out due to inactivity');
        handleLogout('inactivity_timeout');

        // Show alert to user
        alert('Your session has expired due to inactivity. Please log in again.');
    }, [handleLogout]);

    // Handle timeout warning
    const handleTimeoutWarning = useCallback(() => {
        setShowTimeoutWarning(true);
        setTimeoutSeconds(5 * 60); // 5 minutes

        // Countdown every second
        const countdownInterval = setInterval(() => {
            setTimeoutSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Handle invalid session
    const handleInvalidSession = useCallback(() => {
        console.error('Session validation failed - forcing logout');
        handleLogout('invalid_session');
        alert('Your session is no longer valid. Please log in again.');
    }, [handleLogout]);

    // Stay logged in (extend session)
    const extendSession = useCallback(() => {
        setShowTimeoutWarning(false);
        activityTracker.updateActivity();
    }, []);

    useEffect(() => {
        const sessionValidator = new SessionValidator(auth);

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // Fetch user role from Firestore
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));

                    if (userDoc.exists()) {
                        const userData = userDoc.data();

                        // Get device fingerprint
                        const currentFingerprint = getDeviceFingerprint();

                        // Check if this is a new device
                        const storedFingerprint = SessionStorage.getSessionData('deviceFingerprint');

                        if (storedFingerprint && !compareFingerprints(storedFingerprint, currentFingerprint)) {
                            // Different device detected - force logout for security
                            console.warn('Session used from different device - logging out');
                            await handleLogout('device_mismatch');
                            alert('Session detected from a different device. For security, you have been logged out.');
                            return;
                        }

                        // Store current device fingerprint
                        SessionStorage.setSessionData('deviceFingerprint', currentFingerprint);

                        // Store last login time
                        SessionStorage.setSessionData('loginTime', Date.now());

                        // Update last login in Firestore
                        await updateDoc(doc(db, "users", currentUser.uid), {
                            lastLogin: new Date().toISOString(),
                            lastLoginDevice: {
                                userAgent: currentFingerprint.userAgent,
                                timezone: currentFingerprint.timezone
                            }
                        }).catch(err => console.error('Failed to update last login:', err));

                        setUser({ ...currentUser, ...userData });

                        // Start activity tracking
                        activityTracker.startTracking(
                            handleSessionTimeout,
                            handleTimeoutWarning
                        );

                        // Start session validation
                        sessionValidator.startValidation(handleInvalidSession);

                    } else {
                        // Fallback if firestore doc doesn't exist yet
                        setUser(currentUser);
                    }
                } catch (error) {
                    console.error('Error during authentication:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
                activityTracker.stopTracking();
                sessionValidator.stopValidation();
            }
            setLoading(false);
        });

        return () => {
            unsubscribe();
            activityTracker.stopTracking();
            sessionValidator.stopValidation();
        };
    }, [handleSessionTimeout, handleTimeoutWarning, handleInvalidSession, handleLogout]);

    const signup = async (email, password, fullName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // SECURITY: Always set role as 'citizen' - no client input
        // Only admins can change roles through admin panel
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            fullName,
            email,
            role: 'citizen', // HARDCODED - prevents privilege escalation
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true
        });

        return user;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return handleLogout('user_action');
    };

    const value = {
        user,
        signup,
        login,
        logout,
        loading,
        showTimeoutWarning,
        timeoutSeconds,
        extendSession
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
            <SessionTimeoutWarning />
        </AuthContext.Provider>
    );
};
