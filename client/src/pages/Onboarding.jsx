import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Calendar, Users, ArrowRight, HeartPulse } from 'lucide-react';

export default function Onboarding() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    sex: '',
    phone: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({
        ...form,
        age: parseInt(form.age),
      });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.details?.[0]?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12" style={{ backgroundColor: 'var(--color-paper)' }}>
      <div className="w-full animate-fade-in">
        {/* Two-column layout: info panel + form */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 card overflow-hidden">

          {/* Left panel — brand & context */}
          <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center"
               style={{ backgroundColor: 'var(--color-teal-wash)', borderRight: '1px solid var(--color-border)' }}>
            {/* EKG icon */}
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
              <rect width="32" height="32" rx="6" fill="var(--color-teal)"/>
              <path d="M8 17 L12 17 L14 12 L16 22 L18 14 L20 17 L24 17"
                    stroke="var(--color-paper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            <h1 className="text-3xl md:text-4xl mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
              Join HealthAI
            </h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-ink-muted)' }}>
              Your personal health companion. Get AI-powered symptom analysis,
              lab report interpretation, and find doctors near you.
            </p>

            {/* Decorative thin EKG line */}
            <svg width="100%" height="12" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none"
                 className="opacity-30 mt-auto hidden md:block">
              <path d="M0 7 L60 7 L75 2 L85 11 L95 5 L105 7 L200 7"
                    stroke="var(--color-teal)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Right panel — form */}
          <div className="md:col-span-3 p-8 md:p-10">
            <h2 className="field-label mb-6" style={{ fontSize: '0.75rem' }}>Create Your Profile</h2>

            {error && (
              <div className="mb-6 p-4 rounded-lg flex items-center gap-2 text-sm font-medium"
                   style={{ backgroundColor: 'var(--color-amber-subtle)', border: '1px solid var(--color-amber-wash)', color: 'var(--color-amber)' }}>
                <HeartPulse className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="field-label block mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-4 h-4" style={{ color: 'var(--color-ink-muted)' }} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                    minLength={2}
                    className="w-full py-3 pr-4 rounded-lg text-sm"
                    style={{ paddingLeft: '3.5rem' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="field-label block mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4" style={{ color: 'var(--color-ink-muted)' }} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full py-3 pr-4 rounded-lg text-sm"
                    style={{ paddingLeft: '3.5rem' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="field-label block mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4" style={{ color: 'var(--color-ink-muted)' }} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full py-3 pr-4 rounded-lg text-sm"
                    style={{ paddingLeft: '3.5rem' }}
                  />
                </div>
              </div>

              {/* Age and Sex */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label block mb-1.5">Age</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Calendar className="w-4 h-4" style={{ color: 'var(--color-ink-muted)' }} />
                    </div>
                    <input
                      type="number"
                      name="age"
                      placeholder="28"
                      value={form.age}
                      onChange={handleChange}
                      required
                      min={1}
                      max={150}
                      className="w-full py-3 pr-4 rounded-lg text-sm data-value"
                      style={{ paddingLeft: '3.5rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="field-label block mb-1.5">Sex</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Users className="w-4 h-4" style={{ color: 'var(--color-ink-muted)' }} />
                    </div>
                    <select
                      name="sex"
                      value={form.sex}
                      onChange={handleChange}
                      required
                      className="w-full py-3 pr-4 rounded-lg text-sm appearance-none cursor-pointer relative z-0"
                      style={{ paddingLeft: '3.5rem' }}
                    >
                      <option value="" disabled>Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="field-label block mb-1.5">Phone <span className="opacity-50">(Optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4" style={{ color: 'var(--color-ink-muted)' }} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full py-3 pr-4 rounded-lg text-sm data-value"
                    style={{ paddingLeft: '3.5rem' }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 btn-primary rounded-lg flex items-center justify-center gap-2 text-sm mt-6 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm mt-8" style={{ color: 'var(--color-ink-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold transition-colors"
                    style={{ color: 'var(--color-teal)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
