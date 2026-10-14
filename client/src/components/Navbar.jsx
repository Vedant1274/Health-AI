import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Stethoscope,
  FileText,
  AlertCircle,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/symptoms', label: 'Symptoms', icon: Stethoscope },
  { to: '/upload', label: 'Reports', icon: FileText },
  { to: '/emergency', label: 'Emergency', icon: AlertCircle },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'shadow-sm' : ''}`}
         style={{ backgroundColor: 'var(--color-paper)' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <nav className="border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between h-16">
            {/* Logo — Wordmark in serif */}
            <Link to="/dashboard" className="flex items-center gap-2 group">
              {/* Small EKG icon */}
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
                   className="transition-transform duration-200 group-hover:scale-105">
                <rect width="32" height="32" rx="6" fill="var(--color-teal)"/>
                <path d="M8 17 L12 17 L14 12 L16 22 L18 14 L20 17 L24 17"
                      stroke="var(--color-paper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xl font-semibold hidden sm:block"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
                HealthAI
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 relative"
                    style={{
                      color: isActive ? 'var(--color-teal)' : 'var(--color-ink-muted)',
                      backgroundColor: isActive ? 'var(--color-teal-wash)' : 'transparent',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--color-ink)'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--color-ink-muted)'; }}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {isActive && (
                      <div className="absolute -bottom-[9px] left-3 right-3 h-[2px] rounded-full"
                           style={{ backgroundColor: 'var(--color-teal)' }} />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                   style={{ backgroundColor: 'var(--color-paper-warm)', border: '1px solid var(--color-border-light)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                     style={{ backgroundColor: 'var(--color-teal)', color: '#FFFFFF' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-colors duration-200"
                style={{ color: 'var(--color-ink-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-emergency)'; e.currentTarget.style.backgroundColor = 'var(--color-emergency-subtle)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors duration-200"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 animate-fade-in"
             style={{ backgroundColor: 'var(--color-paper)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? 'var(--color-teal)' : 'var(--color-ink)',
                    backgroundColor: isActive ? 'var(--color-teal-wash)' : 'transparent',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
            <hr className="divider my-3" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              style={{ color: 'var(--color-emergency)' }}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
