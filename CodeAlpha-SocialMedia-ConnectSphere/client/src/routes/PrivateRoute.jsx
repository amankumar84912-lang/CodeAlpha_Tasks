import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  // Wait until session is restored before deciding
  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
        <span>Loading…</span>
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
}
