import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token');
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  })();

  if (!token) return <Navigate to="/" replace />;

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/student-dashboard" replace />;
  }

  return children;
}