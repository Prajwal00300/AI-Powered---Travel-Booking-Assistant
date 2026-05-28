import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getTripById, deleteTrip } from '../api';
import Navbar from '../components/Navbar';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// Render a single key-value data item
const DataItem = ({ label, value }) => (
  <div className="data-item">
    <label>{label}</label>
    <span>{value || '—'}</span>
  </div>
);

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTripById(id);
        setTrip(res.data.data.trip);
      } catch {
        setError('Trip not found or you are not authorised to view it.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this trip? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteTrip(id);
      navigate('/dashboard');
    } catch {
      alert('Delete failed. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) return <><Navbar /><div className="page-container"><p style={{ color: '#999' }}>Loading trip...</p></div></>;
  if (error) return <><Navbar /><div className="page-container"><div className="error-msg">{error}</div></div></>;

  const { originalFileName, documentType, cloudinaryUrl, processingStatus,
    extractedRawText, extractedStructuredData: sd, generatedItinerary,
    uploadDate, processingError } = trip;

  const isImage = documentType === 'IMAGE';

  return (
    <>
      <Navbar />
      <div className="page-container">

        {/* Back + Delete */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="page-header" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span className="back-link" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </span>
            <button 
              className="btn-outline hide-on-print" 
              onClick={() => window.print()}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
            >
              📄 Export as PDF
            </button>
          </div>
          <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Trip'}
          </button>
        </div>

        {/* Header */}
        <div className="detail-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ border: 'none', padding: 0, marginBottom: '6px' }}>📄 {originalFileName}</h3>
              <p style={{ fontSize: '13px', color: '#888' }}>
                {documentType} · Uploaded {formatDate(uploadDate)}
              </p>
            </div>
            <span className={`badge badge-${processingStatus}`}>{processingStatus}</span>
          </div>

          {processingStatus === 'failed' && processingError && (
            <div className="error-msg" style={{ marginTop: '12px' }}>
              ⚠️ Processing error: {processingError}
            </div>
          )}
        </div>

        {/* Document Preview */}
        {cloudinaryUrl && (
          <div className="detail-section">
            <h3>Document Preview</h3>
            {isImage ? (
              <img src={cloudinaryUrl} alt="Travel document" className="doc-preview" />
            ) : (
              <a href={cloudinaryUrl} target="_blank" rel="noopener noreferrer">
                <button className="btn-sm">📥 Open PDF in New Tab</button>
              </a>
            )}
          </div>
        )}

        {/* Extracted Structured Data */}
        {sd && (
          <div className="detail-section">
            <h3>🤖 Extracted Travel Information</h3>
            <div className="data-grid">
              <DataItem label="Passenger Name" value={sd.passengerName} />
              <DataItem label="Document Type" value={sd.documentType} />
              <DataItem label="Flight / Train No" value={sd.flightNumber} />
              <DataItem label="Airline / Carrier" value={sd.airline} />
              <DataItem label="Departure City" value={sd.departureCity} />
              <DataItem label="Arrival City" value={sd.arrivalCity} />
              <DataItem label="Travel Date" value={sd.departureDate} />
              <DataItem label="Return Date" value={sd.returnDate} />
              <DataItem label="Seat" value={sd.seatNumber} />
              <DataItem label="Class" value={sd.travelClass} />
              <DataItem label="Booking Ref / PNR" value={sd.bookingReference} />
              <DataItem label="Hotel" value={sd.hotelName} />
              <DataItem label="Check-In" value={sd.hotelCheckIn} />
              <DataItem label="Check-Out" value={sd.hotelCheckOut} />
              <DataItem label="Total Amount" value={sd.totalAmount ? `${sd.totalAmount} ${sd.currency || ''}` : null} />
            </div>


          </div>
        )}

        {/* Generated Itinerary */}
        {generatedItinerary && (
          <div className="detail-section">
            <h3>✈️ AI-Generated Itinerary</h3>
            <div className="itinerary-content markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generatedItinerary}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Raw OCR Text (collapsible) */}
        {extractedRawText && (
          <div className="detail-section">
            <h3>📝 Raw OCR Text</h3>
            <div className="raw-text">{extractedRawText}</div>
          </div>
        )}

        {/* No data yet */}
        {!sd && !generatedItinerary && processingStatus !== 'failed' && (
          <div className="detail-section">
            <p style={{ color: '#999', fontSize: '14px' }}>
              ⏳ This document is still being processed. Please refresh in a moment.
            </p>
          </div>
        )}

      </div>
    </>
  );
};

export default TripDetail;
