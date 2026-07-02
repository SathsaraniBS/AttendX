import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MdCalendarToday, MdBarChart,
  MdCheckCircle, MdCancel, MdAccessTime,
  MdTrendingUp, MdWarning, MdCameraAlt, MdHistory
} from 'react-icons/md';
import StudentSidebar from '../../components/StudentComponents/StudentSidebar';

const BASE = 'http://localhost:5000/api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student,        setStudent]        = useState(null);
  const [recentRecords,  setRecentRecords]  = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0, present: 0, absent: 0, late: 0, rate: 0
  });

  // ── Auth + load ────────────────────────────────────────────────────────────
  useEffect(() => {
    const token    = localStorage.getItem('student_token');
    const userData = localStorage.getItem('student_user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData) {
        const parsed = JSON.parse(userData);
        setStudent(parsed);
        fetchAttendance(parsed.id, token);
      }
    } catch { navigate('/'); }
  }, [navigate]);

  // ── Fetch attendance ───────────────────────────────────────────────────────
  const fetchAttendance = useCallback(async (studentId, token) => {
    setLoadingRecords(true);
    try {
      const res = await axios.get(
        `${BASE}/attendance/student/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );
      const all     = res.data || [];
      const total   = all.length;
      const present = all.filter(r => r.status === 'Present').length;
      const absent  = all.filter(r => r.status === 'Absent').length;
      const late    = all.filter(r => r.status === 'Late').length;
      // ✅ Fix: Late is also "attended" — include in rate
      const rate    = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      setAttendanceStats({ total, present, absent, late, rate });
      setRecentRecords(all.slice(0, 5));
    } catch {
      setAttendanceStats({ total: 0, present: 0, absent: 0, late: 0, rate: 0 });
      setRecentRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    navigate('/');
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  // ✅ Fix: use real rate (already includes Late)
  const attendanceRate  = attendanceStats.rate || student?.attendance || 0;
  const attendanceColor =
    attendanceRate >= 85 ? 'text-green-500'
    : attendanceRate >= 75 ? 'text-yellow-500'
    : 'text-red-500';
  const strokeColor =
    attendanceRate >= 85 ? '#22c55e'
    : attendanceRate >= 75 ? '#eab308'
    : '#ef4444';

  // ── Check today marked ─────────────────────────────────────────────────────
  const today         = new Date().toISOString().split('T')[0];
  const markedToday   = recentRecords.some(r => r.date === today);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!student) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"/>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
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

        <div className="p-6 space-y-5">

          {/* Welcome Card + Mark Attendance CTA */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0">
                  {student?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Welcome back,</p>
                  <h2 className="text-2xl font-bold">{student?.name}</h2>
                  <p className="text-blue-100 text-sm mt-1">{student?.className}</p>
                </div>
              </div>

              {/* ✅ Mark Attendance quick button */}
              <div className="flex-shrink-0">
                {markedToday ? (
                  <div className="flex items-center gap-2 bg-green-400/30 px-4 py-2.5 rounded-xl border border-green-300/30">
                    <MdCheckCircle className="w-5 h-5 text-green-200"/>
                    <span className="text-green-100 text-sm font-medium">Marked Today ✓</span>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/student-mark-attendance')}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl border border-white/20 text-white text-sm font-medium transition-all">
                    <MdCameraAlt className="w-5 h-5"/>
                    Mark Attendance
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: 'Attendance Rate',
                value: `${attendanceRate}%`,
                icon:  MdBarChart,
                color: attendanceColor,
                bg:    'bg-blue-50',
              },
              {
                label: 'Present Days',
                value: attendanceStats.present,
                icon:  MdCheckCircle,
                color: 'text-green-600',
                bg:    'bg-green-50',
              },
              {
                label: 'Absent Days',
                value: attendanceStats.absent,
                icon:  MdCancel,
                color: 'text-red-500',
                bg:    'bg-red-50',
              },
              {
                label: 'Late Arrivals',
                value: attendanceStats.late,
                icon:  MdAccessTime,
                color: 'text-yellow-600',
                bg:    'bg-yellow-50',
              },
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

              {/* Circle Chart */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeDasharray={`${attendanceRate}, 100`}/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${attendanceColor}`}>{attendanceRate}%</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">

                {/* Low attendance warning */}
                {attendanceRate < 75 && attendanceStats.total > 0 && (
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

                {/* Excellent attendance */}
                {attendanceRate >= 85 && attendanceStats.total > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                    <MdCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"/>
                    <p className="text-sm font-medium text-green-700">Excellent attendance! Keep it up!</p>
                  </div>
                )}

                {/* No records yet */}
                {attendanceStats.total === 0 && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <MdCalendarToday className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"/>
                    <p className="text-sm text-blue-600">No attendance records yet. Mark your first attendance!</p>
                  </div>
                )}

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-400 text-xs">Student ID</p>
                    <p className="font-mono font-medium text-gray-700 text-sm">{student?.studentId}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-400 text-xs">Class</p>
                    <p className="font-medium text-gray-700 text-sm">{student?.className}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-gray-400 text-xs">Total Classes</p>
                    <p className="font-bold text-blue-600 text-sm">{attendanceStats.total}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-gray-400 text-xs">Present + Late</p>
                    <p className="font-bold text-green-600 text-sm">
                      {attendanceStats.present + attendanceStats.late}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <MdHistory className="w-4 h-4 text-blue-500"/>
                Recent Attendance
              </h3>
              <button
                onClick={() => navigate('/student-attendance')}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-all">
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
              <div className="text-center py-12">
                <MdCalendarToday className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-400 font-medium">No attendance records yet</p>
                <p className="text-gray-300 text-sm mt-1 mb-4">
                  Attendance will appear here after classes
                </p>
                <button
                  onClick={() => navigate('/student-mark-attendance')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-all">
                  <MdCameraAlt className="w-4 h-4"/> Mark First Attendance
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}