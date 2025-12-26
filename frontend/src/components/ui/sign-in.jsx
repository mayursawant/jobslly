import React, { useState, useEffect, useContext } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AnimatedSignIn = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Auth logic
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Animation states
    const [formVisible, setFormVisible] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTimeout(() => setFormVisible(true), 300);
    }, []);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            // Success is handled by App.js redirecting based on user state
            toast.success('Welcome back!');
        } catch (error) {
            // Display specific error message from backend if available
            const message = error.response?.data?.detail || 'Invalid email or password';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Only show the component once mounted to avoid hydration issues
    if (!mounted) return null;

    return (
        <div className="min-h-screen w-full bg-[#f0f9ff] transition-colors duration-300">
            <div className="flex min-h-screen items-center justify-center p-4 md:p-0">
                <div className={`w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-200 transition-all duration-500 ${formVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

                    <div className="flex flex-col md:flex-row">
                        {/* Left side - Statistics and Images Collage */}
                        <div className="hidden md:block w-full md:w-3/5 bg-gray-50 p-6 animate-fade-in">
                            <div className="grid grid-cols-2 grid-rows-3 gap-4 h-full overflow-hidden">
                                {/* Top left - Doctor */}
                                <div className="overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <img
                                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070"
                                        alt="Doctor working"
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                        style={{ opacity: 0.95 }}
                                    />
                                </div>

                                {/* Top right - Blue stat */}
                                <div
                                    className="rounded-xl flex flex-col justify-center items-center p-6 text-white bg-blue-600 shadow-lg"
                                    style={{
                                        transform: formVisible ? 'translateY(0)' : 'translateY(20px)',
                                        opacity: formVisible ? 1 : 0,
                                        transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
                                        transitionDelay: '0.2s',
                                    }}
                                >
                                    <h2 className="text-5xl font-bold mb-2">jobslly</h2>
                                    <p className="text-center text-sm font-medium">Connecting Healthcare Heroes to their Dream Careers</p>
                                </div>

                                {/* Middle left - Nurse */}
                                <div className="overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <img
                                        src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=2069"
                                        alt="Nurse at hospital"
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                        style={{ opacity: 0.95 }}
                                    />
                                </div>

                                {/* Middle right - Surgery/Team */}
                                <div className="overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <img
                                        src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1932"
                                        alt="Surgical team"
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                        style={{ opacity: 0.95 }}
                                    />
                                </div>

                                {/* Bottom left - Emerald stat */}
                                <div
                                    className="rounded-xl flex flex-col justify-center items-center p-6 text-white bg-emerald-500 shadow-lg"
                                    style={{
                                        transform: formVisible ? 'translateY(0)' : 'translateY(20px)',
                                        opacity: formVisible ? 1 : 0,
                                        transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
                                        transitionDelay: '0.4s',
                                    }}
                                >
                                    <h2 className="text-5xl font-bold mb-2">Top 1%</h2>
                                    <p className="text-center text-sm font-medium whitespace-pre-line">Medical Institutions Hiring via our Platform</p>
                                </div>

                                {/* Bottom right - Hospital Corridor/Lab */}
                                <div className="overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <img
                                        src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053"
                                        alt="Hospital environment"
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                        style={{ opacity: 0.95 }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right side - Sign in form */}
                        <div
                            className="w-full md:w-2/5 p-8 md:p-12 bg-white text-gray-900 flex flex-col justify-center"
                            style={{
                                transform: formVisible ? 'translateX(0)' : 'translateX(20px)',
                                opacity: formVisible ? 1 : 0,
                                transition: 'transform 0.6s ease-out, opacity 0.6s ease-out'
                            }}
                        >
                            <div className="flex justify-end mb-6">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?
                                    <a
                                        href="/register"
                                        className="ml-1 font-bold text-blue-600 hover:text-blue-500 transition-colors"
                                    >
                                        Sign up
                                    </a>
                                </p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center space-x-2 mb-2">
                                    {/* Logo Placeholder or Icon */}
                                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">J</span>
                                    </div>
                                    <span className="text-2xl font-bold text-blue-900">Jobslly</span>
                                </div>
                                <h1 className="text-2xl font-bold mb-2 text-gray-900">
                                    Welcome Back
                                </h1>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Enter your credentials to access your dashboard and continue your career journey.
                                </p>
                            </div>

                            <form onSubmit={handleSignIn} className="space-y-6">
                                <div className="space-y-1">
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 ml-1"
                                    >
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 border py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 focus:bg-white transition-all duration-200 sm:text-sm"
                                            placeholder="doctor@hospital.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 ml-1"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 border py-3.5 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 focus:bg-white transition-all duration-200 sm:text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <a
                                        href="#"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                    >
                                        Forgot password?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`flex w-full justify-center rounded-xl py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 ${isLoading
                                        ? 'bg-blue-400 cursor-not-allowed opacity-80'
                                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/40'
                                        }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Signing in...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            Sign In to Account
                                        </span>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { AnimatedSignIn };
