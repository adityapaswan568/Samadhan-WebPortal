import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, X, Shield, User, LayoutDashboard, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import SessionTimeoutWarning from "./SessionTimeoutWarning";

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-primary-500 selection:text-white">
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center gap-2 group">
                                <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-2 rounded-xl shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
                                    Samadhan
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-1">
                            {user ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${isActive('/dashboard') ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'}`}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                    {user.role === 'citizen' && (
                                        <Link
                                            to="/report-issue"
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${isActive('/report-issue') ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'}`}
                                        >
                                            <FileText className="h-4 w-4" />
                                            Report Issue
                                        </Link>
                                    )}
                                    <div className="h-6 w-px bg-slate-200 mx-3"></div>
                                    <div className="flex items-center gap-3 pl-1">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-semibold text-slate-700">{user.fullName}</span>
                                            <span className="text-xs text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded-full">{user.role}</span>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all hover:rotate-90 duration-300"
                                            title="Logout"
                                        >
                                            <LogOut className="h-5 w-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-slate-600 hover:text-primary-600 px-5 py-2.5 rounded-full text-sm font-medium transition-colors hover:bg-slate-50">Login</Link>
                                    <Link to="/register" className="bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 transition-all duration-300 px-6 py-2.5 rounded-full text-sm font-medium">Register</Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 focus:outline-none transition-colors"
                            >
                                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="sm:hidden glass border-t border-slate-100/50 absolute w-full animate-slide-up origin-top">
                        <div className="pt-2 pb-3 space-y-1 px-4">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 py-3 border-b border-slate-100 mb-2">
                                        <div className="bg-primary-100 p-2 rounded-full">
                                            <User className="h-5 w-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{user.fullName}</div>
                                            <div className="text-sm text-slate-500 capitalize">{user.role}</div>
                                        </div>
                                    </div>
                                    <Link to="/dashboard" className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-primary-50 transition-colors">Dashboard</Link>
                                    {user.role === 'citizen' && (
                                        <Link to="/report-issue" className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-primary-50 transition-colors">Report Issue</Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left block px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 mt-2 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3 mt-4 mb-4">
                                    <Link to="/login" className="block w-full text-center px-4 py-3 border border-slate-200 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors">Login</Link>
                                    <Link to="/register" className="block w-full text-center px-4 py-3 border border-transparent rounded-xl text-base font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/25 transition-colors">Register</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <main className="flex-grow pt-16">
                {children}
            </main>

            <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                                <Shield className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-xl text-slate-800">Samadhan Portal</span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
                            Empowering citizens to report issues and track resolutions efficiently.
                        </p>
                    </div>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary-600 transition-colors">Contact</a>
                    </div>
                    <p className="text-slate-400 text-sm">
                        © {new Date().getFullYear()} Public Grievance System.
                    </p>
                </div>
            </footer>

            {/* Session Timeout Warning Modal */}
            <SessionTimeoutWarning />
        </div>
    );
};

export default Layout;
