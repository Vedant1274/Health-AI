import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { reportAPI } from '../api/endpoints';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Upload,
  FileText,
  Image,
  Type,
  X,
  CheckCircle2,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

export default function ReportUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const symptomCheckId = location.state?.symptomCheckId || null;

  const [mode, setMode] = useState('file'); // 'file' or 'text'
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSetFile(selected);
  };

  const validateAndSetFile = (f) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(f.type)) {
      setError('Only PDF, JPEG, and PNG files are accepted.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }
    setFile(f);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      let reportId;

      if (mode === 'file' && file) {
        const formData = new FormData();
        formData.append('report', file);
        if (symptomCheckId) formData.append('symptomCheckId', symptomCheckId);

        const res = await reportAPI.upload(formData);
        reportId = res.data.reportId;
      } else if (mode === 'text' && rawText.trim().length >= 10) {
        const res = await reportAPI.uploadText(rawText.trim(), symptomCheckId);
        reportId = res.data.reportId;
      } else {
        setError('Please upload a file or paste your report text (at least 10 characters).');
        setLoading(false);
        return;
      }

      // Auto-analyze after upload
      await reportAPI.analyze(reportId);

      navigate(`/reports/${reportId}/result`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    if (file.type === 'application/pdf') return <FileText className="w-12 h-12" style={{ color: 'var(--color-teal)' }} />;
    return <Image className="w-12 h-12" style={{ color: 'var(--color-teal)' }} />;
  };

  return (
    <div className="w-full flex justify-center px-4 pb-12">
      <div className="w-full max-w-3xl">

      <div className="mt-8 animate-fade-in">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center"
               style={{ backgroundColor: 'var(--color-teal-wash)', border: '1px solid var(--color-border)' }}>
            <Upload className="w-7 h-7" style={{ color: 'var(--color-teal)' }} />
          </div>
          <div className="min-w-0 text-left">
            <h1 className="text-3xl font-bold truncate" style={{ color: 'var(--color-ink)' }}>Upload Report</h1>
            <p className="mt-1 truncate" style={{ color: 'var(--color-ink-muted)' }}>Upload your test report for AI analysis</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl p-1 mb-8"
             style={{ backgroundColor: 'var(--color-paper-warm)', border: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setMode('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
              mode === 'file'
                ? 'shadow-sm'
                : ''
            }`}
            style={{ 
              backgroundColor: mode === 'file' ? '#FFFFFF' : 'transparent',
              color: mode === 'file' ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              border: mode === 'file' ? '1px solid var(--color-border)' : '1px solid transparent'
            }}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
          <button
            onClick={() => setMode('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
              mode === 'text'
                ? 'shadow-sm'
                : ''
            }`}
            style={{ 
              backgroundColor: mode === 'text' ? '#FFFFFF' : 'transparent',
              color: mode === 'text' ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              border: mode === 'text' ? '1px solid var(--color-border)' : '1px solid transparent'
            }}
          >
            <Type className="w-4 h-4" />
            Paste Text
          </button>
        </div>

        <div className="card p-6 md:p-8 animate-slide-up relative overflow-hidden">
          
          {mode === 'file' ? (
            <>
              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden`}
                style={{
                  borderColor: dragActive ? 'var(--color-teal)' : file ? 'var(--color-sage)' : 'var(--color-border)',
                  backgroundColor: dragActive ? 'var(--color-teal-wash)' : file ? 'var(--color-sage-subtle)' : 'var(--color-paper)',
                }}
              >

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="relative z-10">
                  {file ? (
                    <div className="flex flex-col items-center gap-4 animate-scale-in">
                      {getFileIcon()}
                      <div>
                        <p className="font-bold text-lg" style={{ color: 'var(--color-ink)' }}>{file.name}</p>
                        <p className="text-sm mt-1 data-value" style={{ color: 'var(--color-ink-muted)' }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="badge-normal text-sm font-bold mt-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Ready to analyze
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="mt-4 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        style={{ color: 'var(--color-ink-muted)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-emergency)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-ink-muted)'}
                      >
                        <X className="w-4 h-4" />
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                           style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                        <Upload className="w-10 h-10" style={{ color: 'var(--color-ink-muted)' }} />
                      </div>
                      <div>
                        <p className="font-bold text-lg" style={{ color: 'var(--color-ink)' }}>
                          {dragActive ? 'Drop it here!' : 'Click or drag & drop'}
                        </p>
                        <p className="text-sm mt-2 font-medium" style={{ color: 'var(--color-ink-muted)' }}>
                          Supports PDF, JPEG, PNG (max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Text Paste Mode */}
              <label className="field-label block mb-3 ml-1">
                Paste the contents of your lab report
              </label>
              <div className="relative">
                <textarea
                  value={rawText}
                  onChange={(e) => { setRawText(e.target.value); setError(''); }}
                  placeholder="Example:&#10;Hemoglobin: 12.5 g/dL&#10;WBC: 7,500 /μL&#10;Platelet Count: 250,000 /μL"
                  rows={10}
                  className="w-full px-5 py-4 rounded-xl resize-none data-value text-sm"
                  maxLength={10000}
                />
                <div className="absolute bottom-3 right-4 text-xs font-medium px-2 py-1 rounded-md"
                     style={{ color: 'var(--color-ink-muted)', backgroundColor: 'var(--color-paper-warm)' }}>
                  {rawText.length}/10000
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-xl text-sm flex items-center gap-2"
                 style={{ backgroundColor: 'var(--color-amber-subtle)', border: '1px solid var(--color-amber-wash)', color: 'var(--color-amber)' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-center" style={{ marginTop: '2rem' }}>
            <button
              onClick={handleSubmit}
              disabled={loading || (mode === 'file' ? !file : rawText.trim().length < 10)}
              className="w-full max-w-sm py-4 btn-primary rounded-xl flex items-center justify-center gap-2 text-lg font-bold group shadow-md"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                <>
                  Upload & Analyze
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {loading && (
            <div className="mt-6 text-center animate-pulse-soft">
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-teal)' }}>Processing Report...</p>
              <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>Extracting data and analyzing parameters</p>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '4rem' }}>
        <MedicalDisclaimer />
      </div>
      </div>
    </div>
  );
}
