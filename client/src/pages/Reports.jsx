import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdPeople, MdClass, MdSettings,
  MdNotifications, MdBackup, MdAssignment,
  MdVisibility, MdHistory, MdBarChart,
  MdLogout, MdMenu, MdCalendarToday,
  MdDownload, MdPrint, MdFilterList,
  MdCheckCircle, MdCancel, MdAccessTime,
  MdTrendingUp, MdTrendingDown, MdRefresh
} from 'react-icons/md';
import { FaUserCheck, FaUserTimes, FaChartPie } from 'react-icons/fa';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';


// ==================== DATA ====================
const monthlyData = [
  { month: 'Jan', present: 88, absent: 12, late: 5 },
  { month: 'Feb', present: 82, absent: 18, late: 8 },
  { month: 'Mar', present: 91, absent: 9, late: 4 },
  { month: 'Apr', present: 78, absent: 22, late: 10 },
  { month: 'May', present: 85, absent: 15, late: 6 },
  { month: 'Jun', present: 89, absent: 11, late: 3 },
];

const weeklyData = [
  { day: 'Mon', rate: 85 },
  { day: 'Tue', rate: 78 },
  { day: 'Wed', rate: 92 },
  { day: 'Thu', rate: 70 },
  { day: 'Fri', rate: 88 },
];

const classData = [
  { name: 'BCA-2A', present: 80, absent: 10, late: 5, rate: 84 },
  { name: 'BCA-2B', present: 75, absent: 15, late: 8, rate: 77 },
  { name: 'BCA-3A', present: 88, absent: 7, late: 3, rate: 91 },
  { name: 'BCA-3B', present: 72, absent: 18, late: 6, rate: 76 },
  { name: 'BCA-1A', present: 91, absent: 5, late: 2, rate: 94 },
];

const pieData = [
  { name: 'Present', value: 77.5, color: '#3b82f6' },
  { name: 'Absent', value: 14.5, color: '#f87171' },
  { name: 'Late', value: 8, color: '#fbbf24' },
];

const topStudents = [
  { name: 'Dilani Jayawardena', id: 'S2024007', class: 'BCA-3B', rate: 98 },
  { name: 'Amali Fernando', id: 'S2024003', class: 'BCA-2B', rate: 96 },
  { name: 'Sathsarani BS', id: 'S2024004', class: 'BCA-2B', rate: 94 },
  { name: 'Kasun Perera', id: 'S2024001', class: 'BCA-2A', rate: 91 },
  { name: 'Chamara Silva', id: 'S2024006', class: 'BCA-3A', rate: 89 },
];

const lowStudents = [
  { name: 'Eranga Bandara', id: 'S2024008', class: 'BCA-1A', rate: 30 },
  { name: 'Bandara Perera', id: 'S2024005', class: 'BCA-3A', rate: 45 },
  { name: 'Nimal Silva', id: 'S2024002', class: 'BCA-2A', rate: 58 },
];

const areaData = [
  { week: 'W1', rate: 82 },
  { week: 'W2', rate: 75 },
  { week: 'W3', rate: 88 },
  { week: 'W4', rate: 79 },
  { week: 'W5', rate: 91 },
  { week: 'W6', rate: 85 },
];

