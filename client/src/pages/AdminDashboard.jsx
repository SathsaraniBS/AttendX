import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  MdPeople, MdCheckCircle, MdCancel, MdClass,
  MdBarChart, MdRefresh, MdNotifications,
  MdAccessTime, MdCalendarToday
} from 'react-icons/md';
import AdminSidebar from '../components/AdminComponents/AdminSidebar';

const STUDENTS_API  = 'http://localhost:5000/api/students/';
const CLASSES_API   = 'http://localhost:5000/api/classes/';
const ATTENDANCE_API = 'http://localhost:5000/api/attendance/history';

// ─── Colour helpers (same logic as StudentList + Classes) ─────────────────────
const CLASS_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'];

const attendanceColor = (r) => {
  if (r >= 85) return 'bg-green-500';
  if (r >= 70) return 'bg-yellow-400';
  return 'bg-red-400';
};

const attendanceTextColor = (r) => {
  if (r >= 85) return 'text-green-600';
  if (r >= 70) return 'text-yellow-600';
  return 'text-red-500';
};

// ─── Build last‑7‑days chart labels ──────────────────────────────────────────
const getLast7Days = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    };
  });
};

// ─── Compute daily attendance rate from raw records ──────────────────────────
const buildDailyTrend = (records) => {
  const days = getLast7Days();
  return days.map(({ date, label }) => {
    const dayRecords = records.filter(r => r.date === date);
    const total = dayRecords.length;
    const present = dayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    return {
      date: label,
      value: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  });
};

// ─── Build period summary rows ────────────────────────────────────────────────
const buildSummary = (records) => {
  const today = new Date().toISOString().split('T')[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split('T')[0];

  const compute = (filtered) => {
    const present = filtered.filter(r => r.status === 'Present').length;
    const absent  = filtered.filter(r => r.status === 'Absent').length;
    const late    = filtered.filter(r => r.status === 'Late').length;
    const total   = filtered.length;
    const rate    = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { present: present + late, absent, total, rate };
  };

  return [
    { period: 'Today',      ...compute(records.filter(r => r.date === today)) },
    { period: 'This Week',  ...compute(records.filter(r => r.date >= weekStartStr)) },
    { period: 'This Month', ...compute(records.filter(r => r.date >= monthStartStr)) },
  ];
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // data
  const [students,   setStudents]   = useState([]);
  const [classes,    setClasses]    = useState([]);
  const [attendance, setAttendance] = useState([]);

  // ui
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartRange, setChartRange] = useState('week'); // 'week' | 'month'

  // ── auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined' && userData !== 'null') {
        setUser(JSON.parse(userData));
      }
    } catch {
      localStorage.clear();
      navigate('/');
    }
  }, [navigate]);

  // ── fetch all three APIs in parallel (same pattern as Classes.jsx) ──────────
  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token   = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [studRes, classRes, attRes] = await Promise.all([
        axios.get(STUDENTS_API,   { headers, timeout: 6000 }),
        axios.get(CLASSES_API,    { headers, timeout: 6000 }),
        fetch(ATTENDANCE_API,     { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setStudents(studRes.data  || []);
      setClasses(classRes.data  || []);

      if (attRes.ok) {
        const attData = await attRes.json();
        setAttendance(Array.isArray(attData) ? attData : []);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      // Fallback to localStorage if available
      try {
        const cached = localStorage.getItem('attendx_students');
        if (cached) setStudents(JSON.parse(cached));
        const cachedCls = localStorage.getItem('attendx_classes');
        if (cachedCls) setClasses(JSON.parse(cachedCls));
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  // ── derived values ───────────────────────────────────────────────────────────
  const today          = new Date().toISOString().split('T')[0];
  const todayRecords   = attendance.filter(r => r.date === today);
  const presentToday   = todayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const absentToday    = todayRecords.filter(r => r.status === 'Absent').length;
  const totalStudents  = students.length;
  const activeClasses  = classes.filter(c => c.status === 'Active').length;

  const overallRate = todayRecords.length > 0
    ? Math.round((presentToday / todayRecords.length) * 100)
    : (students.length > 0
        ? Math.round(students.reduce((a, s) => a + (s.attendance || 0), 0) / students.length)
        : 0);

  // Recent attendance (last 5 unique records from today or latest)
  const recentRecords = [...attendance]
    .sort((a, b) => {
      const da = new Date(`${a.date} ${a.timeIn || '00:00'}`);
      const db = new Date(`${b.date} ${b.timeIn || '00:00'}`);
      return db - da;
    })
    .slice(0, 5);

  // Charts
  const lineData = buildDailyTrend(attendance);

  const barData = lineData; // same shape, separate visual

  // Pie chart: top 5 classes by attendance rate
  const pieData = classes
    .filter(c => c.attendance > 0)
    .slice(0, 5)
    .map((c, i) => ({
      name:  c.name,
      value: c.attendance || 0,
      color: CLASS_COLORS[i % CLASS_COLORS.length],
    }));

  const summaryRows = buildSummary(attendance);

  // ── stat cards ───────────────────────────────────────────────────────────────
  const statCards = [
    {
      label: 'Total Students',
      value: totalStudents,
      sub:   'View all students →',
      icon:  '👥',
      light: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      onClick: () => navigate('/students'),
    },
    {
      label: 'Present Today',
      value: presentToday,
      sub:   `${todayRecords.length > 0 ? Math.round((presentToday / todayRecords.length) * 100) : 0}% of records`,
      icon:  '✅',
      light: 'bg-green-50',
      iconBg: 'bg-green-100',
      onClick: () => navigate('/attendance'),
    },
    {
      label: 'Absent Today',
      value: absentToday,
      sub:   `${todayRecords.length > 0 ? Math.round((absentToday / todayRecords.length) * 100) : 0}% of records`,
      icon:  '❌',
      light: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      onClick: () => navigate('/attendance'),
    },
    {
      label: 'Active Classes',
      value: activeClasses,
      sub:   `${classes.length} total classes`,
      icon:  '📅',
      light: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      onClick: () => navigate('/classes'),
    },
    {
      label: 'Attendance Rate',
      value: `${overallRate}%`,
      sub:   todayRecords.length > 0 ? 'Today' : 'Overall avg',
      icon:  '📊',
      light: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      onClick: () => navigate('/attendance'),
    },
  ];

  // ── render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar user={user} onLogout={handleLogout}/>
        <div className="flex-1 ml-56 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"/>
            <p className="text-gray-400 text-sm">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <AdminSidebar user={user} onLogout={handleLogout}/>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-56">

        {/* ── Top Bar ── */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Refresh */}
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all disabled:opacity-50">
              <MdRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`}/>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>

            <div className="flex items-center gap-2 text-gray-500 text-sm border border-gray-200 rounded-lg px-3 py-1.5">
              <MdCalendarToday className="w-4 h-4"/>
              <span>{new Date().toLocaleDateString('en-US', {
                day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
              })}</span>
            </div>

            <button className="relative text-gray-400 hover:text-gray-600">
              <MdNotifications className="w-5 h-5"/>
              {attendance.filter(r => r.date === today && r.status === 'Absent').length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {Math.min(attendance.filter(r => r.date === today && r.status === 'Absent').length, 9)}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="text-gray-700 text-sm font-medium">{user?.name || 'Admin'}</span>
              <span className="text-gray-400 text-xs">▼</span>
            </div>
          </div>
        </div>

        <div className="p-6">

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {statCards.map((card, i) => (
              <div key={i}
                onClick={card.onClick}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <span className="text-lg">{card.icon}</span>
                </div>
                <p className="text-xs text-blue-500 font-semibold mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{card.value}</p>
                <p className="text-xs text-gray-400">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Line Chart + Recent Attendance ── */}
          <div className="grid grid-cols-3 gap-5 mb-5">

            {/* Attendance trend line chart — real data */}
            <div className="col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-gray-800 font-semibold text-sm">Attendance Overview</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Daily attendance rate — last 7 days</p>
                </div>
                <div className="flex items-center gap-2">
                  {attendance.length === 0 && (
                    <span className="text-xs text-orange-400 bg-orange-50 border border-orange-100 px-2 py-1 rounded-lg">
                      No records yet
                    </span>
                  )}
                  <select
                    value={chartRange}
                    onChange={e => setChartRange(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 focus:outline-none">
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`}/>
                  <Tooltip formatter={v => [`${v}%`, 'Attendance Rate']}/>
                  <Line
                    type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Attendance — real records from API */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-800 font-semibold text-sm">Recent Attendance</h2>
                <button
                  onClick={() => navigate('/attendance')}
                  className="text-blue-500 text-xs hover:underline">
                  View all
                </button>
              </div>

              {recentRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <MdAccessTime className="w-8 h-8 text-gray-200 mb-2"/>
                  <p className="text-gray-300 text-xs">No attendance records yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRecords.map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs flex-shrink-0 border border-gray-200">
                        {(r.studentName || '?').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-xs font-medium truncate">{r.studentName || '—'}</p>
                        <p className="text-gray-400 text-xs">{r.class || '—'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-gray-400 text-xs">{r.timeIn || r.date || '—'}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border
                          ${r.status === 'Present' ? 'bg-green-50 text-green-600 border-green-100'
                          : r.status === 'Late'    ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                          : 'bg-red-50 text-red-500 border-red-100'}`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Pie + Bar + Quick Actions ── */}
          <div className="grid grid-cols-3 gap-5 mb-5">

            {/* Pie Chart — real class attendance from classes API */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-800 font-semibold text-sm">Attendance by Class</h2>
                <span className="text-xs text-gray-400">{classes.length} classes</span>
              </div>

              {pieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <MdClass className="w-8 h-8 text-gray-200 mb-2"/>
                  <p className="text-gray-300 text-xs">No class data yet</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie
                          data={pieData} cx={55} cy={55}
                          innerRadius={36} outerRadius={55}
                          dataKey="value" startAngle={90} endAngle={-270}>
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color}/>
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-800">
                          {pieData.length > 0
                            ? `${Math.round(pieData.reduce((a, c) => a + c.value, 0) / pieData.length)}%`
                            : '—'}
                        </p>
                        <p className="text-xs text-gray-400">Overall</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    {pieData.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }}/>
                        <span className="text-xs text-gray-500 flex-1 truncate">{c.name}</span>
                        <span className={`text-xs font-medium ${attendanceTextColor(c.value)}`}>{c.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bar Chart — daily rate from real attendance records */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-800 font-semibold text-sm">Attendance Trend</h2>
                <span className="text-xs text-gray-400">Last 7 days</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} barSize={14}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                  <YAxis hide domain={[0, 100]}/>
                  <Tooltip formatter={v => [`${v}%`, 'Rate']}/>
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-gray-800 font-semibold text-sm mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Mark Attendance', icon: '📷', color: 'bg-blue-50 text-blue-600 border-blue-100',    path: '/live' },
                  { label: 'Add Student',     icon: '👤', color: 'bg-green-50 text-green-600 border-green-100', path: '/students' },
                  { label: 'Add Class',       icon: '🏫', color: 'bg-purple-50 text-purple-600 border-purple-100', path: '/classes' },
                  { label: 'Generate Report', icon: '📊', color: 'bg-orange-50 text-orange-600 border-orange-100', path: '/reports' },
                ].map((action, i) => (
                  <button key={i}
                    onClick={() => navigate(action.path)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${action.color} hover:opacity-80 transition-all text-xs font-medium`}>
                    <span className="text-xl">{action.icon}</span>
                    <span className="text-center leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate('/attendance')}
                className="mt-3 w-full py-2.5 border border-gray-200 rounded-xl text-gray-500 text-xs font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                🕐 View Attendance History
              </button>
            </div>
          </div>

          {/* ── Summary Table + System Overview ── */}
          <div className="grid grid-cols-3 gap-5">

            {/* Attendance Summary — computed from real attendance records */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-gray-800 font-semibold text-sm">Attendance Summary</h2>
                <span className="text-xs text-gray-400">{attendance.length} total records</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {['Period', 'Total Records', 'Present', 'Absent', 'Attendance Rate'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.map((row, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-all">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">{row.period}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.total}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-500">{row.present}</td>
                      <td className="px-4 py-3 text-sm font-medium text-red-400">{row.absent}</td>
                      <td className="px-4 py-3">
                        {row.total > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                              <div
                                className={`h-1.5 rounded-full ${row.rate >= 85 ? 'bg-green-400' : row.rate >= 70 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                style={{ width: `${row.rate}%` }}/>
                            </div>
                            <span className={`text-xs font-medium ${attendanceTextColor(row.rate)}`}>
                              {row.rate}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">No records</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* System Overview — real counts from API */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-gray-800 font-semibold text-sm mb-4">System Overview</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Total Students',
                    value: students.length,
                    icon:  '👥',
                    color: 'bg-blue-50',
                  },
                  {
                    label: 'Active Students',
                    value: students.filter(s => s.status === 'Active').length,
                    icon:  '✅',
                    color: 'bg-green-50',
                  },
                  {
                    label: 'Face Registered',
                    value: students.filter(s => s.hasFace).length,
                    icon:  '🎭',
                    color: 'bg-purple-50',
                  },
                  {
                    label: 'Active Classes',
                    value: classes.filter(c => c.status === 'Active').length,
                    icon:  '📅',
                    color: 'bg-orange-50',
                  },
                ].map((item, i) => (
                  <div key={i} className={`${item.color} rounded-xl p-3`}>
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-xs text-gray-500 mt-2">{item.label}</p>
                    <p className="text-lg font-bold text-gray-700 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Avg attendance bar */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-500">Overall Avg Attendance</span>
                  <span className={`text-xs font-bold ${attendanceTextColor(overallRate)}`}>
                    {overallRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${attendanceColor(overallRate)}`}
                    style={{ width: `${overallRate}%` }}/>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {students.filter(s => s.hasFace).length} / {students.length} students face-registered
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}