import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAssignment, MdBarChart, MdHistory,
  MdLogout, MdMenu, MdSearch, MdCalendarToday,
  MdDownload, MdClose,
  MdChevronLeft, MdChevronRight,
  MdAccessTime, MdCheckCircle, MdCancel,
  MdRefresh
} from 'react-icons/md';
import { FaUserCheck, FaUserTimes } from 'react-icons/fa';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import AdminSidebar from '../../components/AdminComponents/AdminSidebar';

// ==================== ATTENDANCE HISTORY PAGE ====================
export default function AttendanceHistory() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterClass, setFilterClass] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('records');
  const [editRecord, setEditRecord] = useState(null);
  const perPage = 10;

  // ==================== FETCH REAL DATA ====================
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/attendance/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined') setUser(JSON.parse(userData));
    } catch { navigate('/'); return; }
    fetchAttendance();
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  // ==================== STATUS UPDATE (DB) ====================
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/attendance/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Update failed');
      // Update local state immediately
      setRecords(prev => prev.map(r =>
        r.id === id ? { ...r, status: newStatus } : r
      ));
      setEditRecord(null);
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  // ==================== FILTER ====================
  const filtered = records.filter(r => {
    const matchSearch =
      (r.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
      String(r.studentId || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.class || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchClass = filterClass === 'All' || r.class === filterClass;
    const matchFrom = !dateFrom || r.date >= dateFrom;
    const matchTo = !dateTo || r.date <= dateTo;
    return matchSearch && matchStatus && matchClass && matchFrom && matchTo;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // ==================== HELPERS ====================
  const statusColor = (status) => {
    if (status === 'Present') return 'bg-green-50 text-green-600 border-green-100';
    if (status === 'Late') return 'bg-yellow-50 text-yellow-600 border-yellow-100';
    return 'bg-red-50 text-red-500 border-red-100';
  };

  const statusIcon = (status) => {
    if (status === 'Present') return <MdCheckCircle className="w-3.5 h-3.5"/>;
    if (status === 'Late') return <MdAccessTime className="w-3.5 h-3.5"/>;
    return <MdCancel className="w-3.5 h-3.5"/>;
  };

  const exportCSV = () => {
    const headers = ['Name', 'Student ID', 'Class', 'Date', 'Time In', 'Status'];
    const rows = filtered.map(r =>
      [r.studentName, r.studentId, r.class, r.date, r.timeIn || '--', r.status].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ==================== STATS ====================
  const stats = [
    {
      label: 'Total Records',
      value: filtered.length,
      icon: MdAssignment,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Present',
      value: filtered.filter(r => r.status === 'Present').length,
      icon: FaUserCheck,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Absent',
      value: filtered.filter(r => r.status === 'Absent').length,
      icon: FaUserTimes,
      color: 'text-red-500',
      bg: 'bg-red-50'
    },
    {
      label: 'Late',
      value: filtered.filter(r => r.status === 'Late').length,
      icon: MdAccessTime,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
  ];

  // ==================== ANALYTICS DATA (computed from real records) ====================
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const weeklyChartData = days.map(day => {
    const dayRecords = records.filter(r => r.day === day);
    const present = dayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const absent = dayRecords.filter(r => r.status === 'Absent').length;
    return { day, present, absent };
  });

  const getWeekNumber = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    return `W${Math.ceil(day / 7)}`;
  };

  const weeklyGroups = {};
  records.forEach(r => {
    if (!r.date) return;
    const week = getWeekNumber(r.date);
    if (!weeklyGroups[week]) weeklyGroups[week] = { total: 0, attended: 0 };
    weeklyGroups[week].total++;
    if (r.status === 'Present' || r.status === 'Late') weeklyGroups[week].attended++;
  });
  const monthlyTrend = Object.entries(weeklyGroups).map(([week, val]) => ({
    week,
    rate: val.total > 0 ? Math.round((val.attended / val.total) * 100) : 0
  })).sort((a, b) => a.week.localeCompare(b.week));

  // Dynamic class list from real data
  const uniqueClasses = ['All', ...new Set(records.map(r => r.class).filter(Boolean))];

  // ==================== RENDER ====================
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} onLogout={handleLogout}/>

      <div className="flex-1 ml-56">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <MdMenu className="w-5 h-5 text-gray-400"/>
            <h1 className="text-lg font-semibold text-gray-800">Attendance History</h1>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filtered.length} records
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm border border-gray-200 rounded-lg px-3 py-1.5">
              <MdCalendarToday className="w-4 h-4"/>
              <span>{new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="text-gray-700 text-sm">{user?.name || 'Admin'}</span>
            </div>
          </div>
        </div>

        <div className="p-6">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((s, i) => {
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

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
            {[
              { key: 'records', label: 'Records', icon: MdAssignment },
              { key: 'analytics', label: 'Analytics', icon: MdBarChart },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeTab === tab.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'}`}>
                  <Icon className="w-4 h-4"/>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* RECORDS TAB */}
          {activeTab === 'records' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
                <div className="flex items-center gap-3 flex-wrap">

                  {/* Search */}
                  <div className="relative flex-1 min-w-48">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input type="text" placeholder="Search name, ID, class..."
                      value={search}
                      onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2">
                    <MdCalendarToday className="w-4 h-4 text-gray-400"/>
                    <input type="date" value={dateFrom}
                      onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 focus:outline-none focus:border-blue-400"/>
                    <span className="text-gray-400 text-xs">to</span>
                    <input type="date" value={dateTo}
                      onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 focus:outline-none focus:border-blue-400"/>
                  </div>

                  {/* Class Filter — dynamic from real DB */}
                  <select value={filterClass}
                    onChange={e => { setFilterClass(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 focus:outline-none bg-white">
                    {uniqueClasses.map(c => <option key={c}>{c}</option>)}
                  </select>

                  {/* Status Filter */}
                  <div className="flex gap-1.5">
                    {['All', 'Present', 'Late', 'Absent'].map(s => (
                      <button key={s}
                        onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                          ${filterStatus === s
                            ? s === 'Present' ? 'bg-green-500 text-white'
                              : s === 'Late' ? 'bg-yellow-400 text-white'
                              : s === 'Absent' ? 'bg-red-500 text-white'
                              : 'bg-blue-500 text-white'
                            : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Reset */}
                  <button
                    onClick={() => {
                      setSearch(''); setFilterStatus('All');
                      setFilterClass('All'); setDateFrom(''); setDateTo('');
                      setCurrentPage(1);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-all">
                    <MdRefresh className="w-4 h-4"/>
                    Reset
                  </button>

                  {/* Refresh from DB */}
                  <button onClick={fetchAttendance}
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-all">
                    <MdRefresh className="w-4 h-4 text-blue-400"/>
                    Reload
                  </button>

                  {/* Export */}
                  <button onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all ml-auto">
                    <MdDownload className="w-4 h-4"/>
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-16">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
                    <p className="text-gray-400 text-sm">Loading records...</p>
                  </div>
                )}

                {/* Error State */}
                {!loading && error && (
                  <div className="text-center py-16">
                    <MdCancel className="w-12 h-12 text-red-200 mx-auto mb-3"/>
                    <p className="text-red-400 font-medium">{error}</p>
                    <button onClick={fetchAttendance}
                      className="mt-3 text-xs text-blue-500 hover:underline">
                      Try Again
                    </button>
                  </div>
                )}

                {/* Table Content */}
                {!loading && !error && (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['#', 'Student', 'Student ID', 'Class', 'Date', 'Time In', 'Status', 'Action'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((r, i) => (
                        <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {(currentPage - 1) * perPage + i + 1}
                          </td>

                          {/* Student */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-bold text-xs">
                                  {(r.studentName || '?').charAt(0)}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                                {r.studentName || '—'}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                              {r.studentId || '—'}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                              {r.class || '—'}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{r.date}</td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MdAccessTime className="w-3.5 h-3.5"/>
                              {r.timeIn || '--'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            {editRecord === r.id ? (
                              <div className="flex gap-1">
                                {['Present', 'Late', 'Absent'].map(s => (
                                  <button key={s}
                                    onClick={() => handleStatusChange(r.id, s)}
                                    className={`text-xs px-2 py-1 rounded-lg border transition-all
                                      ${s === 'Present' ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                                      : s === 'Late' ? 'bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100'
                                      : 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100'}`}>
                                    {s}
                                  </button>
                                ))}
                                <button onClick={() => setEditRecord(null)}
                                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg">
                                  <MdClose className="w-3.5 h-3.5"/>
                                </button>
                              </div>
                            ) : (
                              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(r.status)}`}>
                                {statusIcon(r.status)}
                                {r.status}
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setEditRecord(editRecord === r.id ? null : r.id)}
                              className="text-xs text-blue-400 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-all border border-transparent hover:border-blue-100">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Empty */}
                {!loading && !error && filtered.length === 0 && (
                  <div className="text-center py-16">
                    <MdHistory className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                    <p className="text-gray-400 font-medium">No records found</p>
                    <p className="text-gray-300 text-sm mt-1">Try adjusting your filters</p>
                  </div>
                )}

                {/* Pagination */}
                {!loading && !error && filtered.length > 0 && (
                  <div className="px-5 py-3.5 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                      Showing {Math.min((currentPage - 1) * perPage + 1, filtered.length)}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} records
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-all">
                        <MdChevronLeft className="w-4 h-4"/>
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all
                              ${currentPage === page
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                            {page}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-all">
                        <MdChevronRight className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-5">

              <div className="grid grid-cols-2 gap-5">

                {/* Bar Chart — real weekly data */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 text-sm mb-4">
                    Weekly Attendance Overview
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyChartData} barSize={20}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                      <Tooltip/>
                      <Bar dataKey="present" name="Present" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                      <Bar dataKey="absent" name="Absent" fill="#f87171" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Line Chart — real monthly trend */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 text-sm mb-4">
                    Monthly Attendance Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={monthlyTrend}>
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`}/>
                      <Tooltip formatter={v => [`${v}%`, 'Rate']}/>
                      <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Class-wise Summary — from real records */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm">Class-wise Attendance Summary</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Class', 'Total Records', 'Present', 'Absent', 'Late', 'Attendance Rate'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueClasses.filter(c => c !== 'All').map(cls => {
                      const clsRecords = records.filter(r => r.class === cls);
                      const present = clsRecords.filter(r => r.status === 'Present').length;
                      const absent = clsRecords.filter(r => r.status === 'Absent').length;
                      const late = clsRecords.filter(r => r.status === 'Late').length;
                      const rate = clsRecords.length > 0
                        ? Math.round(((present + late) / clsRecords.length) * 100)
                        : 0;
                      return (
                        <tr key={cls} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                          <td className="px-5 py-3">
                            <span className="text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                              {cls}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600">{clsRecords.length}</td>
                          <td className="px-5 py-3 text-sm font-medium text-green-500">{present}</td>
                          <td className="px-5 py-3 text-sm font-medium text-red-400">{absent}</td>
                          <td className="px-5 py-3 text-sm font-medium text-yellow-500">{late}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-24">
                                <div
                                  className={`h-1.5 rounded-full ${rate >= 85 ? 'bg-green-400' : rate >= 70 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                  style={{ width: `${rate}%` }}/>
                              </div>
                              <span className={`text-xs font-semibold ${rate >= 85 ? 'text-green-600' : rate >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>
                                {rate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}