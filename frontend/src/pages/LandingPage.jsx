import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCalendarCheck, 
  FaBell, 
  FaTools, 
  FaChartLine, 
  FaHeadset 
} from 'react-icons/fa';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pt-16">
            {/* Header / Navbar */}
            <header className="w-full bg-white shadow-sm fixed top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="text-2xl font-extrabold text-blue-600 tracking-tight">
                        SmartCampus<span className="text-orange-500">Hub</span>
                    </div>
                    <nav className="hidden md:flex space-x-8 items-center font-medium text-slate-600">
                        <a href="#products" className="hover:text-blue-600 transition-colors">Products</a>
                        <a href="#resources" className="hover:text-blue-600 transition-colors">Resources</a>
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full shadow-md shadow-blue-200 transition-all transform hover:-translate-y-0.5 font-semibold"
                        >
                            Login
                        </button>
                    </nav>
                    {/* Mobile Menu Button (simplified for aesthetic) */}
                    <button className="md:hidden text-slate-600 focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main id="products" className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 pt-12 pb-20 w-full overflow-hidden">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-8 min-h-[70vh]">
                    {/* Left Content */}
                    <div className="flex-1 flex flex-col items-center text-center lg:items-start lg:text-left space-y-6 lg:pr-12">
                        <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-2 border border-orange-200 shadow-sm">
                            Next-Gen Campus Experience
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                            Modern student <span className="text-blue-600 relative inline-block">success tools<svg className="absolute -bottom-2 left-0 w-full text-blue-300 -z-10" viewBox="0 0 200 20" fill="none"><path d="M0 10 Q 50 20 100 10 T 200 10" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none"/></svg></span>,<br/>powered by AI.
                        </h1>
                        <p className="text-xl text-slate-500 max-w-2xl leading-relaxed mt-4 mb-8">
                            Unify your academics, facilities, bookings, and notifications into one intelligent ecosystem. Elevate your university journey today.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start w-full">
                            <button 
                                onClick={() => navigate('/login')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl shadow-blue-200/80 transition-all transform hover:-translate-y-1"
                            >
                                Get Started Free
                            </button>
                            <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full text-lg font-bold shadow-sm transition-all">
                                Request Demo
                            </button>
                        </div>
                        
                        {/* Decorative trust indicators */}
                        <div className="pt-8 w-full">
                            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Trusted by innovative universities</p>
                            <div className="flex gap-6 items-center opacity-40 grayscale">
                                <div className="h-8 w-24 bg-slate-300 rounded"></div>
                                <div className="h-8 w-24 bg-slate-300 rounded"></div>
                                <div className="h-8 w-24 bg-slate-300 rounded"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Illustration */}
                    <div className="flex-1 w-full relative drop-shadow-2xl hero-illustration-container flex justify-center lg:justify-end">
                        {/* Decorative background blurs for premium feel */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute top-1/4 right-0 w-[80%] h-[80%] bg-orange-100/50 rounded-full blur-3xl -z-10"></div>
                        <img 
                            src="/hero_illustration.png" 
                            alt="Student interacting with Smart Campus Operations Hub" 
                            className="w-full max-w-2xl lg:max-w-none h-auto object-contain z-10 animate-[float_6s_ease-in-out_infinite]"
                            style={{ maxHeight: '600px' }}
                        />
                    </div>
                </div>
            </main>

            {/* Sub-hero Section */}
            <section id="resources" className="bg-white py-24 border-t border-slate-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
                <div className="max-w-5xl mx-auto px-6 text-center space-y-6 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Smart Campus Hub <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">supercharges</span> your university life.
                    </h2>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto">
                        Experience seamless coordination across campus facilities, schedules, and critical updates in real-time.
                    </p>
                </div>
            </section>

            {/* Footer Section with Features */}
            <footer className="bg-slate-900 text-slate-300 py-20 mt-auto border-t-[8px] border-blue-600">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    
                    {/* Features (takes up 4 columns on large screens) */}
                    <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="flex flex-col items-start gap-4">
                            <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl shadow-lg border border-blue-500/30">
                                <FaCalendarCheck />
                            </div>
                            <h4 className="text-white font-bold text-lg">Smart Bookings</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">Reserve halls, labs, and equipment instantly with real-time availability sync.</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="flex flex-col items-start gap-4">
                            <div className="w-14 h-14 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-2xl shadow-lg border border-orange-500/30">
                                <FaBell />
                            </div>
                            <h4 className="text-white font-bold text-lg">Instant Alerts</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">Never miss an update with targeted campus-wide and departmental notifications.</p>
                        </div>
                        {/* Feature 3 */}
                        <div className="flex flex-col items-start gap-4">
                            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl shadow-lg border border-emerald-500/30">
                                <FaTools />
                            </div>
                            <h4 className="text-white font-bold text-lg">Issue Reporting</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">Log maintenance requests effortlessly with photo uploads and status tracking.</p>
                        </div>
                        {/* Feature 4 */}
                        <div className="flex flex-col items-start gap-4">
                            <div className="w-14 h-14 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl shadow-lg border border-purple-500/30">
                                <FaChartLine />
                            </div>
                            <h4 className="text-white font-bold text-lg">Data Insights</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">AI-driven analytics to optimize campus resource usage and student engagement.</p>
                        </div>
                    </div>

                    {/* Contact / Help Section */}
                    <div className="lg:col-span-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-500/20 mb-4">
                            <FaHeadset />
                        </div>
                        <h4 className="text-white font-bold text-lg mb-2">We are here to help</h4>
                        <p className="text-sm text-slate-400 mb-6">24/7 support for all campus operations and inquiries.</p>
                        <button className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 hover:text-slate-400 transition-colors">
                    <p>&copy; {new Date().getFullYear()} Smart Campus Operations Hub. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
            
            {/* Inject minimal keyframes for the float animation */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes float {
                    0% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-15px) scale(1.02); }
                    100% { transform: translateY(0px) scale(1); }
                }
            `}} />
        </div>
    );
};

export default LandingPage;
