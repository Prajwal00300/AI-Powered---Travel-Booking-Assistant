import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects unauthenticated users to /login
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
