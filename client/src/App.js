import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LiveAttendance from './pages/LiveAttendance';
import AttendanceHistory from './pages/attendance/AttendanceHistory';
import StudentList from './pages/students/StudentList';
import AddStudent from './pages/students/AddStudent';
import StudentProfile from './pages/students/StudentProfile';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Classes from './pages/Classes';
import './index.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/live" element={<LiveAttendance />} />
        <Route path="/attendance" element={<AttendanceHistory />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/add" element={<AddStudent />} />
        <Route path="/students/:id" element={<StudentProfile />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/classes" element={<Classes />} />
      </Routes>
    </Router>
  );
}

export default App;