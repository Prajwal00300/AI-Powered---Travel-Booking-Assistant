import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Dashboard</h2>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '6px', background: '#fff' }}
        >
          Logout
        </button>
      </div>

      <p>Welcome, <strong>{user?.name}</strong> 👋</p>
      <p style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
        Email: {user?.email}
      </p>
      <p style={{ marginTop: '24px', color: '#999', fontSize: '13px' }}>
        Upload & Trip features coming next...
      </p>
    </div>
  );
};

export default Dashboard;
