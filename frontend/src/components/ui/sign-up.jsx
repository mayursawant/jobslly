import React, { useState, useEffect, useContext } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AnimatedSignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'job_seeker'
    });

    // Auth logic
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    // Animation states
    const [formVisible, setFormVisible] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTimeout(() => setFormVisible(true), 300);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (e) => {
        setFormData({ ...formData, role: e.target.value });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simple Validation
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        try {
            await register(formData);
            toast.success('Account created successfully!');
            // Register usually logs in automatically in App.js/auth context logic
        } catch (error) {
            const message = error.response?.data?.detail || 'Registration failed. Please try again.';
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
                        {/* Left side - Statistics and Images Collage - Hidden on small screens, shown large */}
                        <div className="hidden md:block w-full md:w-1/2 bg-gray-50 p-6 animate-fade-in relative overflow-hidden">
                            {/* Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

                            <div className="relative z-10 h-full flex flex-col justify-center">
                                <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                                    Start Your <span className="text-blue-600">Healthcare Journey</span> Today
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                                        <div className="flex-shrink-0">
                                            <span className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600">
                                                🚀
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Apply Instantly</h3>
                                            <p className="text-gray-500 text-sm">One-click applications to top hospitals and clinics.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 transform hover:scale-105 transition-transform duration-300 animation-delay-900">
                                        <div className="flex-shrink-0">
                                            <span className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 text-emerald-600">
                                                🤖
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">AI Resume Review</h3>
                                            <p className="text-gray-500 text-sm">Get instant feedback to optimize your profile.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 transform hover:scale-105 transition-transform duration-300 animation-delay-2000">
                                        <div className="flex-shrink-0">
                                            <span className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-600">
                                                💼
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Top Employers</h3>
                                            <p className="text-gray-500 text-sm">Connect directly with decision makers.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex space-x-2">
                                    <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
                                    <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-10 h-10 rounded-full border-2 border-white shadow-sm -ml-4" alt="User" />
                                    <img src="https://randomuser.me/api/portraits/women/68.jpg" className="w-10 h-10 rounded-full border-2 border-white shadow-sm -ml-4" alt="User" />
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gray-100 text-xs font-bold -ml-4 text-gray-600">
                                        +2k
                                    </div>
                                    <div className="flex flex-col justify-center ml-4">
                                        <span className="text-sm font-bold text-gray-900">Join 2,000+ Pros</span>
                                        <span className="text-xs text-gray-500">Already hired through Jobslly</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Sign Up form */}
                        <div
                            className="w-full md:w-1/2 p-8 md:p-12 bg-white text-gray-900 flex flex-col justify-center overflow-y-auto max-h-[90vh]"
                            style={{
                                transform: formVisible ? 'translateX(0)' : 'translateX(20px)',
                                opacity: formVisible ? 1 : 0,
                                transition: 'transform 0.6s ease-out, opacity 0.6s ease-out'
                            }}
                        >
                            <div className="flex justify-end mb-4">
                                <p className="text-sm text-gray-600">
                                    Already have an account?
                                    <a
                                        href="/login"
                                        className="ml-1 font-bold text-blue-600 hover:text-blue-500 transition-colors"
                                    >
                                        Sign in
                                    </a>
                                </p>
                            </div>

                            <div className="mb-6">
                                <h1 className="text-3xl font-bold mb-2 text-gray-900 tracking-tight">
                                    Create Account
                                </h1>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Join Jobslly to unlock your healthcare career potential.
                                </p>
                            </div>

                            <form onSubmit={handleSignUp} className="space-y-5">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 border py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all sm:text-sm"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700 ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 border py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all sm:text-sm"
                                            placeholder="+1 234 567 890"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border-gray-200 bg-gray-50 border py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all sm:text-sm"
                                        placeholder="doctor@hospital.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 ml-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 border py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all sm:text-sm"
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

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 ml-1">I am a...</label>
                                    <div className="relative">
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 border py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all sm:text-sm cursor-pointer"
                                        >
                                            <option value="job_seeker">Healthcare Professional (Job Seeker)</option>
                                            <option value="employer">Employer / Recruiter</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
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
                                            Creating Account...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            Create My Account
                                        </span>
                                    )}
                                </button>

                                <p className="text-xs text-center text-gray-500 mt-4">
                                    By registering, you agree to our <a href="/terms-of-service" className="text-blue-600 hover:underline">Terms</a> and <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>.
                                </p>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { AnimatedSignUp };
