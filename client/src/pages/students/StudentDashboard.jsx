import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdHistory, MdPerson,
  MdLogout, MdCalendarToday, MdBarChart,
  MdCheckCircle, MdCancel, MdAccessTime,
  MdTrendingUp, MdWarning
} from 'react-icons/md';
import { FaUserGraduate } from 'react-icons/fa';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('student_token');
    const userData = localStorage.getItem('student_user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData) setStudent(JSON.parse(userData));
    } catch { navigate('/'); }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    navigate('/');
  };

  const attendanceRate = student?.attendance || 0;
  const attendanceColor = attendanceRate >= 85
    ? 'text-green-500' : attendanceRate >= 75
    ? 'text-yellow-500' : 'text-red-500';

  const sampleRecords = [
    { date: '2026-06-07', status: 'Present', time: '08:05 AM' },
    { date: '2026-06-06', status: 'Present', time: '08:02 AM' },
    { date: '2026-06-05', status: 'Absent', time: '—' },
    { date: '2026-06-04', status: 'Present', time: '08:10 AM' },
    { date: '2026-06-03', status: 'Late', time: '08:22 AM' },
  ];

  if (!student) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-56 bg-[#0f1729] flex flex-col z-50">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
              <FaUserGraduate className="w-4 h-4 text-white"/>
            </div>
            <div>
              <p className="text-white font-bold text-sm">FRAS</p>
              <p className="text-gray-400 text-xs">Student Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 mt-2">
          {[
            { key: 'dashboard', icon: MdDashboard, label: 'Dashboard' },
            { key: 'attendance', icon: MdHistory, label: 'My Attendance',
              onClick: () => navigate('/student-attendance') },
            { key: 'profile', icon: MdPerson, label: 'My Profile',
              onClick: () => navigate('/student-profile') },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.key}
                onClick={item.onClick || (() => setActiveTab(item.key))}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all
                  ${activeTab === item.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                <Icon className="w-5 h-5 flex-shrink-0"/>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {student?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{student?.name}</p>
              <p className="text-gray-400 text-xs truncate">{student?.studentId}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400">
              <MdLogout className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-56">
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <h1 className="text-lg font-semibold text-gray-800">Student Dashboard</h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm border border-gray-200 rounded-lg px-3 py-1.5">
            <MdCalendarToday className="w-4 h-4"/>
            <span>{new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Welcome */}
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
              { label: 'Present Days', value: Math.round(attendanceRate * 0.5), icon: MdCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Absent Days', value: Math.round((100 - attendanceRate) * 0.3), icon: MdCancel, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Late Arrivals', value: 3, icon: MdAccessTime, color: 'text-yellow-600', bg: 'bg-yellow-50' },
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

          {/* Attendance Circle */}
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

          {/* Recent Attendance */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Recent Attendance</h3>
              <button
                onClick={() => navigate('/student-attendance')}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                View All →
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Date', 'Status', 'Check-in Time', 'Class'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRecords.map((rec, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                    <td className="px-5 py-3 text-sm text-gray-600">{rec.date}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium
                        ${rec.status === 'Present' ? 'bg-green-50 text-green-600 border-green-100'
                          : rec.status === 'Late' ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                          : 'bg-red-50 text-red-500 border-red-100'}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{rec.time}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                        {student?.className}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}