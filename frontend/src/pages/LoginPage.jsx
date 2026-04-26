import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';

const LoginPage = () => {
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    
    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // UI state
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        try {
            const success = await login(email, password);
            if (!success) {
                setError('Invalid email or password. Please try again.');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('An error occurred. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Left Side: Hero Section (60%) */}
            <div className="relative hidden lg:flex lg:w-[60%] flex-col justify-center overflow-hidden">
                {/* Background Image */}
                <img 
                    src={heroBg} 
                    alt="Modern University Building" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 hover:scale-110"
                />
                
                {/* Deep Blue Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-deep-blue/95 via-deep-blue/70 to-transparent mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-blue via-transparent to-transparent opacity-60" />

                {/* Content */}
                <div className="relative z-10 px-20">
                    <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-blue-100 uppercase bg-blue-500/20 backdrop-blur-md rounded-full border border-blue-400/30">
                        Campus Management Reimagined
                    </div>
                    <h1 className="text-7xl font-black text-white leading-tight mb-6">
                        Smart Campus <br />
                        <span className="text-blue-400 underline decoration-blue-500/30 underline-offset-8">Hub.</span>
                    </h1>
                    <p className="max-w-md text-xl text-blue-100/80 leading-relaxed font-light">
                        The ultimate destination for faculty, students, and staff to manage operations, resources, and innovation seamlessly.
                    </p>
                    
                    <div className="mt-12 flex items-center gap-6">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-deep-blue overflow-hidden hover:translate-y-[-4px] transition-transform">
                                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-blue-100 items-center gap-2">
                            <span className="font-bold text-white block text-base">Join 10,000+ Students</span>
                            using the hub daily.
                        </p>
                    </div>
                </div>

                {/* Bottom decorative elements */}
                <div className="absolute bottom-10 left-20 right-20 flex justify-between items-center text-blue-200/40 text-sm">
                    <p>© 2026 Smart Campus Operations Hub</p>
                    <div className="flex gap-6">
                        <span>Status: Operational</span>
                        <span>v2.4.0</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form (40%) */}
            <div className="flex flex-col w-full lg:w-[40%] bg-slate-50 relative">
                {/* Mobile Header Overlay (only visible on small screens) */}
                <div className="lg:hidden absolute top-0 left-0 w-full p-8 z-10">
                    <h2 className="text-2xl font-black text-deep-blue">Smart Campus <span className="text-blue-600">Hub</span></h2>
                </div>

                <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24">
                    {/* Header */}
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome Back</h2>
                        <p className="text-slate-500 flex items-center gap-2">
                            New here? 
                            <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 underline underline-offset-4 decoration-2 decoration-blue-200 hover:decoration-blue-500 transition-all">
                                Create an account
                            </Link>
                        </p>
                    </div>

                    {/* Glassmorphic Container */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                        <div className="relative bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-8 pt-10">
                            
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm animate-shake">
                                    <p className="font-semibold">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="name@university.edu"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-sm font-bold text-slate-700">Password</label>
                                        <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors">
                                            Forgot password?
                                        </a>
                                    </div>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center px-1">
                                    <label className="relative flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-5 h-5 bg-slate-100 border border-slate-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                        <span className="ml-3 text-sm text-slate-600 select-none">Remember me for 30 days</span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative w-full flex items-center justify-center py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="my-8 relative text-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <span className="relative px-4 bg-white text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Or continue with
                                </span>
                            </div>

                            {/* OAuth Button */}
                            <button
                                type="button"
                                onClick={loginWithGoogle}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-slate-100 bg-white rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-200 active:scale-[0.98] transition-all"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-8 text-center text-xs text-slate-400 font-medium">
                        <p>By signing in, you agree to our <a href="#" className="underline hover:text-slate-600 transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;