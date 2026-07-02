import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MdCalendarToday, MdBarChart,
  MdCheckCircle, MdCancel, MdAccessTime,
  MdSearch, MdDownload, MdHistory, MdRefresh,
  MdWarning, MdCameraAlt
} from 'react-icons/md';
import StudentSidebar from '../../components/StudentComponents/StudentSidebar';

const BASE = 'http://localhost:5000/api';

export default function StudentAttendance() {
  const navigate = useNavigate();
  const [student,      setStudent]      = useState(null);
  const [records,      setRecords]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // ── Auth + load ──────────────────────────────────────────────────────────────
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

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchAttendance = useCallback(async (studentId, token) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE}/attendance/student/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );
      setRecords(res.data || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    navigate('/');
  };

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = records.filter(r => {
    const matchSearch =
      (r.date   || '').includes(search) ||
      (r.status || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.day    || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchFilter;
  });

  // ── Stats ────────────────────────────────────────────────────────────────────
  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount  = records.filter(r => r.status === 'Absent').length;
  const lateCount    = records.filter(r => r.status === 'Late').length;
  const total        = records.length;
  // ✅ Fix: Late is also "attended" — include in rate
  const rate         = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  // ── Export CSV ───────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Date', 'Day', 'Status', 'Check-in Time'];
    const rows    = filtered.map(r =>
      [r.date || '', r.day || '', r.status || '', r.time || ''].join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `attendance_${student?.name?.replace(' ', '_') || 'student'}.csv`;
    a.click();
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (!student) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"/>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar student={student} onLogout={handleLogout}/>

      <div className="flex-1 ml-56">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <h1 className="text-lg font-semibold text-gray-800">My Attendance</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAttendance(student.id, localStorage.getItem('student_token'))}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all">
              <MdRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
              Refresh
            </button>
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

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: 'Attendance Rate',
                value: `${rate}%`,
                icon:  MdBarChart,
                color: rate >= 85 ? 'text-green-600' : rate >= 75 ? 'text-yellow-600' : 'text-red-500',
                bg:    'bg-blue-50',
              },
              { label: 'Present', value: presentCount, icon: MdCheckCircle, color: 'text-green-600',  bg: 'bg-green-50' },
              { label: 'Absent',  value: absentCount,  icon: MdCancel,      color: 'text-red-500',    bg: 'bg-red-50' },
              { label: 'Late',    value: lateCount,    icon: MdAccessTime,  color: 'text-yellow-600', bg: 'bg-yellow-50' },
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

          {/* ✅ Low attendance warning */}
          {total > 0 && rate < 75 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
              <MdWarning className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="text-sm font-medium text-red-700">Low Attendance Warning!</p>
                <p className="text-xs text-red-500 mt-0.5">
                  Minimum 75% required. You need {75 - rate}% more.
                </p>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input
                  type="text"
                  placeholder="Search by date, day or status..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
              </div>

              <div className="flex gap-1.5">
                {['All', 'Present', 'Absent', 'Late'].map(s => (
                  <button key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${filterStatus === s
                        ? s === 'Present' ? 'bg-green-500 text-white'
                          : s === 'Absent' ? 'bg-red-500 text-white'
                          : s === 'Late'   ? 'bg-yellow-400 text-white'
                          : 'bg-blue-500 text-white'
                        : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {s}
                    {s !== 'All' && (
                      <span className="ml-1 opacity-70">
                        ({s === 'Present' ? presentCount : s === 'Absent' ? absentCount : lateCount})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <button onClick={exportCSV}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-all ml-auto">
                <MdDownload className="w-4 h-4"/>
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Attendance History</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {filtered.length} of {total} records
              </span>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"/>
                <p className="text-gray-400 text-sm">Loading attendance records...</p>
              </div>
            ) : (
              <>
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
                        <td className="px-5 py-3 text-sm font-medium text-gray-700">{rec.date || '—'}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{rec.day  || '—'}</td>
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

                {/* Empty State */}
                {filtered.length === 0 && (
                  <div className="text-center py-16">
                    <MdHistory className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                    <p className="text-gray-400 font-medium">No attendance records found</p>
                    <p className="text-gray-300 text-sm mt-1">
                      {records.length === 0
                        ? 'Attendance will appear here after classes'
                        : 'Try adjusting your filters'}
                    </p>
                    {records.length === 0 && (
                      <button
                        onClick={() => navigate('/student-mark-attendance')}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-all">
                        <MdCameraAlt className="w-4 h-4"/> Mark Attendance
                      </button>
                    )}
                  </div>
                )}

                {/* Footer */}
                {filtered.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                    <p className="text-xs text-gray-400">
                      Showing {filtered.length} of {total} records
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <MdCheckCircle className="w-3.5 h-3.5"/>
                        Present: {presentCount}
                      </div>
                      <div className="flex items-center gap-1 text-red-500 font-medium">
                        <MdCancel className="w-3.5 h-3.5"/>
                        Absent: {absentCount}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-600 font-medium">
                        <MdAccessTime className="w-3.5 h-3.5"/>
                        Late: {lateCount}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}