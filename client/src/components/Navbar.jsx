import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">✈️ Travel Assistant</Link>
      <div className="navbar-right">
        <span className="navbar-user">Hi, {user?.name}</span>
        <Link to="/upload">
          <button className="btn-sm">+ Upload</button>
        </Link>
        <button className="btn-outline" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
