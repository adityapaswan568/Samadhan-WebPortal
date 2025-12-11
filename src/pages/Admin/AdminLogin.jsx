import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { sanitizeEmail } from "../../utils/sanitize";
import { validateEmail } from "../../utils/validation";
import Layout from "../../components/Layout";
import { Mail, Lock, ArrowRight, Loader2, Shield, AlertTriangle } from "lucide-react";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate inputs
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            setErrors({ email: emailValidation.error });
            showError(emailValidation.error);
            return;
        }

        if (!password) {
            setErrors({ password: "Password is required" });
            showError("Password is required");
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const sanitizedEmail = sanitizeEmail(email);
            const userCredential = await login(sanitizedEmail, password);

            // Check if user has admin role
            const user = userCredential.user;

            // Wait a bit for Firestore to load user data
            setTimeout(async () => {
                // Get updated user data from context
                const { doc, getDoc } = await import("firebase/firestore");
                const { db } = await import("../../firebase/config");
                const userDoc = await getDoc(doc(db, "users", user.uid));

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    if (userData.role !== 'admin') {
                        showError("Access denied. Admin credentials required.");
                        setErrors({ general: "This login is for administrators only. Please use the regular login page." });
                        // Sign out the user
                        const { auth } = await import("../../firebase/config");
                        await auth.signOut();
                        setLoading(false);
                        return;
                    }

                    showSuccess("Welcome back, Administrator!");
                    navigate("/admin");
                } else {
                    showError("User data not found");
                    setLoading(false);
                }
            }, 500);

        } catch (err) {
            let errorMessage = "Failed to log in";

            if (err.code === "auth/user-not-found") {
                errorMessage = "No admin account found with this email";
            } else if (err.code === "auth/wrong-password") {
                errorMessage = "Incorrect password";
            } else if (err.code === "auth/invalid-email") {
                errorMessage = "Invalid email format";
            } else if (err.code === "auth/invalid-credential") {
                errorMessage = "Invalid email or password";
            } else if (err.message) {
                errorMessage = err.message;
            }

            showError(errorMessage);
            setErrors({ general: errorMessage });
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-red-50">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
                    {/* Left Side - Form */}
                    <div className="w-full md:w-1/2 p-8 md:p-12">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <Shield className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">Admin Login</h2>
                                    <p className="text-slate-500 text-sm mt-1">Administrator Portal Access</p>
                                </div>
                            </div>
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-md">
                                <div className="flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-yellow-800 font-medium">Restricted Access</p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            This portal is for administrators only. Unauthorized access attempts will be logged.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {errors.general && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{errors.general}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-all ${errors.email
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-slate-300 focus:ring-red-500 focus:border-red-500'
                                            }`}
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors({ ...errors, email: null });
                                        }}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-all ${errors.password
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-slate-300 focus:ring-red-500 focus:border-red-500'
                                            }`}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors({ ...errors, password: null });
                                        }}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign in as Admin
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 space-y-3">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">Other options</span>
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-sm text-slate-600">
                                    Not an admin?{' '}
                                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                        Regular login
                                    </Link>
                                </p>
                                <p className="text-sm text-slate-600">
                                    Need admin access?{' '}
                                    <Link to="/admin/register" className="font-medium text-red-600 hover:text-red-500 hover:underline">
                                        Register as admin
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Image/Decoration */}
                    <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-red-600 to-pink-600 p-12 text-white flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-pattern opacity-10"></div>
                        <div className="relative z-10 h-full flex flex-col justify-center">
                            <h3 className="text-3xl font-bold mb-4">Administrator Access</h3>
                            <p className="text-red-100 text-lg mb-8">
                                Manage the entire Samadhan Portal system with full administrative privileges.
                            </p>
                            <div className="space-y-4">
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                    <div className="text-xl font-bold">🛡️ Full Control</div>
                                    <div className="text-red-100 text-sm">Manage all complaints and users</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                    <div className="text-xl font-bold">👥 Assign Workers</div>
                                    <div className="text-red-100 text-sm">Delegate tasks efficiently</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                    <div className="text-xl font-bold">📊 Analytics</div>
                                    <div className="text-red-100 text-sm">Track system performance</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                    <div className="text-xl font-bold">🔐 Secure Access</div>
                                    <div className="text-red-100 text-sm">Role-based authentication</div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-pink-400/20 blur-3xl"></div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminLogin;
