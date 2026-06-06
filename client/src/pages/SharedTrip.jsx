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

  if (loading) return <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}><div className="page-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><div className="icon-spin" style={{ fontSize: '32px' }}>⏳</div></div></div>;
  if (error) return <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}><div className="page-container"><div className="error-msg" style={{ marginTop: '50px' }}>{error}</div></div></div>;

  const { originalFileName, documentType, cloudinaryUrl, processingStatus,
    extractedStructuredData: sd, generatedItinerary, uploadDate, fileReferences } = trip;

  const isImage = documentType === 'IMAGE';

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Simple Public Header */}
      <nav className="glass-panel hide-on-print" style={{ padding: '16px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          TravelAI Assistant <span style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginLeft: '10px' }}>Shared View</span>
        </h1>
      </nav>

      <div className="page-container animate-fade-in" style={{ flex: 1, padding: '40px 20px', maxWidth: '1000px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <button 
            className="btn-outline hide-on-print" 
            onClick={() => window.print()}
            style={{ width: 'auto', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', border: 'none', background: 'rgba(255, 255, 255, 0.6)' }}
          >
            📄 Export PDF
          </button>
        </div>

        {/* Header Section */}
        <div className="detail-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <h3 className="hide-on-print" style={{ border: 'none', padding: 0, marginBottom: '8px', fontSize: '28px', fontWeight: '800' }}>
                {documentType === 'MULTIPLE' ? `${fileReferences?.length || 0} Documents Merged` : originalFileName || "Trip Document"}
              </h3>
              <p style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                <span className="hide-on-print">UPLOADED </span>{formatDate(uploadDate).toUpperCase()}
              </p>
            </div>
          </div>
          {processingStatus !== 'completed' && (
            <span className={`badge badge-${processingStatus} hide-on-print`} style={{ fontSize: '13px', padding: '8px 16px' }}>
              {processingStatus}
            </span>
          )}
        </div>

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
        {(fileReferences?.length > 0 || cloudinaryUrl) && (
          <div className="detail-section">
            <h3>🔍 Original Document{fileReferences?.length > 1 ? 's' : ''}</h3>
            {fileReferences?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {fileReferences.map((ref, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ref.originalFileName}</p>
                    {ref.documentType === 'PDF' ? (
                       <a href={ref.cloudinaryUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '8px 16px', background: '#e74c3c', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>View PDF</a>
                    ) : (
                      <img src={ref.cloudinaryUrl} alt={`Doc ${idx+1}`} style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '8px', background: '#f5f5f5' }} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              documentType === 'PDF' ? (
                 <a href={cloudinaryUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '12px 24px', background: '#e74c3c', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>View Full PDF</a>
              ) : isImage ? (
                 <img src={cloudinaryUrl} alt="Travel document" className="doc-preview" />
              ) : null
            )}
          </div>
        )}

        {/* Generated Itinerary */}
        {generatedItinerary && (
          <div className="detail-section">
            <h3>✨ Travel Itinerary</h3>
            <div className="itinerary-content markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generatedItinerary}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div className="hide-on-print glass-panel" style={{ textAlign: 'center', marginTop: '40px', padding: '40px', borderRadius: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '800' }}>Want to generate your own travel itineraries?</h3>
          <Link to="/">
            <button className="btn" style={{ width: 'auto', padding: '12px 32px', borderRadius: '30px', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', fontWeight: '600' }}>Create Free Account</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedTrip;
