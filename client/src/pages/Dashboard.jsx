import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllTrips, deleteTrip } from '../api';
import Navbar from '../components/Navbar';

const statusBadge = (status) => {
  const map = {
    completed: 'badge badge-completed',
    processing: 'badge badge-processing',
    failed: 'badge badge-failed',
    pending: 'badge badge-pending',
  };
  return map[status] || 'badge badge-pending';
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

const Dashboard = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        <div className="page-header" style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Dashboard</p>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#111', letterSpacing: '-0.5px' }}>My Trips</h2>
          </div>
          <Link to="/upload" style={{ textDecoration: 'none' }}>
            <button className="btn" style={{ padding: '14px 32px', borderRadius: '30px', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', boxShadow: '0 8px 24px rgba(30, 60, 114, 0.2)', fontWeight: '700', fontSize: '15px', transition: 'all 0.3s ease' }}>
              + Create Itinerary
            </button>
          </Link>
        </div>

        {/* Stats Overview */}
        {!loading && trips.length > 0 && (
          <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(255,255,255,0.8)' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Documents</div>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#111', marginTop: '4px', lineHeight: '1' }}>{trips.length}</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(255,255,255,0.8)' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Completed Itineraries</div>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e8449', marginTop: '4px', lineHeight: '1' }}>{trips.filter(t => t.processingStatus === 'completed').length}</div>
              </div>
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
          <div className="empty-state animate-slide-up" style={{ padding: '100px 20px', background: 'transparent', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '32px' }}>
            <h3 style={{ fontSize: '28px', color: '#111', marginBottom: '12px', fontWeight: '800', letterSpacing: '-0.5px' }}>Your journey begins here</h3>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '32px' }}>Upload your flight tickets, hotel bookings, or manually enter your plans to generate your first AI itinerary.</p>
            <Link to="/upload" style={{ textDecoration: 'none' }}>
              <button className="btn" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', borderRadius: '30px', padding: '14px 40px', width: 'auto', fontWeight: '700', fontSize: '16px', boxShadow: '0 8px 24px rgba(30, 60, 114, 0.2)' }}>
                Start Planning
              </button>
            </Link>
          </div>
        ) : (
          <div className="trips-grid animate-slide-up" style={{ animationDelay: '0.1s', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {trips.map((trip) => {
              return (
                <div
                  key={trip._id}
                  className="trip-card"
                  onClick={() => navigate(`/trips/${trip._id}`)}
                  style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(255, 255, 255, 0.85)', display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <span className={statusBadge(trip.processingStatus)} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                      {trip.processingStatus}
                    </span>
                  </div>

                  <div className="trip-card-info" style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#111', marginBottom: '12px', lineHeight: '1.3' }}>
                      {trip.documentType === 'MULTIPLE' ? `${trip.fileReferences?.length || 0} Documents Merged` : trip.originalFileName || 'Trip Document'}
                    </h4>

                    {trip.extractedStructuredData?.departureCity && (
                      <p style={{ fontWeight: '600', color: '#444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {trip.extractedStructuredData.departureCity}
                        {trip.extractedStructuredData.arrivalCity && (
                          <>
                            <span style={{ color: '#aaa' }}>➔</span>
                            {trip.extractedStructuredData.arrivalCity}
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#888', fontWeight: '700', letterSpacing: '0.5px' }}>
                      {formatDate(trip.uploadDate).toUpperCase()}
                    </p>
                    <button
                      className="btn-outline"
                      style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '12px', border: 'none', color: '#d63031', background: 'rgba(255, 77, 77, 0.1)', fontWeight: '700' }}
                      onClick={(e) => handleDelete(e, trip._id)}
                      disabled={deleting === trip._id}
                    >
                      {deleting === trip._id ? 'Deleting....' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
