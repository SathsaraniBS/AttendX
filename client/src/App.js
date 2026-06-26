import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';

// Admin Pages
import Login from './pages/Login';
// import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import LiveAttendance from './pages/LiveAttendance';
import AttendanceHistory from './pages/attendance/AttendanceHistory';
import StudentList from './pages/students/StudentList';
import Reports from './pages/Reports';
import Classes from './pages/Classes';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Backup from './pages/Backup';
import Logs from './pages/Logs';

// ✅ Student Pages
import StudentDashboard from './pages/students/StudentDashboard';
import StudentAttendance from './pages/students/StudentAttendance';
import StudentProfile from './pages/students/StudentProfile';
import StudentMarkAttendance from './pages/students/StudentMarkAttendance';

import './index.css';

function App() {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>

        {/* ===== ADMIN ROUTES ===== */}
        <Route path="/" element={<Login />} />
        {/* <Route path="/register" element={<Register />} /> */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/live" element={<LiveAttendance />} />
        <Route path="/attendance" element={<AttendanceHistory />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="/logs" element={<Logs />} />

        {/* ===== STUDENT ROUTES ===== */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-attendance" element={<StudentAttendance />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/student-mark-attendance" element={<StudentMarkAttendance />} />
      </Routes>
    </Router>
  );
}

export default App;