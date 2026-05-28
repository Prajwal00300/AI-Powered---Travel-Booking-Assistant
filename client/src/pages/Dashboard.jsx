import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllTrips, deleteTrip } from '../api';
import Navbar from '../components/Navbar';

const statusBadge = (status) => {
  const map = {
    completed:  'badge badge-completed',
    processing: 'badge badge-processing',
    failed:     'badge badge-failed',
    pending:    'badge badge-pending',
  };
  return map[status] || 'badge badge-pending';
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

const Dashboard = () => {
  const navigate = useNavigate();
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [deleting, setDeleting] = useState(null); // tripId being deleted

  const fetchTrips = async () => {
    try {
      const res = await getAllTrips();
      setTrips(res.data.data.trips);
    } catch {
      setError('Failed to fetch trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleDelete = async (e, tripId) => {
    e.stopPropagation(); // prevent card click / navigation
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    setDeleting(tripId);
    try {
      await deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t._id !== tripId));
    } catch {
      alert('Failed to delete trip. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="page-container animate-fade-in" style={{ flex: 1, padding: '40px 20px', maxWidth: '1000px', width: '100%' }}>
        <div className="page-header" style={{ marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111' }}>My Trips</h2>
            <p style={{ color: '#666', marginTop: '8px' }}>Manage and share your AI-generated travel itineraries.</p>
          </div>
          <Link to="/upload">
            <button className="btn" style={{ padding: '12px 28px', borderRadius: '30px', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', width: 'auto' }}>+ New Document</button>
          </Link>
        </div>

        {/* Stats Overview */}
        {!loading && trips.length > 0 && (
          <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '13px', color: '#666', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Documents</div>
              <div style={{ fontSize: '40px', fontWeight: '800', color: '#111', marginTop: '8px', lineHeight: '1' }}>{trips.length}</div>
            </div>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '13px', color: '#666', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed Itineraries</div>
              <div style={{ fontSize: '40px', fontWeight: '800', color: '#1e8449', marginTop: '8px', lineHeight: '1' }}>{trips.filter(t => t.processingStatus === 'completed').length}</div>
            </div>
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="trips-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton" style={{ height: '160px', width: '100%' }}></div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="empty-state animate-slide-up">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
            <h3 style={{ fontSize: '24px', color: '#111', marginBottom: '12px', fontWeight: '700' }}>No Trips Yet</h3>
            <p>Upload your first flight ticket or hotel booking to see the magic.</p>
            <Link to="/upload">
              <button className="btn" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', borderRadius: '30px', padding: '12px 32px', marginTop: '16px', width: 'auto' }}>Upload Document</button>
            </Link>
          </div>
        ) : (
          <div className="trips-grid animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {trips.map((trip) => (
              <div
                key={trip._id}
                className="trip-card"
                onClick={() => navigate(`/trips/${trip._id}`)}
              >
                <div className="trip-card-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{trip.documentType === 'flight' ? '✈️' : trip.documentType === 'hotel' ? '🏨' : '📄'}</span>
                    <h4 style={{ margin: 0 }}>{trip.originalFileName}</h4>
                  </div>
                  
                  {trip.extractedStructuredData?.departureCity && (
                    <p style={{ fontWeight: '600', color: '#333' }}>
                      {trip.extractedStructuredData.departureCity}
                      {trip.extractedStructuredData.arrivalCity &&
                        ` ➔ ${trip.extractedStructuredData.arrivalCity}`}
                    </p>
                  )}
                  {trip.extractedStructuredData?.passengerName && (
                    <p>👤 {trip.extractedStructuredData.passengerName}</p>
                  )}
                  <p style={{ marginTop: '12px', fontSize: '12px', color: '#888', fontWeight: '600' }}>
                    UPLOADED {formatDate(trip.uploadDate).toUpperCase()}
                  </p>
                </div>

                <div className="trip-card-actions">
                  <span className={statusBadge(trip.processingStatus)}>
                    {trip.processingStatus}
                  </span>
                  <button
                    className="btn-outline"
                    style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '12px', border: '1px solid rgba(255, 77, 77, 0.4)', color: '#d63031', marginTop: 'auto', background: 'rgba(255, 77, 77, 0.05)' }}
                    onClick={(e) => handleDelete(e, trip._id)}
                    disabled={deleting === trip._id}
                  >
                    {deleting === trip._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
