import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
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
import StudentDashboard from './pages/students/StudentDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;