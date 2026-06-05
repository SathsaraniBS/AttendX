import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

// ==================== DATA ====================
const attendanceData = [
  { date: '22 May', value: 72 },
  { date: '23 May', value: 85 },
  { date: '24 May', value: 68 },
  { date: '25 May', value: 63 },
  { date: '26 May', value: 75 },
  { date: '27 May', value: 80 },
  { date: '28 May', value: 77 },
];

const barData = [
  { date: '22 May', value: 75 },
  { date: '23 May', value: 82 },
  { date: '24 May', value: 70 },
  { date: '25 May', value: 68 },
  { date: '26 May', value: 78 },
  { date: '27 May', value: 85 },
  { date: '28 May', value: 77 },
];

const classData = [
  { name: 'BCA - 2A', value: 80.20, color: '#3b82f6' },
  { name: 'BCA - 2B', value: 75.10, color: '#f59e0b' },
  { name: 'BCA - 3A', value: 78.40, color: '#10b981' },
  { name: 'BCA - 3B', value: 76.30, color: '#f97316' },
  { name: 'BCA - 1A', value: 77.80, color: '#8b5cf6' },
];

const recentAttendance = [
  { name: 'Kasun Perera', cls: 'CS - 2A', time: '09:15 AM', status: 'Present' },
  { name: 'Nimal Silva', cls: 'CS - 2A', time: '09:14 AM', status: 'Present' },
  { name: 'Amali Fernando', cls: 'CS - 2B', time: '09:13 AM', status: 'Present' },
  { name: 'Sathsarani', cls: 'CS - 2B', time: '09:12 AM', status: 'Present' },
  { name: 'Kasun Bandara', cls: 'CS - 2A', time: '09:11 AM', status: 'Present' },
];

const summaryData = [
  { period: 'Today', totalClasses: 12, classesHeld: 12, present: 186, absent: 54, rate: '77.50%' },
  { period: 'This Week', totalClasses: 60, classesHeld: 60, present: 909, absent: 261, rate: '77.50%' },
  { period: 'This Month', totalClasses: 240, classesHeld: 235, present: 3560, absent: 1040, rate: '77.50%' },
];

// ==================== SIDEBAR ====================
const mainNavItems = [
  { path: '/live', icon: '📷', label: 'Mark Attendance' },
  { path: '/attendance-history', icon: '🕐', label: 'Attendance History' },
  { path: '/students', icon: '👥', label: 'Students' },
  { path: '/users', icon: '👤', label: 'Users' },
  { path: '/classes', icon: '📚', label: 'Classes' },
  { path: '/reports', icon: '📊', label: 'Reports' },
];

const settingsNavItems = [
  { path: '/settings', icon: '⚙️', label: 'System Settings' },
  { path: '/notifications', icon: '🔔', label: 'Notification' },
  { path: '/backup', icon: '☁️', label: 'Backup' },
  { path: '/logs', icon: '📋', label: 'Activity Logs' },
];

