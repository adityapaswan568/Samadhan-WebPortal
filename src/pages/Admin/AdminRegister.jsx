import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import Layout from "../../components/Layout";
import { Mail, Lock, User, Key, ArrowRight, Loader2, Shield, AlertTriangle } from "lucide-react";

const AdminRegister = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        accessCode: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        // Validate admin access code
        const adminCode = import.meta.env.VITE_ADMIN_ACCESS_CODE || "SAMADHAN_ADMIN_2025";
        if (formData.accessCode !== adminCode) {
            return setError("Invalid admin access code. Please contact the system administrator.");
        }

        setLoading(true);
        try {
            setError("");

            // Create Firebase auth user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            // Create admin user document in Firestore with admin role
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                fullName: formData.fullName,
                email: formData.email,
                role: 'admin', // ADMIN ROLE
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isActive: true,
                isAdmin: true
            });

            // Redirect to admin panel
            navigate("/admin");
        } catch (err) {
            setError("Failed to create admin account: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
                    {/* Left Side - Form */}
                    <div className="w-full md:w-1/2 p-8 md:p-12">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <Shield className="h-6 w-6 text-red-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900">Admin Registration</h2>
                            </div>
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-md mb-6">
                                <div className="flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-yellow-800 font-medium">Restricted Access</p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Admin registration requires a special access code. Contact the system administrator if you don't have one.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
                                        placeholder="Enter your full name"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
                                        placeholder="admin@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Access Code</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Key className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="accessCode"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all font-mono"
                                        placeholder="Enter admin access code"
                                        value={formData.accessCode}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Creating admin account...
                                    </>
                                ) : (
                                    <>
                                        Create Admin Account
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                Regular user?{' '}
                                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                    Create citizen account
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Info */}
                    <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-red-600 to-pink-600 p-12 text-white flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-pattern opacity-10"></div>
                        <div className="relative z-10 h-full flex flex-col justify-center">
                            <h3 className="text-3xl font-bold mb-4">Administrator Access</h3>
                            <p className="text-red-100 text-lg mb-8">
                                Manage citizen complaints, assign tasks to workers, and ensure efficient resolution of public grievances.
                            </p>
                            <div className="space-y-4">
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                    <div className="text-xl font-bold">Full Control</div>
                                    <div className="text-red-100 text-sm">Manage all issues</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                    <div className="text-xl font-bold">Assign Workers</div>
                                    <div className="text-red-100 text-sm">Delegate tasks efficiently</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                    <div className="text-xl font-bold">Track Progress</div>
                                    <div className="text-red-100 text-sm">Monitor resolutions</div>
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

export default AdminRegister;
