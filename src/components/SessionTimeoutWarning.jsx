import { useAuth } from "../context/AuthContext";
import { X, AlertTriangle } from "lucide-react";

const SessionTimeoutWarning = () => {
    const { showTimeoutWarning, timeoutSeconds, extendSession } = useAuth();

    if (!showTimeoutWarning) return null;

    const minutes = Math.floor(timeoutSeconds / 60);
    const seconds = timeoutSeconds % 60;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in-right">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-yellow-100 p-3 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Session Timeout Warning</h3>
                </div>

                <p className="text-slate-600 mb-6">
                    Your session will expire in <span className="font-bold text-yellow-600">{minutes}:{seconds.toString().padStart(2, '0')}</span> due to inactivity.
                </p>

                <p className="text-sm text-slate-500 mb-6">
                    Click "Stay Logged In" to continue your session, or you will be automatically logged out.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={extendSession}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Stay Logged In
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-slate-400">
                        Sessions automatically expire after 30 minutes of inactivity for your security.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeoutWarning;
