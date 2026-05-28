import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../api';
import Navbar from '../components/Navbar';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_SIZE_MB = 10;

const PIPELINE_STEPS = [
  { key: 'uploading',   label: '📤 Uploading to Cloudinary...' },
  { key: 'ocr',         label: '🔍 Extracting text (OCR)...' },
  { key: 'parsing',     label: '🤖 Parsing with Gemini AI...' },
  { key: 'itinerary',   label: '✈️  Generating itinerary (this takes 10-15 seconds)...' },
  { key: 'saving',      label: '💾 Finalizing...' },
];

const Upload = () => {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [file, setFile]             = useState(null);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [currentStep, setCurrentStep] = useState(-1); // -1 = not started
  const [isDragging, setIsDragging] = useState(false);

  const processSelectedFile = (selected) => {
    setError('');
    setCurrentStep(-1);

    if (!selected) { setFile(null); return; }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, WEBP, GIF, or PDF.');
      setFile(null);
      return;
    }

    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleFileChange = (e) => {
    processSelectedFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (loading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a file first.'); return; }

    setLoading(true);
    setError('');

    // Simulate step progression while the backend processes
    // The real pipeline runs server-side; we animate steps for UX
    let step = 0;
    setCurrentStep(0);
    const stepInterval = setInterval(() => {
      step += 1;
      if (step < PIPELINE_STEPS.length) {
        setCurrentStep(step);
      } else {
        clearInterval(stepInterval);
      }
    }, 3500); // advance step every 3.5s

    try {
      const formData = new FormData();
      formData.append('document', file);

      const res = await uploadDocument(formData);
      clearInterval(stepInterval);
      setCurrentStep(PIPELINE_STEPS.length); // all done

      const tripId = res.data.data.trip._id;
      navigate(`/trips/${tripId}`);
    } catch (err) {
      clearInterval(stepInterval);
      setCurrentStep(-1);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const allDone = currentStep === PIPELINE_STEPS.length;

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="page-container animate-fade-in" style={{ flex: 1, maxWidth: '700px', width: '100%', padding: '40px 20px' }}>
        
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Upload Document</h2>
          <p style={{ color: '#666', marginBottom: '32px' }}>Submit your flight ticket, hotel booking, or travel invoice.</p>

          <div 
            className={`upload-dropzone ${isDragging ? 'drag-active' : ''}`}
            onClick={() => !loading && fileRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
              borderColor: isDragging ? '#1e3c72' : undefined, 
              background: isDragging ? 'rgba(255,255,255,0.9)' : undefined,
              boxShadow: isDragging ? '0 8px 32px rgba(0, 0, 0, 0.05)' : undefined
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
              onChange={handleFileChange}
              disabled={loading}
              style={{ display: 'none' }}
            />
            
            {!file ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📤</div>
                <p style={{ fontWeight: '600', color: '#333' }}>Click to browse files</p>
                <p className="file-hint">Supported formats: JPEG, PNG, WEBP, GIF, PDF (Max 10MB)</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <p style={{ fontWeight: '700', color: '#1e3c72', fontSize: '18px' }}>{file.name}</p>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                {!loading && (
                  <p style={{ color: '#1e3c72', fontSize: '13px', marginTop: '16px', fontWeight: '600', textDecoration: 'underline' }}>
                    Click to change file
                  </p>
                )}
              </>
            )}
          </div>

          {error && <div className="error-msg" style={{ marginTop: '24px', textAlign: 'left' }}>{error}</div>}

          {/* Pipeline status */}
          {currentStep >= 0 && (
            <div className="upload-status-card animate-slide-up">
              <h4 style={{ marginBottom: '16px', color: '#111', fontWeight: '700' }}>AI Processing Pipeline</h4>
              {PIPELINE_STEPS.map((step, i) => {
                let className = 'status-step';
                if (i < currentStep || allDone) className += ' done';
                else if (i === currentStep)     className += ' active';
                return (
                  <div key={step.key} className={className}>
                    {i < currentStep || allDone ? '✅' : i === currentStep ? (
                      <span className="icon-spin">⏳</span>
                    ) : '○'} 
                    {step.label}
                  </div>
                );
              })}
              {allDone && (
                <div style={{ marginTop: '20px', color: '#1e8449', fontWeight: 700, textAlign: 'center' }}>
                  🎉 Done! Redirecting to your itinerary...
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '32px' }}>
            <button
              className="btn"
              onClick={handleUpload}
              disabled={loading || !file}
              style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', borderRadius: '30px', padding: '14px 40px', fontSize: '16px', fontWeight: '600' }}
            >
              {loading ? 'Processing...' : 'Upload & Process with AI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
