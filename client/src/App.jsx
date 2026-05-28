import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home       from './pages/Home';
import Dashboard  from './pages/Dashboard';
import Upload     from './pages/Upload';
import TripDetail from './pages/TripDetail';
import SharedTrip from './pages/SharedTrip';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Home />} />
          <Route path="/shared/:id" element={<SharedTrip />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload"    element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;