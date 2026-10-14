import { AlertTriangle } from 'lucide-react';

export default function MedicalDisclaimer() {
  return (
    <div className="disclaimer-bar px-4 py-3 rounded-lg flex items-start gap-3 text-sm">
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-amber)' }} />
      <p style={{ color: 'var(--color-ink-light)' }} className="leading-relaxed">
        <span className="field-label" style={{ color: 'var(--color-amber)', marginRight: '0.5rem' }}>
          Medical Disclaimer
        </span>
        This tool provides general guidance only and is not a substitute for professional
        medical diagnosis. Please consult a licensed doctor for medical concerns, especially
        anything urgent.
      </p>
    </div>
  );
}
