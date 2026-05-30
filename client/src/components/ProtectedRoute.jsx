import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;
  if (!user) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
