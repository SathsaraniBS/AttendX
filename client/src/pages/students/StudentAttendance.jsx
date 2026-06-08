import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdHistory, MdPerson, MdLogout,
  MdCalendarToday, MdCheckCircle, MdCancel,
  MdAccessTime, MdSearch, MdFilterList,
  MdDownload, MdBarChart
} from 'react-icons/md';
import { FaUserGraduate } from 'react-icons/fa';

const allRecords = [
  { date: '2026-06-07', status: 'Present', time: '08:05 AM', day: 'Sunday' },
  { date: '2026-06-06', status: 'Present', time: '08:02 AM', day: 'Saturday' },
  { date: '2026-06-05', status: 'Absent', time: '—', day: 'Friday' },
  { date: '2026-06-04', status: 'Present', time: '08:10 AM', day: 'Thursday' },
  { date: '2026-06-03', status: 'Present', time: '08:01 AM', day: 'Wednesday' },
  { date: '2026-05-30', status: 'Late', time: '08:22 AM', day: 'Friday' },
  { date: '2026-05-29', status: 'Present', time: '07:58 AM', day: 'Thursday' },
  { date: '2026-05-28', status: 'Present', time: '08:03 AM', day: 'Wednesday' },
  { date: '2026-05-27', status: 'Present', time: '08:07 AM', day: 'Tuesday' },
  { date: '2026-05-26', status: 'Absent', time: '—', day: 'Monday' },
  { date: '2026-05-23', status: 'Present', time: '08:00 AM', day: 'Friday' },
  { date: '2026-05-22', status: 'Late', time: '08:35 AM', day: 'Thursday' },
  { date: '2026-05-21', status: 'Present', time: '07:55 AM', day: 'Wednesday' },
  { date: '2026-05-20', status: 'Present', time: '08:08 AM', day: 'Tuesday' },
  { date: '2026-05-19', status: 'Present', time: '08:02 AM', day: 'Monday' },
];

export default function StudentAttendance() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

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

  const filtered = allRecords.filter(r => {
    const matchSearch = r.date.includes(search) || r.status.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const presentCount = allRecords.filter(r => r.status === 'Present').length;
  const absentCount = allRecords.filter(r => r.status === 'Absent').length;
  const lateCount = allRecords.filter(r => r.status === 'Late').length;
  const total = allRecords.length;
  const rate = Math.round((presentCount / total) * 100);

  const exportCSV = () => {
    const headers = ['Date', 'Day', 'Status', 'Check-in Time'];
    const rows = filtered.map(r => [r.date, r.day, r.status, r.time].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${student?.name?.replace(' ', '_')}.csv`;
    a.click();
  };

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
            { label: 'Dashboard', icon: MdDashboard, path: '/student-dashboard' },
            { label: 'My Attendance', icon: MdHistory, path: '/student-attendance' },
            { label: 'My Profile', icon: MdPerson, path: '/student-profile' },
          ].map(item => {
            const Icon = item.icon;
            const active = window.location.pathname === item.path;
            return (
              <button key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all
                  ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
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
          <h1 className="text-lg font-semibold text-gray-800">My Attendance</h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm border border-gray-200 rounded-lg px-3 py-1.5">
            <MdCalendarToday className="w-4 h-4"/>
            <span>{new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}</span>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Attendance Rate', value: `${rate}%`, icon: MdBarChart, color: rate >= 85 ? 'text-green-600' : rate >= 75 ? 'text-yellow-600' : 'text-red-500', bg: 'bg-blue-50' },
              { label: 'Present', value: presentCount, icon: MdCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Absent', value: absentCount, icon: MdCancel, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Late', value: lateCount, icon: MdAccessTime, color: 'text-yellow-600', bg: 'bg-yellow-50' },
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

          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input type="text" placeholder="Search by date or status..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
              </div>

              <div className="flex gap-1.5">
                {['All', 'Present', 'Absent', 'Late'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${filterStatus === s
                        ? s === 'Present' ? 'bg-green-500 text-white'
                          : s === 'Absent' ? 'bg-red-500 text-white'
                          : s === 'Late' ? 'bg-yellow-400 text-white'
                          : 'bg-blue-500 text-white'
                        : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {s}
                  </button>
                ))}
              </div>

              <button onClick={exportCSV}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-all ml-auto">
                <MdDownload className="w-4 h-4"/> Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Attendance History</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {filtered.length} records
              </span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['#', 'Date', 'Day', 'Status', 'Check-in Time', 'Class'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                    <td className="px-5 py-3 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-700">{rec.date}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{rec.day}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium
                        ${rec.status === 'Present' ? 'bg-green-50 text-green-600 border-green-100'
                          : rec.status === 'Late' ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                          : 'bg-red-50 text-red-500 border-red-100'}`}>
                        {rec.status === 'Present'
                          ? <><MdCheckCircle className="w-3 h-3"/> Present</>
                          : rec.status === 'Late'
                          ? <><MdAccessTime className="w-3 h-3"/> Late</>
                          : <><MdCancel className="w-3 h-3"/> Absent</>}
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

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <MdHistory className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-400">No records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}