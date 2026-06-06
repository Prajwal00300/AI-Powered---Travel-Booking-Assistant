import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument, createManualTrip } from '../api';
import Navbar from '../components/Navbar';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_SIZE_MB = 10;

const PIPELINE_STEPS = [
  { key: 'uploading', label: '📤 Uploading to Cloudinary...' },
  { key: 'ocr', label: '🔍 Extracting text (OCR)...' },
  { key: 'parsing', label: '🤖 Parsing with Gemini AI...' },
  { key: 'itinerary', label: '✈️  Generating itinerary...' },
  { key: 'saving', label: '💾 Finalizing...' },
];

const Upload = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);

  const [activeTab, setActiveTab] = useState('upload');
  const [manualCategory, setManualCategory] = useState('FLIGHT_TICKET');
  const [manualData, setManualData] = useState({
    arrivalCity: '',
    departureCity: '',
    departureDate: '',
    returnDate: '',
    airline: '',
    flightNumber: '',
    trainNumber: '',
    hotelName: '',
    hotelCheckIn: '',
    hotelCheckOut: '',
    preferences: ''
  });

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { documentType: manualCategory, ...manualData };
      const res = await createManualTrip(payload);
      navigate(`/trips/${res.data.data.trip._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate itinerary.');
    } finally {
      setLoading(false);
    }
  };

  const processSelectedFiles = (selectedFiles) => {
    setError('');
    setCurrentStep(-1);

    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles = Array.from(selectedFiles);
    if (files.length + newFiles.length > 5) {
      setError('You can only upload up to 5 documents at a time.');
      return;
    }

    const validFiles = [];
    for (let f of newFiles) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`Unsupported file type: ${f.name}. Only JPEG, PNG, WEBP, GIF, or PDF.`);
        return;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File too large: ${f.name}. Maximum size is ${MAX_SIZE_MB}MB.`);
        return;
      }
      validFiles.push(f);
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    processSelectedFiles(e.target.files);
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
      processSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) { setError('Please select at least one file first.'); return; }

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
    }, 3500);

    try {
      const formData = new FormData();
      files.forEach(f => formData.append('documents', f));

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
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Create Itinerary</h2>
          <p style={{ color: '#666', marginBottom: '32px' }}>Upload a document or manually enter details to generate your AI itinerary.</p>

          {/* Tab Selector */}
          <div className="tab-selector">
            <button
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => { setActiveTab('upload'); setError(''); }}
            >
              📤 Smart Upload
            </button>
            <button
              className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
              onClick={() => { setActiveTab('manual'); setError(''); }}
            >
              ✍️ Manual Entry
            </button>
          </div>

          {activeTab === 'upload' && (
            <>
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
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                  style={{ display: 'none' }}
                />

                {files.length === 0 ? (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📤</div>
                    <p style={{ fontWeight: '600', color: '#333' }}>Click to browse files or drag and drop</p>
                    <p className="file-hint">Supported formats: JPEG, PNG, WEBP, GIF, PDF (Max 10MB each)</p>
                  </>
                ) : (
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: '700', color: '#1e3c72', marginBottom: '16px', textAlign: 'center' }}>{files.length} Document(s) Selected</p>
                    {files.map((f, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.9)', padding: '12px 16px', borderRadius: '12px', marginBottom: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '16px' }}>
                          <span style={{ fontWeight: '600', color: '#333' }}>📄 {f.name}</span>
                          <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        {!loading && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveFile(index); }} style={{ border: 'none', background: '#ffebee', color: '#c0392b', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        )}
                      </div>
                    ))}
                    {!loading && files.length < 5 && (
                      <p style={{ color: '#1e3c72', fontSize: '14px', marginTop: '16px', fontWeight: '600', textDecoration: 'underline', textAlign: 'center' }}>
                        + Add more documents
                      </p>
                    )}
                  </div>
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
                    else if (i === currentStep) className += ' active';
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
                      Done! Redirecting to your itinerary...
                    </div>
                  )}
                </div>
              )}
              <div style={{ marginTop: '32px' }}>
                <button
                  className="btn"
                  onClick={handleUpload}
                  disabled={loading || files.length === 0}
                  style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', borderRadius: '30px', padding: '14px 40px', fontSize: '16px', fontWeight: '600' }}
                >
                  {loading ? 'Processing...' : 'Upload & Process with AI'}
                </button>
              </div>
            </>
          )}

          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} style={{ textAlign: 'left' }} className="animate-fade-in">
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="premium-label">Category</label>
                <select
                  className="premium-input"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  disabled={loading}
                >
                  <option value="FLIGHT_TICKET"> Flight Ticket</option>
                  <option value="TRAIN_TICKET"> Train Ticket</option>
                  <option value="HOTEL_BOOKING"> Hotel Booking</option>
                  <option value="OTHER">General Travel Plan</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {manualCategory === 'FLIGHT_TICKET' && (
                  <>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="premium-label">Airline (Optional)</label>
                      <input type="text" className="premium-input" placeholder="e.g. Delta" value={manualData.airline} onChange={e => setManualData({ ...manualData, airline: e.target.value })} disabled={loading} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="premium-label">Flight Number (Optional)</label>
                      <input type="text" className="premium-input" placeholder="e.g. DL123" value={manualData.flightNumber} onChange={e => setManualData({ ...manualData, flightNumber: e.target.value })} disabled={loading} />
                    </div>
                  </>
                )}
                {manualCategory === 'TRAIN_TICKET' && (
                  <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                    <label className="premium-label">Train Number / Name (Optional)</label>
                    <input type="text" className="premium-input" placeholder="e.g. Eurostar 9014" value={manualData.trainNumber} onChange={e => setManualData({ ...manualData, trainNumber: e.target.value })} disabled={loading} />
                  </div>
                )}
                {manualCategory === 'HOTEL_BOOKING' && (
                  <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                    <label className="premium-label">Hotel Name (Optional)</label>
                    <input type="text" className="premium-input" placeholder="e.g. Hilton Tokyo" value={manualData.hotelName} onChange={e => setManualData({ ...manualData, hotelName: e.target.value })} disabled={loading} />
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label">{manualCategory === 'HOTEL_BOOKING' ? 'City' : 'Destination City'}</label>
                  <input type="text" className="premium-input" placeholder="e.g. Tokyo" value={manualData.arrivalCity} onChange={e => setManualData({ ...manualData, arrivalCity: e.target.value })} disabled={loading} required />
                </div>
                {manualCategory !== 'HOTEL_BOOKING' && manualCategory !== 'OTHER' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="premium-label">Departure City</label>
                    <input type="text" className="premium-input" placeholder="e.g. New York" value={manualData.departureCity} onChange={e => setManualData({ ...manualData, departureCity: e.target.value })} disabled={loading} required />
                  </div>
                )}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label">{manualCategory === 'HOTEL_BOOKING' ? 'Check-in Date' : 'Departure Date'}</label>
                  <input type="date" className="premium-input" value={manualData.departureDate} onChange={e => setManualData({ ...manualData, departureDate: e.target.value })} disabled={loading} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="premium-label">{manualCategory === 'HOTEL_BOOKING' ? 'Check-out Date' : 'Return Date (Optional)'}</label>
                  <input type="date" className="premium-input" value={manualData.returnDate} onChange={e => setManualData({ ...manualData, returnDate: e.target.value })} disabled={loading} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label className="premium-label">Travel Preferences (Optional)</label>
                <input type="text" className="premium-input" placeholder="e.g. Relaxing, family friendly, highly adventurous" value={manualData.preferences} onChange={e => setManualData({ ...manualData, preferences: e.target.value })} disabled={loading} />
              </div>

              {error && <div className="error-msg" style={{ marginBottom: '24px', textAlign: 'left' }}>{error}</div>}

              <button
                type="submit"
                className="btn"
                disabled={loading || !manualData.arrivalCity || !manualData.departureDate}
                style={{ width: '100%', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', borderRadius: '30px', padding: '14px', fontSize: '16px', fontWeight: '600' }}
              >
                {loading ? 'Generating...' : 'Generate Itinerary'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Upload;
