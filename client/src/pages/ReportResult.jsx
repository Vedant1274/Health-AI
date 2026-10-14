import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportAPI } from '../api/endpoints';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  MapPin,
  ArrowRight,
  FileText,
  RefreshCw,
  Activity
} from 'lucide-react';

const flagConfig = {
  normal: { icon: CheckCircle2, badgeClass: 'badge-normal', label: 'Normal' },
  low: { icon: ArrowDown, badgeClass: 'badge-attention', label: 'Low' },
  high: { icon: ArrowUp, badgeClass: 'badge-attention', label: 'High' },
  critical: { icon: AlertTriangle, badgeClass: 'badge-urgent', label: 'Critical' },
};

export default function ReportResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await reportAPI.get(id);
      setReport(res.data.report);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" text="Decoding Lab Results..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 pb-12">
        <div className="card border-danger-500/30 rounded-3xl p-8 md:p-12 text-center mt-8">
          <div className="w-20 h-20 bg-danger-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-danger-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-ink)' }}>Error Loading Report</h2>
          <p className="font-medium max-w-sm mx-auto mb-8" style={{ color: 'var(--color-emergency)' }}>{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 btn-secondary rounded-xl font-bold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const analysis = report?.analysis;
  const isNormal = analysis?.status === 'normal';
  const isPending = analysis?.status === 'pending';
  const findings = analysis?.findings || [];
  const flaggedFindings = findings.filter(f => f.flag !== 'normal');

  const primaryCondition = flaggedFindings.length > 0
    ? flaggedFindings[0].parameter
    : '';

  return (
    <div className="w-full flex justify-center px-4 pb-12">
      <div className="w-full max-w-3xl">

      <div className="mt-8 animate-fade-in">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center"
               style={{ backgroundColor: 'var(--color-teal-wash)', border: '1px solid var(--color-border)' }}>
            <Activity className="w-7 h-7" style={{ color: 'var(--color-teal)' }} />
          </div>
          <div className="min-w-0 text-left">
            <h1 className="text-2xl font-bold truncate" style={{ color: 'var(--color-ink)' }}>Report Analysis</h1>
            <p className="mt-1 truncate" style={{ color: 'var(--color-ink-muted)' }}>AI breakdown of your lab findings</p>
          </div>
        </div>

        {isPending ? (
          /* Pending Analysis */
          <div className="card rounded-3xl p-12 text-center relative overflow-hidden animate-slide-up">
            <RefreshCw className="w-16 h-16 mx-auto mb-6 animate-spin-slow" style={{ color: 'var(--color-teal)' }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-ink)' }}>Analysis in Progress</h2>
            <p className="font-medium" style={{ color: 'var(--color-ink-muted)' }}>Your report is being analyzed by our AI model. Check back shortly.</p>
          </div>
        ) : isNormal ? (
          /* Normal Results */
          <div className="animate-slide-up space-y-6">
            <div className="card p-8 md:p-12 text-center relative overflow-hidden"
                 style={{ borderColor: 'var(--color-sage-wash)', backgroundColor: 'var(--color-sage-subtle)' }}>
              
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
                   style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-sage-wash)' }}>
                <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--color-sage)' }} />
              </div>
              <h2 className="text-3xl font-bold mb-4 relative z-10" style={{ color: 'var(--color-ink)' }}>
                Everything Looks Normal! 🎉
              </h2>
              <p className="leading-relaxed max-w-2xl mx-auto relative z-10 text-lg" style={{ color: 'var(--color-ink-light)' }}>
                {analysis.summary}
              </p>
            </div>

            {findings.length > 0 && (
              <div className="card p-6 md:p-8 animate-slide-up stagger-1">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--color-ink)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                       style={{ backgroundColor: 'var(--color-teal-wash)', border: '1px solid var(--color-border)' }}>
                    <FileText className="w-5 h-5" style={{ color: 'var(--color-teal)' }} />
                  </div>
                  Detailed Findings
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {findings.map((finding, i) => {
                    const config = flagConfig[finding.flag] || flagConfig.normal;
                    const FlagIcon = config.icon;
                    return (
                      <div key={i} className="rounded-2xl transition-all"
                           style={{ 
                             backgroundColor: 'var(--color-paper-warm)', 
                             border: '1px solid var(--color-border)',
                             display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.75rem 1.25rem'
                           }}>
                        <div className="mt-0.5 p-1 rounded-full bg-white flex-shrink-0">
                          <FlagIcon className="w-5 h-5" style={{ color: 'var(--color-sage)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <p className="field-label text-sm" style={{ color: 'var(--color-ink)' }}>{finding.parameter}</p>
                            <div className="flex items-center gap-3 text-sm px-3 py-1.5 rounded-lg data-value"
                                 style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                              <span className="font-bold" style={{ color: 'var(--color-ink)' }}>{finding.value}</span>
                              <span style={{ color: 'var(--color-border)' }}>|</span>
                              <span style={{ color: 'var(--color-ink-muted)' }}>Normal: {finding.normalRange}</span>
                            </div>
                          </div>
                          {finding.explanation && (
                            <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{finding.explanation}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Attention Results */
          <div className="animate-slide-up space-y-6">
            <div className="card p-8 md:p-10 relative overflow-hidden"
                 style={{ backgroundColor: 'var(--color-amber-subtle)', borderColor: 'var(--color-amber-wash)' }}>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                     style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-amber-wash)' }}>
                  <AlertTriangle className="w-10 h-10" style={{ color: 'var(--color-amber)' }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-ink)' }}>
                    Attention Needed
                  </h2>
                  <p className="leading-relaxed text-lg max-w-2xl" style={{ color: 'var(--color-ink-light)' }}>
                    {analysis.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Flagged Findings */}
            <div className="card p-6 md:p-8 animate-slide-up stagger-1">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--color-ink)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: 'var(--color-amber-wash)', border: '1px solid var(--color-amber-light)' }}>
                  <Activity className="w-5 h-5" style={{ color: 'var(--color-amber)' }} />
                </div>
                Flagged Parameters
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {findings.map((finding, i) => {
                  const config = flagConfig[finding.flag] || flagConfig.normal;
                  const FlagIcon = config.icon;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border animate-fade-in"
                      style={{ 
                        animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: 'forwards',
                        backgroundColor: 'var(--color-paper-warm)', borderColor: 'var(--color-border)',
                        display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.75rem 1.25rem'
                      }}
                    >
                      <div className="mt-0.5 p-1 rounded-full bg-white flex-shrink-0">
                        <FlagIcon className="w-5 h-5" style={{ color: finding.flag === 'critical' ? 'var(--color-emergency)' : finding.flag !== 'normal' ? 'var(--color-amber)' : 'var(--color-sage)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <p className="field-label text-sm" style={{ color: 'var(--color-ink)', letterSpacing: '0.05em' }}>{finding.parameter}</p>
                            <span className={config.badgeClass}>
                              {config.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm px-3 py-1.5 rounded-lg data-value"
                               style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                            <span className="font-bold" style={{ color: 'var(--color-ink)' }}>{finding.value}</span>
                            <span style={{ color: 'var(--color-border)' }}>|</span>
                            <span style={{ color: 'var(--color-ink-muted)' }}>Normal: {finding.normalRange}</span>
                          </div>
                        </div>
                        {finding.explanation && (
                          <p className="text-sm leading-relaxed p-3 rounded-xl border"
                             style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--color-border-light)', color: 'var(--color-ink-muted)' }}>
                            {finding.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Call to Action — Find Doctors */}
            {flaggedFindings.length > 0 && (
              <div className="card p-6 md:p-8 animate-slide-up stagger-2 group"
                   style={{ backgroundColor: 'var(--color-teal-wash)', borderColor: 'var(--color-border)' }}>
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                       style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-light)' }}>
                    <MapPin className="w-8 h-8" style={{ color: 'var(--color-teal)' }} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-ink)' }}>
                      Find a Doctor Near You
                    </h3>
                    <p className="text-sm md:text-base" style={{ color: 'var(--color-ink-light)' }}>
                      Based on your results, we recommend consulting a specialist. 
                      Share your location to find top-rated doctors nearby.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/find-doctor', { state: { condition: primaryCondition } })}
                    className="w-full md:w-auto py-4 px-8 btn-primary rounded-xl flex items-center justify-center gap-2 text-lg"
                  >
                    Find Specialists
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '4rem' }}>
        <MedicalDisclaimer />
      </div>
      </div>
    </div>
  );
}
