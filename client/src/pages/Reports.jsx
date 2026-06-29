import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdBarChart, MdMenu, MdCalendarToday,
  MdDownload, MdPrint, MdFilterList,
  MdCheckCircle, MdAccessTime,
  MdTrendingUp, MdTrendingDown, MdRefresh,
  MdPeople, MdClass
} from 'react-icons/md';
import { FaUserCheck, FaUserTimes } from 'react-icons/fa';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import AdminSidebar from '../components/AdminComponents/AdminSidebar';

// ── API base ──────────────────────────────────────────────────────────────────
const BASE           = 'http://localhost:5000/api';
const STUDENTS_API   = `${BASE}/students/`;
const CLASSES_API    = `${BASE}/classes/`;
const ATTENDANCE_API = `${BASE}/attendance/history`;

// ── Colour helpers ────────────────────────────────────────────────────────────
const attendanceTextColor = (r) => {
  if (r >= 85) return 'text-green-600';
  if (r >= 70) return 'text-yellow-600';
  return 'text-red-500';
};
const attendanceBgColor = (r) => {
  if (r >= 85) return 'bg-green-400';
  if (r >= 70) return 'bg-yellow-400';
  return 'bg-red-400';
};
const attendanceLabel = (r) => {
  if (r >= 85) return { text: 'Excellent',       cls: 'bg-green-50 text-green-600 border-green-100' };
  if (r >= 70) return { text: 'Good',            cls: 'bg-yellow-50 text-yellow-600 border-yellow-100' };
  return           { text: 'Needs Attention',    cls: 'bg-red-50 text-red-500 border-red-100' };
};

