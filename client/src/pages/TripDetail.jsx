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
  const [showShareModal, setShowShareModal] = useState(false);

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



  if (loading) return <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}><Navbar /><div className="page-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><div className="icon-spin" style={{ fontSize: '32px' }}>⏳</div></div></div>;
  if (error) return <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}><Navbar /><div className="page-container"><div className="error-msg">{error}</div></div></div>;

  const { originalFileName, documentType, cloudinaryUrl, processingStatus,
    extractedRawText, extractedStructuredData: sd, generatedItinerary,
    uploadDate, processingError } = trip;

  const isImage = documentType === 'IMAGE';

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="page-container animate-fade-in" style={{ flex: 1, padding: '40px 20px', maxWidth: '1000px', width: '100%' }}>

        {/* Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <span className="back-link" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn-outline hide-on-print"
              onClick={() => window.print()}
              style={{ width: 'auto', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', border: 'none', background: 'rgba(255, 255, 255, 0.6)' }}
            >
              📄 Export PDF
            </button>
            <button
              className="btn-outline hide-on-print"
              onClick={() => setShowShareModal(true)}
              style={{ width: 'auto', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', border: 'none', background: 'rgba(255, 255, 255, 0.6)' }}
            >
              🔗 Share
            </button>
            <button
              className="btn-outline hide-on-print"
              onClick={handleDelete} disabled={deleting}
              style={{ width: 'auto', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', border: '1px solid rgba(255, 77, 77, 0.3)', background: 'rgba(255, 77, 77, 0.05)', color: '#d63031' }}
            >
              {deleting ? 'Deleting...' : '🗑 Delete'}
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="detail-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="hide-on-print" style={{ fontSize: '40px' }}>{documentType === 'flight' ? '✈️' : documentType === 'hotel' ? '🏨' : '📄'}</div>
            <div>
              <h3 className="hide-on-print" style={{ border: 'none', padding: 0, marginBottom: '8px', fontSize: '28px', fontWeight: '800' }}>{originalFileName}</h3>
              <p style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                <span className="hide-on-print">UPLOADED </span>{formatDate(uploadDate).toUpperCase()}
              </p>
            </div>
          </div>
          <span className={`badge badge-${processingStatus} hide-on-print`} style={{ fontSize: '13px', padding: '8px 16px' }}>
            {processingStatus}
          </span>
        </div>

        {processingStatus === 'failed' && processingError && (
          <div className="error-msg" style={{ marginBottom: '24px' }}>
            ⚠️ Processing error: {processingError}
          </div>
        )}

        {/* Extracted Structured Data */}
        {sd && (
          <div className="detail-section">
            <h3>🤖 Extracted Travel Information</h3>
            <div className="data-grid">
              {sd.passengerName && <DataItem label="Passenger Name" value={sd.passengerName} />}
              {sd.documentType && <DataItem label="Document Type" value={sd.documentType} />}
              {sd.flightNumber && <DataItem label="Flight / Train No" value={sd.flightNumber} />}
              {sd.airline && <DataItem label="Airline / Carrier" value={sd.airline} />}
              {sd.departureCity && <DataItem label="Departure City" value={sd.departureCity} />}
              {sd.arrivalCity && <DataItem label="Arrival City" value={sd.arrivalCity} />}
              {sd.departureDate && <DataItem label="Travel Date" value={sd.departureDate} />}
              {sd.returnDate && <DataItem label="Return Date" value={sd.returnDate} />}
              {sd.seatNumber && <DataItem label="Seat" value={sd.seatNumber} />}
              {sd.travelClass && <DataItem label="Class" value={sd.travelClass} />}
              {sd.bookingReference && <DataItem label="Booking Ref / PNR" value={sd.bookingReference} />}
              {sd.hotelName && <DataItem label="Hotel" value={sd.hotelName} />}
              {sd.hotelCheckIn && <DataItem label="Check-In" value={sd.hotelCheckIn} />}
              {sd.hotelCheckOut && <DataItem label="Check-Out" value={sd.hotelCheckOut} />}
              {sd.totalAmount && <DataItem label="Total Amount" value={`${sd.totalAmount} ${sd.currency || ''}`} />}
            </div>
          </div>
        )}

        {/* Document Preview */}
        {cloudinaryUrl && isImage && (
          <div className="detail-section">
            <h3>🔍 Original Document</h3>
            <img src={cloudinaryUrl} alt="Travel document" className="doc-preview" />
          </div>
        )}

        {/* Generated Itinerary */}
        {generatedItinerary && (
          <div className="detail-section">
            <h3>✨ AI-Generated Itinerary</h3>
            <div className="itinerary-content markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generatedItinerary}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Raw OCR Text */}
        {extractedRawText && (
          <div className="detail-section hide-on-print">
            <h3>📝 Raw OCR Data</h3>
            <div className="raw-text">{extractedRawText}</div>
          </div>
        )}

        {/* No data yet */}
        {!sd && !generatedItinerary && processingStatus !== 'failed' && (
          <div className="detail-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="icon-spin" style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
            <h4 style={{ fontSize: '18px', color: '#111', marginBottom: '8px' }}>Processing your document...</h4>
            <p style={{ color: '#666', fontSize: '15px' }}>
              The AI is currently extracting data and generating your itinerary. Please refresh in a moment.
            </p>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="modal-overlay animate-fade-in" onClick={() => setShowShareModal(false)}>
            <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowShareModal(false)}>&times;</button>
              <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Share Trip</h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
                Anyone with this link will be able to view this itinerary and document.
              </p>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/shared/${id}`}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', background: '#f5f5f5', outline: 'none', fontSize: '14px', color: '#555' }}
                />
                <button
                  className="btn"
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${window.location.origin}/shared/${id}`);
                    alert('Copied to clipboard!');
                    setShowShareModal(false);
                  }}
                  style={{ width: 'auto', padding: '12px 24px', margin: 0, borderRadius: '8px', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', fontWeight: '600' }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TripDetail;
