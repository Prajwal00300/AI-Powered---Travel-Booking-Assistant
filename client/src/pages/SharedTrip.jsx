import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSharedTrip } from '../api';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const DataItem = ({ label, value }) => (
  <div className="data-item">
    <label>{label}</label>
    <span>{value || '—'}</span>
  </div>
);

const SharedTrip = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSharedTrip(id);
        setTrip(res.data.data.trip);
      } catch (err) {
        setError('This shared trip does not exist or has been made private.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="page-container"><p style={{ color: '#999', textAlign: 'center', marginTop: '50px' }}>Loading shared itinerary...</p></div>;
  if (error) return <div className="page-container"><div className="error-msg" style={{ marginTop: '50px' }}>{error}</div></div>;

  const { originalFileName, documentType, cloudinaryUrl, processingStatus,
    extractedStructuredData: sd, generatedItinerary, uploadDate } = trip;

  const isImage = documentType === 'IMAGE';

  return (
    <>
      {/* Simple Public Header */}
      <nav className="navbar hide-on-print" style={{ justifyContent: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '20px', letterSpacing: '-0.5px' }}>
          ✈️ Travel Assistant <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>Shared View</span>
        </h1>
      </nav>

      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button 
            className="btn-outline hide-on-print" 
            onClick={() => window.print()}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
          >
            📄 Export as PDF
          </button>
        </div>

        <div className="detail-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ border: 'none', padding: 0, marginBottom: '6px' }}>📄 {originalFileName}</h3>
              <p style={{ fontSize: '13px', color: '#888' }}>
                Uploaded {formatDate(uploadDate)}
              </p>
            </div>
            {processingStatus !== 'completed' && (
              <span className={`badge badge-${processingStatus}`}>{processingStatus}</span>
            )}
          </div>
        </div>

        {cloudinaryUrl && (
          <div className="detail-section hide-on-print">
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

        {sd && (
          <div className="detail-section">
            <h3>🤖 Extracted Travel Information</h3>
            <div className="data-grid">
              <DataItem label="Passenger Name" value={sd.passengerName} />
              <DataItem label="Flight / Train No" value={sd.flightNumber} />
              <DataItem label="Airline / Carrier" value={sd.airline} />
              <DataItem label="Departure City" value={sd.departureCity} />
              <DataItem label="Arrival City" value={sd.arrivalCity} />
              <DataItem label="Travel Date" value={sd.departureDate} />
              <DataItem label="Hotel" value={sd.hotelName} />
              <DataItem label="Check-In" value={sd.hotelCheckIn} />
              <DataItem label="Check-Out" value={sd.hotelCheckOut} />
            </div>
          </div>
        )}

        {generatedItinerary && (
          <div className="detail-section">
            <h3>✈️ Travel Itinerary</h3>
            <div className="itinerary-content markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generatedItinerary}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div className="hide-on-print" style={{ textAlign: 'center', marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Want to generate your own travel itineraries?</h3>
          <Link to="/register">
            <button className="btn" style={{ width: 'auto', padding: '8px 20px' }}>Create Free Account</button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default SharedTrip;