// ==================== REPORTS PAGE ====================
export default function Reports() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [selectedClass, setSelectedClass] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined') setUser(JSON.parse(userData));
    } catch { navigate('/'); }
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const exportCSV = () => {
    const headers = ['Class', 'Present', 'Absent', 'Late', 'Rate'];
    const rows = classData.map(c =>
      [c.name, c.present, c.absent, c.late, `${c.rate}%`].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = [
    { label: 'Overall Attendance', value: '77.50%', sub: '+2.3% vs last month', icon: MdBarChart, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'up' },
    { label: 'Total Present', value: '3,560', sub: 'This month', icon: FaUserCheck, color: 'text-green-600', bg: 'bg-green-50', trend: 'up' },
    { label: 'Total Absent', value: '1,040', sub: 'This month', icon: FaUserTimes, color: 'text-red-500', bg: 'bg-red-50', trend: 'down' },
    { label: 'Late Arrivals', value: '284', sub: 'This month', icon: MdAccessTime, color: 'text-yellow-600', bg: 'bg-yellow-50', trend: 'down' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <Sidebar user={user} onLogout={handleLogout}/> */}

      <div className="flex-1 ml-56">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <MdMenu className="w-5 h-5 text-gray-400"/>
            <h1 className="text-lg font-semibold text-gray-800">Attendance Reports</h1>
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

          {/* Filter Bar */}
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
                    ${period === p ? 'bg-blue-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {p}
                </button>
              ))}

              <div className="w-px h-5 bg-gray-200 mx-1"/>

              <select value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-500 focus:outline-none bg-white">
                <option value="All">All Classes</option>
                {['BCA-1A', 'BCA-2A', 'BCA-2B', 'BCA-3A', 'BCA-3B'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>

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
                  onClick={() => { setPeriod('monthly'); setSelectedClass('All'); setDateFrom(''); setDateTo(''); }}
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

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
            {[
              { key: 'overview', label: 'Overview', icon: MdBarChart },
              { key: 'classes', label: 'By Class', icon: MdClass },
              { key: 'students', label: 'By Student', icon: MdPeople },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeTab === tab.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Icon className="w-4 h-4"/>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-5">

              {/* Charts Row 1 */}
              <div className="grid grid-cols-3 gap-5">

                {/* Monthly Bar Chart */}
                <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 text-sm">Monthly Attendance Overview</h3>
                    <span className="text-xs text-gray-400">2024</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyData} barSize={14}>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]}/>
                      <Tooltip/>
                      <Legend wrapperStyle={{ fontSize: '11px' }}/>
                      <Bar dataKey="present" name="Present" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                      <Bar dataKey="absent" name="Absent" fill="#f87171" radius={[4, 4, 0, 0]}/>
                      <Bar dataKey="late" name="Late" fill="#fbbf24" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 text-sm mb-4">Attendance Distribution</h3>
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%"
                          innerRadius={50} outerRadius={75}
                          dataKey="value" startAngle={90} endAngle={-270}>
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color}/>
                          ))}
                        </Pie>
                        <Tooltip formatter={v => [`${v}%`]}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-800">77.5%</p>
                        <p className="text-xs text-gray-400">Overall</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                          <span className="text-xs text-gray-500">{d.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-2 gap-5">

                {/* Weekly Bar */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 text-sm mb-4">Daily Attendance Rate (This Week)</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weeklyData} barSize={28}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`}/>
                      <Tooltip formatter={v => [`${v}%`, 'Rate']}/>
                      <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                        {weeklyData.map((entry, i) => (
                          <Cell key={i} fill={entry.rate >= 85 ? '#3b82f6' : entry.rate >= 75 ? '#fbbf24' : '#f87171'}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Area Chart */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 text-sm mb-4">6-Week Attendance Trend</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={areaData}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[60, 100]} tickFormatter={v => `${v}%`}/>
                      <Tooltip formatter={v => [`${v}%`, 'Rate']}/>
                      <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRate)" dot={{ fill: '#3b82f6', r: 4 }}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* BY CLASS TAB */}
          {activeTab === 'classes' && (
            <div className="space-y-5">

              {/* Class Bar Chart */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">Attendance Rate by Class</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={classData} barSize={24}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`}/>
                    <Tooltip/>
                    <Legend wrapperStyle={{ fontSize: '11px' }}/>
                    <Bar dataKey="present" name="Present" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                    <Bar dataKey="absent" name="Absent" fill="#f87171" radius={[4, 4, 0, 0]}/>
                    <Bar dataKey="late" name="Late" fill="#fbbf24" radius={[4, 4, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Class Table */}
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
                      {['Class', 'Present', 'Absent', 'Late', 'Total', 'Attendance Rate', 'Status'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classData.map((cls, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                        <td className="px-5 py-3">
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                            {cls.name}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-green-500">{cls.present}</td>
                        <td className="px-5 py-3 text-sm font-medium text-red-400">{cls.absent}</td>
                        <td className="px-5 py-3 text-sm font-medium text-yellow-500">{cls.late}</td>
                        <td className="px-5 py-3 text-sm text-gray-600">{cls.present + cls.absent + cls.late}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full">
                              <div
                                className={`h-1.5 rounded-full ${cls.rate >= 85 ? 'bg-green-400' : cls.rate >= 70 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                style={{ width: `${cls.rate}%` }}></div>
                            </div>
                            <span className={`text-xs font-bold ${cls.rate >= 85 ? 'text-green-600' : cls.rate >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>
                              {cls.rate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium
                            ${cls.rate >= 85 ? 'bg-green-50 text-green-600 border-green-100'
                            : cls.rate >= 70 ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                            : 'bg-red-50 text-red-500 border-red-100'}`}>
                            {cls.rate >= 85 ? 'Excellent' : cls.rate >= 70 ? 'Good' : 'Needs Attention'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BY STUDENT TAB */}
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
                    {topStudents.map((s, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                          ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {i + 1}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold text-xs">{s.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.class} · {s.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">{s.rate}%</p>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1">
                            <div className="h-1.5 bg-green-400 rounded-full" style={{ width: `${s.rate}%` }}></div>
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
                  </div>
                  <div className="p-4 space-y-3">
                    {lowStudents.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 bg-red-50 rounded-xl p-3 border border-red-100">
                        <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-red-500 font-bold text-xs">{s.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.class} · {s.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-500">{s.rate}%</p>
                          <div className="w-16 h-1.5 bg-red-100 rounded-full mt-1">
                            <div className="h-1.5 bg-red-400 rounded-full" style={{ width: `${s.rate}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                      <p className="text-xs text-yellow-700 font-medium">
                        ⚠️ Students below 60% attendance require immediate attention
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Rate Chart */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">All Students Attendance Rate</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={[...topStudents, ...lowStudents].map(s => ({ name: s.name.split(' ')[0], rate: s.rate }))}
                    barSize={28}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`}/>
                    <Tooltip formatter={v => [`${v}%`, 'Attendance']}/>
                    <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                      {[...topStudents, ...lowStudents].map((s, i) => (
                        <Cell key={i} fill={s.rate >= 85 ? '#3b82f6' : s.rate >= 70 ? '#fbbf24' : '#f87171'}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}