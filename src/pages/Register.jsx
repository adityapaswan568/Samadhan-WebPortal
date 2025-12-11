import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { sanitizeText, sanitizeEmail } from "../utils/sanitize";
import { validateEmail, validatePassword, validateName, validateMatch, getPasswordStrength } from "../utils/validation";
import Layout from "../components/Layout";
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle, XCircle } from "lucide-react";

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    // Real-time validation
    const validateField = (name, value) => {
        let result = { isValid: true, error: "" };

        switch (name) {
            case "fullName":
                result = validateName(value);
                break;
            case "email":
                result = validateEmail(value);
                break;
            case "password":
                result = validatePassword(value);
                break;
            case "confirmPassword":
                result = validateMatch(formData.password, value, "Passwords");
                break;
            default:
                break;
        }

        return result;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validate on change if field has been touched
        if (touched[name]) {
            const validation = validateField(name, value);
            setErrors({ ...errors, [name]: validation.error });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });

        // Validate on blur
        const validation = validateField(name, value);
        setErrors({ ...errors, [name]: validation.error });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const validation = validateField(key, formData[key]);
            if (!validation.isValid) {
                newErrors[key] = validation.error;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
            showError("Please fix the validation errors");
            return;
        }

        setLoading(true);
        try {
            // Sanitize inputs
            const sanitizedName = sanitizeText(formData.fullName);
            const sanitizedEmail = sanitizeEmail(formData.email);

            await signup(sanitizedEmail, formData.password, sanitizedName);
            showSuccess("Account created successfully! Redirecting...");
            setTimeout(() => navigate("/"), 1000);
        } catch (err) {
            showError("Failed to create account: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Get password strength for visual feedback
    const passwordStrength = formData.password ? validatePassword(formData.password).strength : 0;
    const strengthInfo = getPasswordStrength(passwordStrength);

    const getFieldClasses = (fieldName) => {
        const baseClasses = "block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-all";

        if (!touched[fieldName]) {
            return `${baseClasses} border-slate-300 focus:ring-blue-500 focus:border-blue-500`;
        }

        if (errors[fieldName]) {
            return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500`;
        }

        return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500`;
    };

    return (
        <Layout>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
                    {/* Left Side - Form */}
                    <div className="w-full md:w-1/2 p-8 md:p-12">
                        <div className="text-left mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
                            <p className="text-slate-500">Join the community and start making a difference.</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Full Name */}
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
                                        className={getFieldClasses("fullName")}
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {touched.fullName && !errors.fullName && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                    {touched.fullName && errors.fullName && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        </div>
                                    )}
                                </div>
                                {touched.fullName && errors.fullName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Email */}
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
                                        className={getFieldClasses("email")}
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {touched.email && !errors.email && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                    {touched.email && errors.email && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        </div>
                                    )}
                                </div>
                                {touched.email && errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
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
                                        className={getFieldClasses("password")}
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </div>
                                {/* Password Strength Meter */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-300 ${strengthInfo.color === 'red' ? 'bg-red-500' :
                                                            strengthInfo.color === 'orange' ? 'bg-orange-500' :
                                                                strengthInfo.color === 'yellow' ? 'bg-yellow-500' :
                                                                    'bg-green-500'
                                                        }`}
                                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-medium ${strengthInfo.color === 'red' ? 'text-red-600' :
                                                    strengthInfo.color === 'orange' ? 'text-orange-600' :
                                                        strengthInfo.color === 'yellow' ? 'text-yellow-600' :
                                                            'text-green-600'
                                                }`}>
                                                {strengthInfo.label}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {touched.password && errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
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
                                        className={getFieldClasses("confirmPassword")}
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                    {touched.confirmPassword && errors.confirmPassword && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        </div>
                                    )}
                                </div>
                                {touched.confirmPassword && errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
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
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Sign Up
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                    Sign in instead
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Image/Decoration */}
                    <div className="hidden md:block md:w-1/2 bg-gradient-to-bl from-blue-600 to-cyan-600 p-12 text-white flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-pattern opacity-10"></div>
                        <div className="relative z-10 h-full flex flex-col justify-center items-end text-right">
                            <h3 className="text-3xl font-bold mb-4">Your Voice Matters</h3>
                            <p className="text-blue-100 text-lg mb-8 max-w-md">
                                Sign up today to start reporting issues and tracking their resolution. Together we can make our city cleaner and safer.
                            </p>

                            <div className="space-y-4 w-full max-w-xs">
                                <div className="flex items-center justify-end gap-3">
                                    <span className="text-blue-100 font-medium">Transparent Process</span>
                                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <span className="text-blue-100 font-medium">Direct Impact</span>
                                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
                        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl"></div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Register;
