import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, HeartPulse, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center bg-[#e8f0eb] relative overflow-hidden px-6 py-6 font-sans">
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
          -webkit-text-fill-color: #111827 !important;
          border-radius: 14px !important;
        }
      `}</style>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e462e 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute top-[10%] left-[10%] w-96 h-96 rounded-full bg-[#d5e5db] blur-3xl opacity-60 pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-[#d5e5db] blur-3xl opacity-60 pointer-events-none z-0"></div>

      {/* BIG CARD CONTAINER */}
      <div className="w-full max-w-[600px] mx-auto relative z-10 flex flex-col items-center animate-fade-in">
        <form 
          onSubmit={handleSubmit} 
          className="w-full box-border bg-[#fff] p-[36px_24px] md:p-[64px_64px_56px] rounded-[28px] shadow-[0_24px_60px_rgba(31,69,48,0.12)] border border-[rgba(31,69,48,0.06)] flex flex-col items-center"
        >
          {/* Header inside Card */}
          <div className="w-full flex flex-col items-center text-center mb-[48px]">
            {/* Logo */}
            <div className="w-[72px] h-[72px] bg-[#1e462e] rounded-2xl flex items-center justify-center mb-[20px] shadow-lg shadow-[#1e462e]/20">
               <HeartPulse className="w-10 h-10 text-white" />
            </div>
            
            {/* Heading */}
            <h1 className="text-[32px] md:text-[40px] font-bold mb-[12px] text-[#1e462e] tracking-tight w-full box-border m-0">
              Welcome Back
            </h1>
            
            {/* Subtitle */}
            <p className="max-w-[420px] w-full box-border mx-auto text-[16px] text-[#4b6b5a] leading-[1.6] text-balance m-0">
              Sign in to access your health dashboard, symptom history, and lab reports.
            </p>
          </div>

          {/* Form Content */}
          <div className="w-full box-border text-left">
            <h2 className="text-[28px] font-semibold text-gray-900 mb-[8px] leading-tight m-0">Sign In</h2>
            <p className="text-[15px] text-gray-500 m-0">Please enter your details to continue.</p>
          </div>

          {error && (
            <div className="w-full box-border mt-[20px] p-4 rounded-xl flex items-center gap-3 text-sm font-medium bg-red-50 text-red-700 border border-red-100 text-left">
              <HeartPulse className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="w-full box-border space-y-[32px] mt-[36px]">
            {/* Email Input */}
            <div className="w-full box-border">
              <label htmlFor="email" className="block text-left text-[14px] font-semibold text-gray-900 mb-[10px] m-0">Email Address</label>
              <div className="relative w-full box-border">
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full h-[60px] box-border pl-[20px] pr-[54px] bg-[#fff] border border-[#D5DED8] rounded-[14px] text-[16px] text-gray-900 placeholder-[#9AA5A0] hover:border-[#B5C4BB] focus:border-[#1F4530] focus:ring-0 focus:shadow-[0_0_0_4px_rgba(31,69,48,0.12)] transition-all duration-200 outline-none m-0"
                />
                <Mail className="absolute right-[18px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-gray-400 pointer-events-none" strokeWidth={2} />
              </div>
            </div>

            {/* Password Input */}
            <div className="w-full box-border">
              <label htmlFor="password" className="block text-left text-[14px] font-semibold text-gray-900 mb-[10px] m-0">Password</label>
              <div className="relative w-full box-border">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full h-[60px] box-border pl-[20px] pr-[54px] bg-[#fff] border border-[#D5DED8] rounded-[14px] text-[16px] text-gray-900 placeholder-[#9AA5A0] hover:border-[#B5C4BB] focus:border-[#1F4530] focus:ring-0 focus:shadow-[0_0_0_4px_rgba(31,69,48,0.12)] transition-all duration-200 outline-none m-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-[18px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[20px] h-[20px]" strokeWidth={2} /> : <Eye className="w-[20px] h-[20px]" strokeWidth={2} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full box-border h-[60px] mt-[40px] bg-[#1F4530] hover:bg-[#153422] hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(31,69,48,0.28)] active:translate-y-0 text-white rounded-[14px] flex items-center justify-center gap-[10px] text-[17px] font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none m-0"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />
              </>
            )}
          </button>

          <div className="w-full box-border mt-[32px] text-center m-0">
            <p className="text-[14px] text-gray-500 m-0">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-bold text-[#1F4530] hover:underline transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