function Sidebar({ user, onLogout }) {
  const location = useLocation();

  const NavItem = ({ item }) => (
    <Link to={item.path}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-all duration-200 text-sm
        ${location.pathname === item.path
          ? 'bg-blue-600 text-white'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
      <span className="text-base w-5 text-center">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-[#0f1729] flex flex-col z-50 overflow-y-auto">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">👁️</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">FRAS</p>
            <p className="text-gray-400 text-xs leading-tight">Face Recognition</p>
            <p className="text-gray-400 text-xs leading-tight">Attendance System</p>
          </div>
        </div>
      </div>

      {/* Dashboard Link */}
      <div className="mt-4 mb-1">
        <Link to="/dashboard"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-all text-sm
            ${location.pathname === '/dashboard'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
          <span className="text-base w-5 text-center">🏠</span>
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Main Section */}
      <div className="px-4 py-2">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Main</p>
      </div>
      <nav className="space-y-0.5">
        {mainNavItems.map(item => <NavItem key={item.path} item={item}/>)}
      </nav>

      {/* Settings Section */}
      <div className="px-4 py-2 mt-4">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Settings</p>
      </div>
      <nav className="space-y-0.5">
        {settingsNavItems.map(item => <NavItem key={item.path} item={item}/>)}
      </nav>

      {/* Admin Profile */}
      <div className="mt-auto border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</p>
            <p className="text-gray-400 text-xs truncate">System Administrator</p>
          </div>
          <button onClick={onLogout} title="Logout"
            className="text-gray-400 hover:text-red-400 transition-all text-sm">
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
}

// ==================== DASHBOARD ====================
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined' && userData !== 'null') {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      localStorage.clear();
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const statCards = [
    { label: 'Total Students', value: '240', sub: 'View all students →', icon: '👥', light: 'bg-blue-50', iconBg: 'bg-blue-100' },
    { label: 'Present Today', value: '186', sub: '77.50% of total', icon: '✅', light: 'bg-green-50', iconBg: 'bg-green-100' },
    { label: 'Absent Today', value: '54', sub: '22.50% of total', icon: '❌', light: 'bg-orange-50', iconBg: 'bg-orange-100' },
    { label: 'Total Classes', value: '12', sub: 'View all classes →', icon: '📅', light: 'bg-purple-50', iconBg: 'bg-purple-100' },
    { label: 'Attendance Rate', value: '77.50%', sub: 'This Month', icon: '📊', light: 'bg-blue-50', iconBg: 'bg-blue-100' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <Sidebar user={user} onLogout={handleLogout}/>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-56">

        {/* Top Bar */}
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
            <div className="flex items-center gap-2 text-gray-500 text-sm border border-gray-200 rounded-lg px-3 py-1.5">
              <span>📅</span>
              <span>{new Date().toLocaleDateString('en-US', {
                day: 'numeric', month: 'long',
                year: 'numeric', weekday: 'long'
              })}</span>
            </div>
            <button className="relative text-gray-400 hover:text-gray-600">
              <span className="text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
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

          {/* Stat Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                  <span className="text-lg">{card.icon}</span>
                </div>
                <p className="text-xs text-blue-500 font-semibold mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{card.value}</p>
                <p className="text-xs text-gray-400">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Line Chart + Recent Attendance */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <div className="col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-800 font-semibold text-sm">Attendance Overview</h2>
                <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 focus:outline-none">
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={attendanceData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`}/>
                  <Tooltip formatter={(v) => [`${v}%`, 'Attendance']}/>
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-800 font-semibold text-sm">Recent Attendance</h2>
                <button className="text-blue-500 text-xs hover:underline">View all</button>
              </div>
              <div className="space-y-3">
                {recentAttendance.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs flex-shrink-0 border border-gray-200">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-xs font-medium truncate">{s.name}</p>
                      <p className="text-gray-400 text-xs">{s.cls}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-gray-400 text-xs">{s.time}</p>
                      <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100">
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pie + Bar + Quick Actions */}
          <div className="grid grid-cols-3 gap-5 mb-5">

            {/* Pie Chart */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-800 font-semibold text-sm">Attendance by Class</h2>
                <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-500 focus:outline-none">
                  <option>This Month</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0" style={{width: 120, height: 120}}>
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={classData} cx={55} cy={55} innerRadius={36} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270}>
                        {classData.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-800">77.50%</p>
                      <p className="text-xs text-gray-400">Overall</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 flex-1">
                  {classData.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }}></div>
                      <span className="text-xs text-gray-500 flex-1 truncate">{c.name}</span>
                      <span className="text-xs font-medium text-gray-700">{c.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-800 font-semibold text-sm">Attendance Trend</h2>
                <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-500 focus:outline-none">
                  <option>This Week</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} barSize={14}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                  <YAxis hide domain={[0, 100]}/>
                  <Tooltip formatter={(v) => [`${v}%`, 'Attendance']}/>
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-gray-800 font-semibold text-sm mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Mark Attendance', icon: '📷', color: 'bg-blue-50 text-blue-600 border-blue-100', path: '/live' },
                  { label: 'Add Student', icon: '👤', color: 'bg-green-50 text-green-600 border-green-100', path: '/students/add' },
                  { label: 'Add User', icon: '👥', color: 'bg-purple-50 text-purple-600 border-purple-100', path: '/settings' },
                  { label: 'Generate Report', icon: '📊', color: 'bg-orange-50 text-orange-600 border-orange-100', path: '/reports' },
                ].map((action, i) => (
                  <button key={i} onClick={() => navigate(action.path)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${action.color} hover:opacity-80 transition-all text-xs font-medium`}>
                    <span className="text-xl">{action.icon}</span>
                    <span className="text-center leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => navigate('/attendance')}
                className="mt-3 w-full py-2.5 border border-gray-200 rounded-xl text-gray-500 text-xs font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                🕐 View Attendance History
              </button>
            </div>
          </div>

          {/* Summary Table + System Overview */}
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-gray-800 font-semibold text-sm">Attendance Summary</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {['Period', 'Total Classes', 'Classes Held', 'Present', 'Absent', 'Attendance Rate'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((row, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-all">
                      <td className="px-4 py-3 text-sm text-gray-700">{row.period}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.totalClasses}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.classesHeld}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-500">{row.present}</td>
                      <td className="px-4 py-3 text-sm font-medium text-red-400">{row.absent}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                            <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: row.rate }}></div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{row.rate}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* System Overview */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-gray-800 font-semibold text-sm mb-4">System Overview</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Users', value: '18', icon: '👥', color: 'bg-blue-50' },
                  { label: 'Active Users', value: '15', icon: '✅', color: 'bg-green-50' },
                  { label: 'Storage Used', value: '23.4 GB / 100 GB', icon: '💾', color: 'bg-orange-50' },
                  { label: 'System Status', value: 'All Systems Operational', icon: '🟢', color: 'bg-green-50' },
                ].map((item, i) => (
                  <div key={i} className={`${item.color} rounded-xl p-3`}>
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-xs text-gray-500 mt-2">{item.label}</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}