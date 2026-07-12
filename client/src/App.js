import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// ===== ADMIN PAGES =====
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AttendanceHistory from './pages/attendance/AttendanceHistory';
import StudentList from './pages/students/StudentList';
import Reports from './pages/Reports';
import Classes from './pages/Classes';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Backup from './pages/Backup';
import Logs from './pages/Logs';

// ===== STUDENT PAGES =====
import StudentDashboard from './pages/students/StudentDashboard';
import StudentAttendance from './pages/students/StudentAttendance';
import StudentProfile from './pages/students/StudentProfile';
import StudentMarkAttendance from './pages/students/StudentMarkAttendance';

function App() {
  return (
    <Router>
      <Routes>

        {/* ===== PUBLIC ROUTE (Login only) ===== */}
        <Route path="/" element={<Login />} />

        {/* ===== ADMIN ROUTES (admin only) ===== */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>
        } />
       
        <Route path="/attendance" element={
          <ProtectedRoute adminOnly={true}><AttendanceHistory /></ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute adminOnly={true}><StudentList /></ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute adminOnly={true}><Reports /></ProtectedRoute>
        } />
        <Route path="/classes" element={
          <ProtectedRoute adminOnly={true}><Classes /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute adminOnly={true}><Settings /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute adminOnly={true}><Notifications /></ProtectedRoute>
        } />
        <Route path="/backup" element={
          <ProtectedRoute adminOnly={true}><Backup /></ProtectedRoute>
        } />
        <Route path="/logs" element={
          <ProtectedRoute adminOnly={true}><Logs /></ProtectedRoute>
        } />

        {/* ===== STUDENT ROUTES ===== */}
        <Route path="/student-dashboard" element={
          <ProtectedRoute><StudentDashboard /></ProtectedRoute>
        } />
        <Route path="/student-attendance" element={
          <ProtectedRoute><StudentAttendance /></ProtectedRoute>
        } />
        <Route path="/student-profile" element={
          <ProtectedRoute><StudentProfile /></ProtectedRoute>
        } />
        <Route path="/student-mark-attendance" element={
          <ProtectedRoute><StudentMarkAttendance /></ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;