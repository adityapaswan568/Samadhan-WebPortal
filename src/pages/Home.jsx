import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import {
    Shield, Target, Users, TrendingUp, BarChart3, MapPin,
    Building2, ClipboardCheck, Bell, ArrowRight, CheckCircle2,
    AlertTriangle, Activity, Smartphone, ChevronRight
} from "lucide-react";

const Home = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-200/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 animate-pulse-slow"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-200/20 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3 animate-pulse-slow"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
                    <div className="text-center max-w-5xl mx-auto">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-primary-100 text-primary-700 text-sm font-semibold mb-8 animate-fade-in shadow-sm">
                            <Shield className="h-4 w-4 mr-2" />
                            Official Government Initiative
                        </div>

                        <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight animate-slide-up">
                            Empowering Citizens,<br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 bg-size-200 animate-gradient">
                                Building Better Cities
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto animate-slide-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
                            Join the movement towards transparent governance. Report civic issues, track resolutions, and be the change your community needs.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-slate-700 bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section with Glass Cards */}
            <div className="py-12 -mt-24 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: "Issues Reported", value: "1,200+", color: "text-primary-600", icon: AlertTriangle },
                            { label: "Resolved Cases", value: "980+", color: "text-secondary-600", icon: CheckCircle2 },
                            { label: "Active Citizens", value: "5,000+", color: "text-accent-600", icon: Users }
                        ].map((stat, index) => (
                            <div key={index} className="glass-card p-8 rounded-2xl flex items-center justify-between group hover:border-primary-200">
                                <div>
                                    <div className={`text-4xl font-extrabold ${stat.color} mb-1`}>{stat.value}</div>
                                    <div className="text-slate-500 font-medium text-lg">{stat.label}</div>
                                </div>
                                <div className={`p-4 rounded-xl bg-slate-50 group-hover:bg-white transition-colors duration-300 shadow-inner`}>
                                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Samadhan Portal?</h2>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                            A complete ecosystem designed to bridge the gap between citizens and administration.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Instant Reporting",
                                icon: Smartphone,
                                desc: "Report issues on-the-go with location tagging and photo uploads.",
                                color: "bg-primary-50 text-primary-600"
                            },
                            {
                                title: "Real-time Tracking",
                                icon: Activity,
                                desc: "Monitor the status of your complaints with live updates.",
                                color: "bg-secondary-50 text-secondary-600"
                            },
                            {
                                title: "Smart Notifications",
                                icon: Bell,
                                desc: "Get alerted via SMS and Email at every stage of resolution.",
                                color: "bg-accent-50 text-accent-600"
                            },
                        ].map((feature, idx) => (
                            <div key={idx} className="group p-8 rounded-2xl border border-slate-100 bg-white hover:border-primary-100 hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 cursor-default">
                                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 rounded-3xl p-12 md:p-20 shadow-2xl relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to make a difference?</h2>
                            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
                                Join thousands of citizens who are actively contributing to better governance.
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-full text-primary-900 bg-white hover:bg-primary-50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                Join Samadhan Now
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
