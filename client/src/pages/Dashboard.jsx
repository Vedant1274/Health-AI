import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { symptomAPI, reportAPI, appointmentAPI } from '../api/endpoints';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Stethoscope,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  User,
  Activity,
  ChevronRight,
  MapPin,
  TrendingUp,
  HeartPulse,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState([]);
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sympRes, repRes, aptRes] = await Promise.all([
        symptomAPI.getHistory(1, 5),
        reportAPI.getAll(1, 5),
        appointmentAPI.getAll(1, 5),
      ]);

      setSymptoms(sympRes.data.checks || []);
      setReports(repRes.data.reports || []);
      setAppointments(aptRes.data.appointments || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      normal: { class: 'badge-normal', icon: CheckCircle2, label: 'Normal' },
      attention: { class: 'badge-attention', icon: AlertTriangle, label: 'Attention' },
      pending: { class: 'badge-pending', icon: Clock, label: 'Pending' },
      error: { class: 'badge-urgent', icon: AlertTriangle, label: 'Error' },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <span className={c.class}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const getAppointmentBadge = (status) => {
    const config = {
      pending: 'badge-attention',
      confirmed: 'badge-normal',
      completed: 'badge-pending',
      cancelled: 'badge-urgent',
    };
    const badgeClass = config[status] || config.pending;
    return (
      <span className={badgeClass}>
        {status?.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Syncing Health Data..." />
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 pb-12 mt-8">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Left Column */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Welcome Header */}
          <div className="animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center border"
                style={{ backgroundColor: 'var(--color-teal-subtle)', borderColor: 'var(--color-border)' }}>
                <User className="w-8 h-8" style={{ color: 'var(--color-teal)' }} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1" style={{ color: 'var(--color-ink)' }}>
                  Hello, {user?.name?.split(' ')[0] || 'veadant'}
                </h1>
                <p className="text-sm md:text-base font-medium flex items-center gap-2" style={{ color: 'var(--color-ink-muted)' }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-sage)' }}></span>
                  All systems operational
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-up stagger-1">
          <button
            onClick={() => navigate('/symptoms')}
            className="card p-8 text-left hover-lift group transition-all flex items-center justify-between gap-4 min-h-[120px]"
          >
            <div>
              <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-ink)' }}>Check Symptoms</h3>
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>AI-powered diagnosis</p>
            </div>
            <div className="w-14 h-14 mr-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
              style={{ backgroundColor: 'var(--color-teal-wash)', border: '1px solid var(--color-border-light)' }}>
              <Stethoscope className="w-7 h-7" style={{ color: 'var(--color-teal)' }} />
            </div>
          </button>

          <button
            onClick={() => navigate('/upload')}
            className="card p-8 text-left hover-lift group transition-all flex items-center justify-between gap-4 min-h-[120px]"
          >
            <div>
              <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-ink)' }}>Upload Report</h3>
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Extract lab findings</p>
            </div>
            <div className="w-14 h-14 mr-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
              style={{ backgroundColor: 'var(--color-teal-wash)', border: '1px solid var(--color-border-light)' }}>
              <FileText className="w-7 h-7" style={{ color: 'var(--color-teal)' }} />
            </div>
          </button>

          {/* Bug 2 override: Emergency button explicitly uses red per usability exception */}
          <button
            onClick={() => navigate('/emergency')}
            className="card p-8 text-left hover-lift group transition-all flex items-center justify-between gap-4 min-h-[120px]"
            style={{ borderColor: 'var(--color-emergency-wash)' }}
          >
            <div>
              <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-ink)' }}>Emergency SOS</h3>
              <p className="text-sm" style={{ color: 'var(--color-emergency)' }}>Get immediate help</p>
            </div>
            <div className="w-14 h-14 mr-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
              style={{ backgroundColor: 'var(--color-emergency-subtle)', border: '1px solid var(--color-emergency-wash)' }}>
              <HeartPulse className="w-7 h-7" style={{ color: 'var(--color-emergency)' }} />
            </div>
          </button>
        </div>
        </div>

        {/* Health Score */}
        <div className="md:col-span-4 card p-6 animate-slide-up stagger-2 flex flex-col justify-center items-center text-center">
          <div className="relative z-10 w-32 h-32 rounded-full flex items-center justify-center mb-4"
            style={{ border: '4px solid var(--color-border-light)' }}>
            <div className="text-4xl font-bold data-value" style={{ color: 'var(--color-ink)' }}>92</div>
            <div className="absolute bottom-6 text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: 'var(--color-ink-muted)' }}>Score</div>
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>Excellent Health</h3>
          <p className="text-sm mt-1 flex items-center justify-center gap-1" style={{ color: 'var(--color-ink-muted)' }}>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-sage)' }} /> +4 from last month
          </p>
        </div>

        {/* Recent Symptom Checks */}
        <div className="md:col-span-6 card p-6 animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}>
              <Stethoscope className="w-5 h-5" style={{ color: 'var(--color-teal)' }} />
              Recent Checks
            </h2>
          </div>

          {symptoms.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: 'var(--color-paper-warm)' }}>
                <Stethoscope className="w-6 h-6" style={{ color: 'var(--color-ink-muted)' }} />
              </div>
              <p className="font-medium text-sm mb-4" style={{ color: 'var(--color-ink-muted)' }}>No symptom checks yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {symptoms.map((check) => (
                <div
                  key={check._id}
                  className="rounded-2xl transition-all"
                  style={{ 
                    backgroundColor: 'var(--color-paper-warm)', 
                    border: '1px solid var(--color-border)',
                    padding: '1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <p className="text-sm font-medium line-clamp-2" style={{ color: 'var(--color-ink)', marginBottom: '1rem' }}>
                      {check.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={
                        check.aiResponse?.urgency === 'urgent'
                          ? 'badge-urgent'
                          : check.aiResponse?.urgency === 'soon'
                            ? 'badge-attention'
                            : 'badge-normal'
                      }>
                        {check.aiResponse?.urgency?.toUpperCase() || 'ROUTINE'}
                      </span>
                      <span className="text-xs font-medium flex items-center gap-1 data-value" style={{ color: 'var(--color-ink-muted)' }}>
                        <Clock className="w-3 h-3" />
                        {new Date(check.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="md:col-span-6 card p-6 animate-slide-up stagger-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}>
              <FileText className="w-5 h-5" style={{ color: 'var(--color-teal)' }} />
              Lab Reports
            </h2>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: 'var(--color-paper-warm)' }}>
                <FileText className="w-6 h-6" style={{ color: 'var(--color-ink-muted)' }} />
              </div>
              <p className="font-medium text-sm mb-4" style={{ color: 'var(--color-ink-muted)' }}>No reports uploaded</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {reports.map((report, idx) => (
                <button
                  key={report._id}
                  onClick={() => navigate(`/reports/${report._id}/result`)}
                  className={`w-full py-3 transition-all text-left flex items-center justify-between group ${idx !== 0 ? 'border-t' : ''}`}
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: 'var(--color-teal-subtle)', border: '1px solid var(--color-border-light)' }}>
                      <FileText className="w-4 h-4" style={{ color: 'var(--color-teal)' }} />
                    </div>
                    <div>
                      {/* Bug 5 fix: Dynamic reporting names */}
                      <p className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>
                        {report.type || report.documentName || 'Lab Report'}
                      </p>
                      <p className="text-xs data-value" style={{ color: 'var(--color-ink-muted)' }}>
                        {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(report.analysis?.status)}
                    <ChevronRight className="w-4 h-4 transition-colors" style={{ color: 'var(--color-ink-muted)' }} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Appointments */}
        <div className="md:col-span-12 card p-6 animate-slide-up stagger-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}>
              <Calendar className="w-5 h-5" style={{ color: 'var(--color-teal)' }} />
              Upcoming Appointments
            </h2>
            <button onClick={() => navigate('/find-doctor')} className="text-sm font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color: 'var(--color-teal)', display: 'flex', alignItems: 'center' }}>
              Find Doctor <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: 'var(--color-paper-warm)' }}>
                <Calendar className="w-6 h-6" style={{ color: 'var(--color-ink-muted)' }} />
              </div>
              <p className="font-medium text-sm mb-4" style={{ color: 'var(--color-ink-muted)' }}>No appointments booked yet</p>
            </div>
          ) : (
            <div className="flex items-center overflow-x-auto pb-2 scrollbar-hide w-full">
              <div className="flex items-center divide-x" style={{ borderColor: 'var(--color-border)' }}>
                {appointments.map((apt) => (
                  <div key={apt._id} className="px-6 first:pl-0 last:pr-0 whitespace-nowrap">
                    <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-ink)' }}>
                      <span className="font-medium data-value">
                        {new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}:
                      </span>
                      <span className="font-medium">
                         Dr. {apt.placeName} - {apt.specialty}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
