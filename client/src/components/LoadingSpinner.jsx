const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export default function LoadingSpinner({ size = 'md', text = '', className = '' }) {
  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {/* Calm EKG-style vitals pulse line */}
      <svg className={dim} viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 14 L10 14 L14 6 L18 20 L22 10 L26 14 L38 14"
          stroke="var(--color-teal)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-vitals-pulse"
        />
      </svg>
      {text && (
        <p className="text-sm font-medium animate-vitals-pulse" style={{ color: 'var(--color-ink-muted)' }}>
          {text}
        </p>
      )}
    </div>
  );
}
