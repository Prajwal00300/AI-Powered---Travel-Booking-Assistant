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

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
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
    <>
      <Navbar />
      <div className="page-container" style={{ maxWidth: '600px' }}>
        <div className="page-header">
          <h2>Upload Travel Document</h2>
        </div>

        <div className="upload-box">
          <p>Select a flight ticket, hotel booking, train ticket, or any travel invoice.</p>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
            onChange={handleFileChange}
            disabled={loading}
          />
          {file && (
            <p style={{ fontSize: '13px', color: '#333', marginTop: '8px' }}>
              📄 <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          <p className="file-hint">Supported: JPEG, PNG, WEBP, GIF, PDF — Max 10MB</p>
        </div>

        {error && <div className="error-msg" style={{ marginTop: '16px' }}>{error}</div>}

        {/* Pipeline status */}
        {currentStep >= 0 && (
          <div className="upload-status">
            {PIPELINE_STEPS.map((step, i) => {
              let className = 'step';
              if (i < currentStep || allDone) className += ' done';
              else if (i === currentStep)     className += ' active';
              return (
                <div key={step.key} className={className}>
                  {i < currentStep || allDone ? '✅' : i === currentStep ? '⏳' : '○'} {step.label}
                </div>
              );
            })}
            {allDone && (
              <div style={{ marginTop: '10px', color: '#1e8449', fontWeight: 600 }}>
                🎉 Done! Redirecting to your itinerary...
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={loading || !file}
          >
            {loading ? 'Processing...' : 'Upload & Process'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Upload;
