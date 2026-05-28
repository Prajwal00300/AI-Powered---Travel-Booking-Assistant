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
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2>My Trips</h2>
          <Link to="/upload">
            <button className="btn-sm">+ New Upload</button>
          </Link>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <p style={{ color: '#999', fontSize: '14px' }}>Loading trips...</p>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <p>No trips yet. Upload your first travel document to get started.</p>
            <Link to="/upload">
              <button className="btn-sm">Upload Document</button>
            </Link>
          </div>
        ) : (
          <div className="trips-grid">
            {trips.map((trip) => (
              <div
                key={trip._id}
                className="trip-card"
                onClick={() => navigate(`/trips/${trip._id}`)}
              >
                <div className="trip-card-info">
                  <h4>📄 {trip.originalFileName}</h4>
                  <p>Type: {trip.documentType}</p>
                  {trip.extractedStructuredData?.departureCity && (
                    <p>
                      {trip.extractedStructuredData.departureCity}
                      {trip.extractedStructuredData.arrivalCity &&
                        ` → ${trip.extractedStructuredData.arrivalCity}`}
                    </p>
                  )}
                  {trip.extractedStructuredData?.passengerName && (
                    <p>Passenger: {trip.extractedStructuredData.passengerName}</p>
                  )}
                  <p style={{ marginTop: '6px', fontSize: '12px', color: '#aaa' }}>
                    Uploaded: {formatDate(trip.uploadDate)}
                  </p>
                </div>

                <div className="trip-card-actions">
                  <span className={statusBadge(trip.processingStatus)}>
                    {trip.processingStatus}
                  </span>
                  <button
                    className="btn-danger"
                    onClick={(e) => handleDelete(e, trip._id)}
                    disabled={deleting === trip._id}
                  >
                    {deleting === trip._id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
