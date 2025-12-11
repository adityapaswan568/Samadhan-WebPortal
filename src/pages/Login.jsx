import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { sanitizeEmail } from "../utils/sanitize";
import { validateEmail } from "../utils/validation";
import Layout from "../components/Layout";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
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
            await login(sanitizedEmail, password);

            showSuccess("Login successful!");

            // Redirect based on role
            // Wait a bit for the auth context to update
            setTimeout(() => {
                const userRole = user?.role;
                if (userRole === 'admin') {
                    navigate("/admin");
                } else if (userRole === 'worker') {
                    navigate("/worker");
                } else {
                    navigate("/dashboard");
                }
            }, 500);
        } catch (err) {
            let errorMessage = "Failed to log in";

            if (err.code === "auth/user-not-found") {
                errorMessage = "No account found with this email";
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
                    {/* Left Side - Form */}
                    <div className="w-full md:w-1/2 p-8 md:p-12">
                        <div className="text-left mb-10">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                            <p className="text-slate-500">Please enter your details to sign in.</p>
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-all ${errors.email
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                                            }`}
                                        placeholder="you@example.com"
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
                                            : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
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
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center space-y-2">
                            <p className="text-sm text-slate-600">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                    Create a citizen account
                                </Link>
                            </p>
                            <p className="text-sm text-slate-600">
                                Administrator?{' '}
                                <Link to="/admin/login" className="font-medium text-red-600 hover:text-red-500 hover:underline">
                                    Admin login
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Image/Decoration */}
                    <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 p-12 text-white flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-pattern opacity-10"></div>
                        <div className="relative z-10 h-full flex flex-col justify-center">
                            <h3 className="text-3xl font-bold mb-4">Building a Better Community Together</h3>
                            <p className="text-blue-100 text-lg mb-8">
                                Join thousands of citizens who are actively contributing to improve our city's infrastructure and services.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                    <div className="text-2xl font-bold">Fast</div>
                                    <div className="text-blue-100 text-sm">Resolution</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                    <div className="text-2xl font-bold">Easy</div>
                                    <div className="text-blue-100 text-sm">Reporting</div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl"></div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Login;
