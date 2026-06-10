import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MdCalendarToday, MdBarChart,
  MdCheckCircle, MdCancel, MdAccessTime,
  MdTrendingUp, MdWarning
} from 'react-icons/md';
import StudentSidebar from '../../components/StudentComponents/StudentSidebar';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('student_token');
    const userData = localStorage.getItem('student_user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData) {
        const parsed = JSON.parse(userData);
        setStudent(parsed);
        fetchRecentAttendance(parsed.id, token);
      }
    } catch { navigate('/'); }
  }, [navigate]);

  const fetchRecentAttendance = async (studentId, token) => {
    setLoadingRecords(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/attendance/student/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      setRecentRecords(res.data?.slice(0, 5) || []);
    } catch {
      setRecentRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    navigate('/');
  };

  const attendanceRate = student?.attendance || 0;
  const attendanceColor = attendanceRate >= 85
    ? 'text-green-500' : attendanceRate >= 75
    ? 'text-yellow-500' : 'text-red-500';

  // ✅ Real stats from API records
  const presentCount = recentRecords.filter(r => r.status === 'Present').length;
  const absentCount  = recentRecords.filter(r => r.status === 'Absent').length;
  const lateCount    = recentRecords.filter(r => r.status === 'Late').length;

  if (!student) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">

      <StudentSidebar student={student} onLogout={handleLogout}/>

      <div className="flex-1 ml-56">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <h1 className="text-lg font-semibold text-gray-800">Student Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm border border-gray-200 rounded-lg px-3 py-1.5">
              <MdCalendarToday className="w-4 h-4"/>
              <span>{new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                {student?.name?.charAt(0)}
              </div>
              <span className="text-gray-700 text-sm">{student?.name}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold">
                {student?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-blue-100 text-sm">Welcome back,</p>
                <h2 className="text-2xl font-bold">{student?.name}</h2>
                <p className="text-blue-100 text-sm mt-1">{student?.className}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: MdBarChart, color: attendanceColor, bg: 'bg-blue-50' },
              { label: 'Present Days', value: presentCount, icon: MdCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Absent Days', value: absentCount, icon: MdCancel, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Late Arrivals', value: lateCount, icon: MdAccessTime, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${s.color}`}/>
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Attendance Overview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MdTrendingUp className="w-5 h-5 text-blue-500"/>
              Attendance Overview
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={attendanceRate >= 85 ? '#22c55e' : attendanceRate >= 75 ? '#eab308' : '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray={`${attendanceRate}, 100`}/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${attendanceColor}`}>{attendanceRate}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {attendanceRate < 75 && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                    <MdWarning className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <p className="text-sm font-medium text-red-700">Low Attendance Warning!</p>
                      <p className="text-xs text-red-500 mt-0.5">
                        Minimum 75% required. Need {75 - attendanceRate}% more.
                      </p>
                    </div>
                  </div>
                )}
                {attendanceRate >= 85 && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                    <MdCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"/>
                    <p className="text-sm font-medium text-green-700">Excellent attendance! Keep it up!</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-400 text-xs">Student ID</p>
                    <p className="font-mono font-medium text-gray-700 text-sm">{student?.studentId}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-400 text-xs">Class</p>
                    <p className="font-medium text-gray-700 text-sm">{student?.className}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Recent Attendance — API Data */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Recent Attendance</h3>
              <button
                onClick={() => navigate('/student-attendance')}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                View All →
              </button>
            </div>

            {/* Loading */}
            {loadingRecords ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"/>
              </div>
            ) : recentRecords.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Date', 'Day', 'Status', 'Check-in Time', 'Class'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map((rec, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                      <td className="px-5 py-3 text-sm text-gray-600">{rec.date}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{rec.day || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium
                          ${rec.status === 'Present'
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : rec.status === 'Late'
                            ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                            : 'bg-red-50 text-red-500 border-red-100'}`}>
                          {rec.status === 'Present'
                            ? <><MdCheckCircle className="w-3 h-3"/> Present</>
                            : rec.status === 'Late'
                            ? <><MdAccessTime className="w-3 h-3"/> Late</>
                            : <><MdCancel className="w-3 h-3"/> Absent</>}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{rec.time || '—'}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                          {student?.className}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (

              /* ✅ Empty State */
              <div className="text-center py-12">
                <MdCalendarToday className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-400 font-medium">No attendance records yet</p>
                <p className="text-gray-300 text-sm mt-1">
                  Attendance will appear here after classes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}