// ── Last N months labels ──────────────────────────────────────────────────────
const getLastNMonths = (n) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (n - 1 - i));
    return {
      key:   d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

// ── Week key helper ───────────────────────────────────────────────────────────
const getWeekKey = (dateStr) => {
  const d   = new Date(dateStr);
  const day = d.getDate();
  return `W${Math.ceil(day / 7)}`;
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Reports() {
  const navigate = useNavigate();
  const [user,       setUser]       = useState(null);
  const [students,   setStudents]   = useState([]);
  const [classes,    setClasses]    = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // filters
  const [period,        setPeriod]        = useState('monthly');
  const [selectedClass, setSelectedClass] = useState('All');
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');
  const [activeTab,     setActiveTab]     = useState('overview');

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined') setUser(JSON.parse(userData));
    } catch { navigate('/'); }
  }, [navigate]);

  // ── Fetch all three APIs in parallel ──────────────────────────────────────
  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else           setLoading(true);

    try {
      const token   = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [studRes, classRes, attRes] = await Promise.all([
        fetch(STUDENTS_API,   { headers }),
        fetch(CLASSES_API,    { headers }),
        fetch(ATTENDANCE_API, { headers }),
      ]);

      if (studRes.ok)  {
        const studs = await studRes.json();
        setStudents(Array.isArray(studs) ? studs : []);
        localStorage.setItem('attendx_students', JSON.stringify(studs));
      }
      if (classRes.ok) {
        const cls = await classRes.json();
        setClasses(Array.isArray(cls) ? cls : []);
        localStorage.setItem('attendx_classes', JSON.stringify(cls));
      }
      if (attRes.ok) {
        const att = await attRes.json();
        setAttendance(Array.isArray(att) ? att : []);
      }

    } catch (err) {
      console.error('Reports fetch error:', err);
      // ✅ localStorage fallback
      try {
        const cs = localStorage.getItem('attendx_students');
        const cc = localStorage.getItem('attendx_classes');
        if (cs) setStudents(JSON.parse(cs));
        if (cc) setClasses(JSON.parse(cc));
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  // ── Apply date + class filter ─────────────────────────────────────────────
  const filteredRecords = attendance.filter(r => {
    const matchClass = selectedClass === 'All' || r.class === selectedClass;
    const matchFrom  = !dateFrom || r.date >= dateFrom;
    const matchTo    = !dateTo   || r.date <= dateTo;
    return matchClass && matchFrom && matchTo;
  });

  // ── Top-level stats ───────────────────────────────────────────────────────
  const totalRecords = filteredRecords.length;
  const totalPresent = filteredRecords.filter(r => r.status === 'Present').length;
  const totalAbsent  = filteredRecords.filter(r => r.status === 'Absent').length;
  const totalLate    = filteredRecords.filter(r => r.status === 'Late').length;
  const overallRate  = totalRecords > 0
    ? Math.round(((totalPresent + totalLate) / totalRecords) * 100)
    : 0;

  // ✅ Period comparison — first half vs second half of filtered
  const half     = Math.floor(filteredRecords.length / 2);
  const firstH   = filteredRecords.slice(0, half);
  const secondH  = filteredRecords.slice(half);
  const prevRate = firstH.length  > 0
    ? Math.round((firstH.filter(r  => r.status !== 'Absent').length / firstH.length)  * 100)
    : 0;
  const currRate = secondH.length > 0
    ? Math.round((secondH.filter(r => r.status !== 'Absent').length / secondH.length) * 100)
    : 0;
  const rateDiff = currRate - prevRate;

  // ── Monthly bar chart (last 6 months) ────────────────────────────────────
  const last6Months      = getLastNMonths(6);
  const monthlyChartData = last6Months.map(({ key, label }) => {
    const recs    = filteredRecords.filter(r => r.date?.startsWith(key));
    const present = recs.filter(r => r.status === 'Present').length;
    const absent  = recs.filter(r => r.status === 'Absent').length;
    const late    = recs.filter(r => r.status === 'Late').length;
    return { month: label, present, absent, late };
  });

  // ── Weekly bar chart (by day name) ────────────────────────────────────────
  const DAY_NAMES      = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const weeklyChartData = DAY_NAMES.map(day => {
    const recs  = filteredRecords.filter(r => r.day === day);
    const total = recs.length;
    const pres  = recs.filter(r => r.status !== 'Absent').length;
    return { day, rate: total > 0 ? Math.round((pres / total) * 100) : 0 };
  });

  // ── 6-week area chart ─────────────────────────────────────────────────────
  const weekGroups = {};
  filteredRecords.forEach(r => {
    if (!r.date) return;
    const wk = getWeekKey(r.date);
    if (!weekGroups[wk]) weekGroups[wk] = { total: 0, present: 0 };
    weekGroups[wk].total++;
    if (r.status !== 'Absent') weekGroups[wk].present++;
  });
  const areaChartData = Object.entries(weekGroups)
    .map(([week, v]) => ({
      week,
      rate: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-6);

  // ── Pie chart ─────────────────────────────────────────────────────────────
  const presentPct  = totalRecords > 0 ? Math.round(((totalPresent) / totalRecords) * 100) : 0;
  const absentPct   = totalRecords > 0 ? Math.round((totalAbsent  / totalRecords) * 100) : 0;
  const latePct     = totalRecords > 0 ? Math.round((totalLate    / totalRecords) * 100) : 0;
  const pieChartData = [
    { name: 'Present', value: presentPct, color: '#3b82f6' },
    { name: 'Absent',  value: absentPct,  color: '#f87171' },
    { name: 'Late',    value: latePct,    color: '#fbbf24' },
  ];

  // ── Class-wise report ─────────────────────────────────────────────────────
  const classReport = classes
    .filter(c => selectedClass === 'All' || c.name === selectedClass)
    .map(c => {
      const recs    = filteredRecords.filter(r => r.class === c.name);
      const present = recs.filter(r => r.status === 'Present').length;
      const absent  = recs.filter(r => r.status === 'Absent').length;
      const late    = recs.filter(r => r.status === 'Late').length;
      const rate    = recs.length > 0
        ? Math.round(((present + late) / recs.length) * 100)
        : (c.attendance || 0);
      return { name: c.name, present, absent, late, rate, enrolled: c.enrolled || 0 };
    });

  // ── Student-level report ──────────────────────────────────────────────────
  const studentReport = students
    .filter(s => selectedClass === 'All' || s.className === selectedClass)
    .map(s => ({ ...s, rate: s.attendance || 0 }))
    .sort((a, b) => b.rate - a.rate);

  const topStudents = studentReport.slice(0, 5);
  const lowStudents = studentReport.filter(s => s.rate < 75).slice(0, 5);

  // ── Class options for filter dropdown ─────────────────────────────────────
  const classOptions = [...new Set(classes.map(c => c.name).filter(Boolean))];

  // ── CSV export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    let headers, rows;
    if (activeTab === 'classes') {
      headers = ['Class', 'Enrolled', 'Present', 'Absent', 'Late', 'Rate'];
      rows    = classReport.map(c =>
        [c.name, c.enrolled, c.present, c.absent, c.late, `${c.rate}%`].join(',')
      );
    } else if (activeTab === 'students') {
      headers = ['Name', 'Student ID', 'Class', 'Attendance %'];
      rows    = studentReport.map(s =>
        [s.name, s.studentId, s.className, `${s.rate}%`].join(',')
      );
    } else {
      headers = ['Month', 'Present', 'Absent', 'Late'];
      rows    = monthlyChartData.map(m =>
        [m.month, m.present, m.absent, m.late].join(',')
      );
    }
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `attendx_report_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── Stat cards ────────────────────────────────────────────────────────────
  const stats = [
    {
      label: 'Overall Attendance',
      value: `${overallRate}%`,
      sub:   rateDiff !== 0
        ? `${rateDiff > 0 ? '+' : ''}${rateDiff}% vs prev period`
        : 'No comparison data',
      icon:  MdBarChart,
      color: 'text-blue-600',
      bg:    'bg-blue-50',
      trend: rateDiff >= 0 ? 'up' : 'down',
    },
    {
      label: 'Total Present',
      value: totalPresent.toLocaleString(),
      sub:   `${totalRecords} total records`,
      icon:  FaUserCheck,
      color: 'text-green-600',
      bg:    'bg-green-50',
      trend: 'up',
    },
    {
      label: 'Total Absent',
      value: totalAbsent.toLocaleString(),
      sub:   `${totalRecords > 0 ? Math.round((totalAbsent / totalRecords) * 100) : 0}% of records`,
      icon:  FaUserTimes,
      color: 'text-red-500',
      bg:    'bg-red-50',
      trend: 'down',
    },
    {
      label: 'Late Arrivals',
      value: totalLate.toLocaleString(),
      sub:   `${totalRecords > 0 ? Math.round((totalLate / totalRecords) * 100) : 0}% of records`,
      icon:  MdAccessTime,
      color: 'text-yellow-600',
      bg:    'bg-yellow-50',
      trend: 'down',
    },
  ];

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar user={user} onLogout={handleLogout}/>
        <div className="flex-1 ml-56 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"/>
            <p className="text-gray-400 text-sm">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} onLogout={handleLogout}/>

      <div className="flex-1 ml-56">

        {/* ── Top Bar ── */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <MdMenu className="w-5 h-5 text-gray-400"/>
            <h1 className="text-lg font-semibold text-gray-800">Attendance Reports</h1>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredRecords.length} records
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all disabled:opacity-50">
              <MdRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`}/>
              {refreshing ? 'Loading…' : 'Refresh'}
            </button>
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

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${s.color}`}/>
                    </div>
                    {s.trend === 'up'
                      ? <MdTrendingUp className="w-4 h-4 text-green-400"/>
                      : <MdTrendingDown className="w-4 h-4 text-red-400"/>}
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  <p className={`text-xs mt-0.5 ${s.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {s.sub}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── Filter Bar ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <MdFilterList className="w-4 h-4 text-gray-400"/>
                <span className="text-xs text-gray-500 font-medium">Period:</span>
              </div>
              {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
                <button key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                    ${period === p
                      ? 'bg-blue-500 text-white'
                      : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {p}
                </button>
              ))}

              <div className="w-px h-5 bg-gray-200 mx-1"/>

              {/* Class filter */}
              <select value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-500 focus:outline-none bg-white">
                <option value="All">All Classes</option>
                {classOptions.map(c => <option key={c}>{c}</option>)}
              </select>

              {/* Date range */}
              <div className="flex items-center gap-2">
                <input type="date" value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-500 focus:outline-none"/>
                <span className="text-gray-400 text-xs">to</span>
                <input type="date" value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-500 focus:outline-none"/>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => {
                    setPeriod('monthly'); setSelectedClass('All');
                    setDateFrom(''); setDateTo('');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-all">
                  <MdRefresh className="w-4 h-4"/>
                  Reset
                </button>
                <button onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-xl transition-all">
                  <MdDownload className="w-4 h-4"/>
                  Export CSV
                </button>
                <button onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-500 text-xs font-medium rounded-xl hover:bg-gray-50 transition-all">
                  <MdPrint className="w-4 h-4"/>
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
            {[
              { key: 'overview', label: 'Overview',   icon: MdBarChart },
              { key: 'classes',  label: 'By Class',   icon: MdClass },
              { key: 'students', label: 'By Student', icon: MdPeople },
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

          {/* No data notice */}
          {filteredRecords.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-5 py-3 mb-5 flex items-center gap-2">
              <span className="text-yellow-500 text-sm">⚠️</span>
              <p className="text-xs text-yellow-700">
                No attendance records found for the selected filters. Charts will show empty data.
              </p>
            </div>
          )}

          {/* ══════════════ OVERVIEW TAB ══════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-5">

              <div className="grid grid-cols-3 gap-5">

                {/* Monthly Bar Chart */}
                <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 text-sm">Monthly Attendance Overview</h3>
                    <span className="text-xs text-gray-400">Last 6 months</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyChartData} barSize={14}>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                      <Tooltip/>
                      <Legend wrapperStyle={{ fontSize: '11px' }}/>
                      <Bar dataKey="present" name="Present" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                      <Bar dataKey="absent"  name="Absent"  fill="#f87171" radius={[4, 4, 0, 0]}/>
                      <Bar dataKey="late"    name="Late"    fill="#fbbf24" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Distribution */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 text-sm mb-4">Attendance Distribution</h3>
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieChartData} cx="50%" cy="50%"
                          innerRadius={50} outerRadius={75}
                          dataKey="value" startAngle={90} endAngle={-270}>
                          {pieChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color}/>
                          ))}
                        </Pie>
                        <Tooltip formatter={v => [`${v}%`]}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className={`text-xl font-bold ${attendanceTextColor(overallRate)}`}>
                          {overallRate}%
                        </p>
                        <p className="text-xs text-gray-400">Overall</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    {pieChartData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}/>
                          <span className="text-xs text-gray-500">{d.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">

                {/* Weekly bar */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 text-sm mb-4">
                    Daily Attendance Rate (This Week)
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weeklyChartData} barSize={28}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                        domain={[0, 100]} tickFormatter={v => `${v}%`}/>
                      <Tooltip formatter={v => [`${v}%`, 'Rate']}/>
                      <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                        {weeklyChartData.map((entry, i) => (
                          <Cell key={i}
                            fill={entry.rate >= 85 ? '#3b82f6' : entry.rate >= 75 ? '#fbbf24' : '#f87171'}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 6-week area chart */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 text-sm mb-4">
                    Weekly Attendance Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={areaChartData}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                        domain={[0, 100]} tickFormatter={v => `${v}%`}/>
                      <Tooltip formatter={v => [`${v}%`, 'Rate']}/>
                      <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2}
                        fill="url(#colorRate)" dot={{ fill: '#3b82f6', r: 4 }}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ BY CLASS TAB ══════════════ */}
          {activeTab === 'classes' && (
            <div className="space-y-5">

              {/* Class bar chart */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800 text-sm">Attendance Rate by Class</h3>
                  <span className="text-xs text-gray-400">{classReport.length} classes</span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={classReport} barSize={20}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                      domain={[0, 100]} tickFormatter={v => `${v}%`}/>
                    <Tooltip/>
                    <Legend wrapperStyle={{ fontSize: '11px' }}/>
                    <Bar dataKey="present" name="Present" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                    <Bar dataKey="absent"  name="Absent"  fill="#f87171" radius={[4, 4, 0, 0]}/>
                    <Bar dataKey="late"    name="Late"    fill="#fbbf24" radius={[4, 4, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Class detail table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 text-sm">Detailed Class Report</h3>
                  <button onClick={exportCSV}
                    className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all">
                    <MdDownload className="w-3.5 h-3.5"/>
                    Export
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Class', 'Enrolled', 'Present', 'Absent', 'Late', 'Attendance Rate', 'Status'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classReport.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-300 text-sm">
                          No class data found
                        </td>
                      </tr>
                    ) : classReport.map((cls, i) => {
                      const lbl = attendanceLabel(cls.rate);
                      return (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                          <td className="px-5 py-3">
                            <span className="text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                              {cls.name}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-500">{cls.enrolled}</td>
                          <td className="px-5 py-3 text-sm font-medium text-green-500">{cls.present}</td>
                          <td className="px-5 py-3 text-sm font-medium text-red-400">{cls.absent}</td>
                          <td className="px-5 py-3 text-sm font-medium text-yellow-500">{cls.late}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-gray-100 rounded-full">
                                <div
                                  className={`h-1.5 rounded-full ${attendanceBgColor(cls.rate)}`}
                                  style={{ width: `${cls.rate}%` }}/>
                              </div>
                              <span className={`text-xs font-bold ${attendanceTextColor(cls.rate)}`}>
                                {cls.rate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${lbl.cls}`}>
                              {lbl.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════ BY STUDENT TAB ══════════════ */}
          {activeTab === 'students' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">

                {/* Top Students */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <MdTrendingUp className="w-4 h-4 text-green-500"/>
                    <h3 className="font-semibold text-gray-800 text-sm">Top Attendance Students</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {topStudents.length === 0 ? (
                      <p className="text-gray-300 text-xs text-center py-8">No student data</p>
                    ) : topStudents.map((s, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                          ${i === 0 ? 'bg-yellow-400 text-white'
                          : i === 1 ? 'bg-gray-300 text-white'
                          : i === 2 ? 'bg-orange-400 text-white'
                          : 'bg-gray-100 text-gray-500'}`}>
                          {i + 1}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {s.photo
                            ? <img src={s.photo} alt={s.name} className="w-full h-full object-cover"/>
                            : <span className="text-blue-600 font-bold text-xs">{s.name?.charAt(0)}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.className} · {s.studentId}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-green-600">{s.rate}%</p>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1">
                            <div className="h-1.5 bg-green-400 rounded-full" style={{ width: `${s.rate}%` }}/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Students */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <MdTrendingDown className="w-4 h-4 text-red-400"/>
                    <h3 className="font-semibold text-gray-800 text-sm">Students Needing Attention</h3>
                    <span className="ml-auto text-xs text-red-400 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                      Below 75%
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    {lowStudents.length === 0 ? (
                      <div className="text-center py-8">
                        <MdCheckCircle className="w-8 h-8 text-green-300 mx-auto mb-2"/>
                        <p className="text-gray-400 text-xs">All students above 75% — great!</p>
                      </div>
                    ) : (
                      <>
                        {lowStudents.map((s, i) => (
                          <div key={i} className="flex items-center gap-3 bg-red-50 rounded-xl p-3 border border-red-100">
                            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {s.photo
                                ? <img src={s.photo} alt={s.name} className="w-full h-full object-cover"/>
                                : <span className="text-red-500 font-bold text-xs">{s.name?.charAt(0)}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                              <p className="text-xs text-gray-400">{s.className} · {s.studentId}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-red-500">{s.rate}%</p>
                              <div className="w-16 h-1.5 bg-red-100 rounded-full mt-1">
                                <div className="h-1.5 bg-red-400 rounded-full" style={{ width: `${s.rate}%` }}/>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                          <p className="text-xs text-yellow-700 font-medium">
                            ⚠️ {lowStudents.length} student{lowStudents.length > 1 ? 's' : ''} below 75% — immediate attention required
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* All students bar chart */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    All Students Attendance Rate
                  </h3>
                  <span className="text-xs text-gray-400">
                    {studentReport.length} students · sorted by rate
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={studentReport.slice(0, 20).map(s => ({
                      name: s.name?.split(' ')[0] || '?',
                      rate: s.rate,
                    }))}
                    barSize={20}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                      domain={[0, 100]} tickFormatter={v => `${v}%`}/>
                    <Tooltip formatter={v => [`${v}%`, 'Attendance']}/>
                    <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                      {studentReport.slice(0, 20).map((s, i) => (
                        <Cell key={i}
                          fill={s.rate >= 85 ? '#3b82f6' : s.rate >= 70 ? '#fbbf24' : '#f87171'}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {studentReport.length > 20 && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Showing top 20 of {studentReport.length} students
                  </p>
                )}
              </div>

              {/* Full student table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 text-sm">Full Student Report</h3>
                  <button onClick={exportCSV}
                    className="flex items-center gap-1.5 text-xs text-blue-500 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all">
                    <MdDownload className="w-3.5 h-3.5"/>
                    Export
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['#', 'Student', 'Student ID', 'Class', 'Status', 'Attendance', 'Rating'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentReport.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-300 text-sm">No student data</td>
                      </tr>
                    ) : studentReport.map((s, i) => {
                      const lbl = attendanceLabel(s.rate);
                      return (
                        <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                          <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {s.photo
                                  ? <img src={s.photo} alt={s.name} className="w-full h-full object-cover"/>
                                  : <span className="text-blue-600 font-bold text-xs">{s.name?.charAt(0)}</span>}
                              </div>
                              <span className="text-sm font-medium text-gray-800">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                              {s.studentId}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                              {s.className}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium
                              ${s.status === 'Active'
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : s.status === 'Suspended'
                                ? 'bg-red-50 text-red-500 border-red-100'
                                : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-gray-100 rounded-full">
                                <div
                                  className={`h-1.5 rounded-full ${attendanceBgColor(s.rate)}`}
                                  style={{ width: `${s.rate}%` }}/>
                              </div>
                              <span className={`text-xs font-bold ${attendanceTextColor(s.rate)}`}>
                                {s.rate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${lbl.cls}`}>
                              {lbl.text}
                            </span>
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