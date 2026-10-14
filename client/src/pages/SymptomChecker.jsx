import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { symptomAPI } from '../api/endpoints';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Stethoscope,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  FlaskConical,
  ArrowRight,
} from 'lucide-react';

const urgencyConfig = {
  routine: {
    label: 'Routine',
    badgeClass: 'badge-normal',
    icon: Clock,
    description: 'Can wait a few days',
  },
  soon: {
    label: 'Soon',
    badgeClass: 'badge-attention',
    icon: AlertTriangle,
    description: 'See a doctor within 1–2 days',
  },
  urgent: {
    label: 'Urgent',
    badgeClass: 'badge-urgent',
    icon: Zap,
    description: 'Seek immediate medical attention',
  },
};

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      setError('Please describe your symptoms in more detail (at least 10 characters).');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await symptomAPI.analyze(description.trim());
      setResult(res.data.symptomCheck);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const urgency = result?.aiResponse?.urgency;
  const urgencyInfo = urgencyConfig[urgency] || urgencyConfig.routine;

  return (
    <div className="w-full flex justify-center px-4 pb-12">
      <div className="w-full max-w-3xl">

      <div className="mt-8 animate-fade-in">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center"
               style={{ backgroundColor: 'var(--color-teal-wash)', border: '1px solid var(--color-border)' }}>
            <Stethoscope className="w-7 h-7" style={{ color: 'var(--color-teal)' }} />
          </div>
          <div className="min-w-0 text-left">
            <h1 className="text-3xl font-bold truncate" style={{ color: 'var(--color-ink)' }}>Symptom Checker</h1>
            <p className="mt-1 truncate" style={{ color: 'var(--color-ink-muted)' }}>Describe how you're feeling and get AI-powered guidance</p>
          </div>
        </div>

        {/* Input Form */}
        {!result && (
          <form onSubmit={handleSubmit} className="animate-slide-up w-full relative z-10">
            <div className="card p-6 md:p-8 w-full relative overflow-hidden">
              <label className="field-label block mb-3 ml-1">
                How are you feeling right now?
              </label>
              
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setError(''); }}
                  placeholder="e.g., I've had a fever and body ache since yesterday, feeling weak and tired..."
                  rows={5}
                  className="w-full px-5 py-4 rounded-xl resize-none"
                  maxLength={2000}
                />
                <div className="absolute bottom-3 right-4 text-xs font-medium px-2 py-1 rounded-md"
                     style={{ color: 'var(--color-ink-muted)', backgroundColor: 'var(--color-paper-warm)' }}>
                  {description.length}/2000
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-xl text-sm flex items-center gap-2"
                     style={{ backgroundColor: 'var(--color-amber-subtle)', border: '1px solid var(--color-amber-wash)', color: 'var(--color-amber)' }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex justify-center" style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full max-w-sm py-4 btn-primary rounded-xl flex items-center justify-center gap-2 text-lg font-bold group shadow-md"
                >
                {loading ? (
                  <LoadingSpinner size="sm" text="" />
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Analyze Symptoms
                  </>
                )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-12 flex flex-col items-center gap-5 animate-fade-in">
            <LoadingSpinner size="lg" text="Analyzing symptoms..." />
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
              Consulting clinical knowledge base
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mt-4 space-y-6 animate-slide-up">
            {/* Urgency Banner */}
            {urgency === 'urgent' && (
              <div className="p-5 rounded-2xl flex items-start gap-4 animate-fade-in relative overflow-hidden"
                   style={{ backgroundColor: 'var(--color-amber-wash)', border: '1px solid var(--color-amber-light)' }}>
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: 'var(--color-amber)' }} />
                <Zap className="w-8 h-8 flex-shrink-0 mt-0.5 animate-pulse" style={{ color: 'var(--color-amber)' }} />
                <div>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-amber)' }}>
                    Immediate Attention Recommended
                  </p>
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-ink-light)' }}>
                    Based on your symptoms, we strongly recommend seeking immediate in-person medical care 
                    rather than waiting. Please visit a doctor or emergency room.
                  </p>
                </div>
              </div>
            )}

            {/* Urgency Badge */}
            <div className="flex justify-center mb-2">
               <div className={`${urgencyInfo.badgeClass} px-5 py-2.5 text-sm shadow-sm`}>
                 <urgencyInfo.icon className="w-5 h-5" />
                 Urgency: {urgencyInfo.label} — <span className="opacity-80 font-normal">{urgencyInfo.description}</span>
               </div>
            </div>

            {/* Possible Conditions */}
            <div className="card p-6 md:p-8 animate-slide-up stagger-1">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: 'var(--color-amber-subtle)', border: '1px solid var(--color-amber-wash)' }}>
                  <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-amber)' }} />
                </div>
                Possible Conditions
              </h3>
              <div className="flex flex-wrap gap-3">
                {result.aiResponse.possibleConditions.map((condition, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    style={{ backgroundColor: 'var(--color-paper-warm)', border: '1px solid var(--color-border)', color: 'var(--color-ink)' }}
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Tests */}
            <div className="card p-6 md:p-8 animate-slide-up stagger-2">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: 'var(--color-teal-wash)', border: '1px solid var(--color-border-light)' }}>
                  <FlaskConical className="w-5 h-5" style={{ color: 'var(--color-teal)' }} />
                </div>
                Recommended Lab Tests
              </h3>
              <p className="text-sm mb-6 ml-[3.25rem]" style={{ color: 'var(--color-ink-muted)' }}>
                Get these tests done, then come back and upload your report.
              </p>
              <div className="space-y-4">
                {result.aiResponse.recommendedTests.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-5 rounded-2xl transition-all"
                    style={{ backgroundColor: 'var(--color-paper-warm)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="mt-0.5 rounded-full p-1" style={{ backgroundColor: 'var(--color-teal-subtle)' }}>
                      <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-teal)' }} />
                    </div>
                    <div>
                      <p className="font-bold">{item.test}</p>
                      <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up stagger-3">
              <button
                onClick={() => navigate('/upload', { state: { symptomCheckId: result._id } })}
                className="flex-1 py-4 btn-primary rounded-xl flex items-center justify-center gap-2 group text-base"
              >
                Upload Lab Report
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => { setResult(null); setDescription(''); }}
                className="flex-1 py-4 btn-secondary rounded-xl text-base"
              >
                Check New Symptoms
              </button>
            </div>
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
