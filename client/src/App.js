import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import LiveAttendance from './pages/LiveAttendance';
import AttendanceHistory from './pages/attendance/AttendanceHistory';
import StudentList from './pages/students/StudentList';
import AddStudent from './pages/students/AddStudent';
import StudentProfile from './pages/students/StudentProfile';
import Reports from './pages/Reports';
import Classes from './pages/Classes';

import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import './index.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/live" element={<LiveAttendance />} />
        <Route path="/attendance" element={<AttendanceHistory />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/add" element={<AddStudent />} />
        <Route path="/students/:id" element={<StudentProfile />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/classes" element={<Classes />} />

        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />

      </Routes>
    </Router>
  );
}

export default App;