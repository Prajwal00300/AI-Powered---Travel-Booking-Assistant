import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-panel hide-on-print" style={{ padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
      <Link to="/dashboard" className="gradient-text" style={{ fontSize: '20px', fontWeight: '800', textDecoration: 'none' }}>
        TravelAI Assistant
      </Link>
      <div className="navbar-right">
        <span className="navbar-user" style={{ fontWeight: '500' }}>Hi, {user?.name}</span>
        <Link to="/upload">
          <button className="btn" style={{ padding: '8px 20px', borderRadius: '20px', margin: '0', width: 'auto' }}>+ Upload</button>
        </Link>
        <button className="btn-outline" style={{ padding: '8px 20px', borderRadius: '20px' }} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
