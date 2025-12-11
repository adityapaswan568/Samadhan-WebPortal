import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();

        setNotifications(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration) => {
        return addNotification(message, 'success', duration);
    }, [addNotification]);

    const showError = useCallback((message, duration) => {
        return addNotification(message, 'error', duration);
    }, [addNotification]);

    const showWarning = useCallback((message, duration) => {
        return addNotification(message, 'warning', duration);
    }, [addNotification]);

    const showInfo = useCallback((message, duration) => {
        return addNotification(message, 'info', duration);
    }, [addNotification]);

    const value = {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer notifications={notifications} onClose={removeNotification} />
        </NotificationContext.Provider>
    );
};

const NotificationContainer = ({ notifications, onClose }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
            {notifications.map(notification => (
                <Notification
                    key={notification.id}
                    notification={notification}
                    onClose={() => onClose(notification.id)}
                />
            ))}
        </div>
    );
};

const Notification = ({ notification, onClose }) => {
    const { type, message } = notification;

    const styles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: <CheckCircle className="h-5 w-5 text-green-600" />
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: <AlertCircle className="h-5 w-5 text-red-600" />
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: <Info className="h-5 w-5 text-blue-600" />
        }
    };

    const style = styles[type] || styles.info;

    return (
        <div
            className={`${style.bg} ${style.border} border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md pointer-events-auto animate-slide-in-right`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {style.icon}
                </div>
                <div className={`flex-1 ${style.text}`}>
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className={`flex-shrink-0 ${style.text} hover:opacity-70 transition-opacity`}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default NotificationProvider;
