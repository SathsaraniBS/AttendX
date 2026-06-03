import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveAttendance from './pages/LiveAttendance';
import StudentList from './pages/students/StudentList';
import AddStudent from './pages/students/AddStudent';
import StudentProfile from './pages/students/StudentProfile';
import DailyAttendance from './pages/attendance/DailyAttendance';
import AttendanceHistory from './pages/attendance/AttendanceHistory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/live" element={<LiveAttendance />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/add" element={<AddStudent />} />
        <Route path="/students/:id" element={<StudentProfile />} />
        <Route path="/attendance" element={<DailyAttendance />} />
        <Route path="/attendance/history" element={<AttendanceHistory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;