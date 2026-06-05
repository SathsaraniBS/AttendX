import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

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
  { name: 'Kasun Perera', class: 'CS - 2A', time: '09:15 AM', status: 'Present' },
  { name: 'Nimal Silva', class: 'CS - 2A', time: '09:14 AM', status: 'Present' },
  { name: 'Amali Fernando', class: 'CS - 2B', time: '09:13 AM', status: 'Present' },
  { name: 'Sathsarani', class: 'CS - 2B', time: '09:12 AM', status: 'Present' },
  { name: 'Kasun Bandara', class: 'CS - 2A', time: '09:11 AM', status: 'Present' },
];

const summaryData = [
  { period: 'Today', totalClasses: 12, classesHeld: 12, present: 186, absent: 54, rate: '77.50%' },
  { period: 'This Week', totalClasses: 60, classesHeld: 60, present: 909, absent: 261, rate: '77.50%' },
  { period: 'This Month', totalClasses: 240, classesHeld: 235, present: 3560, absent: 1040, rate: '77.50%' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ✅ FIXED — Safe JSON parse
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/');
      return;
    }

    try {
      if (userData && userData !== 'undefined' && userData !== 'null') {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error('Parse error:', err);
      localStorage.clear();
      navigate('/');
    }
  }, [navigate]);

  const statCards = [
    { label: 'Total Students', value: '240', sub: 'View all students →', icon: '👥', light: 'bg-blue-50' },
    { label: 'Present Today', value: '186', sub: '77.50% of total', icon: '✅', light: 'bg-green-50' },
    { label: 'Absent Today', value: '54', sub: '22.50% of total', icon: '❌', light: 'bg-orange-50' },
    { label: 'Total Classes', value: '12', sub: 'View all classes →', icon: '📅', light: 'bg-purple-50' },
    { label: 'Attendance Rate', value: '77.50%', sub: 'This Month', icon: '📊', light: 'bg-blue-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center ml-64">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm border border-gray-200 rounded-lg px-3 py-2">
            <span>📅</span>
            <span>{new Date().toLocaleDateString('en-US', {
              day: 'numeric', month: 'long',
              year: 'numeric', weekday: 'long'
            })}</span>
          </div>
          <button className="relative text-gray-500 hover:text-gray-700">
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">A</div>
            <span className="text-gray-700 text-sm font-medium">{user?.name || 'Admin'}</span>
            <span className="text-gray-400 text-xs">▼</span>
          </div>
        </div>
      </div>

      <div className="ml-64 p-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${card.light} rounded-lg flex items-center justify-center`}>
                  <span className="text-lg">{card.icon}</span>
                </div>
              </div>
              <p className="text-xs text-blue-500 font-medium mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800 mb-1">{card.value}</p>
              <p className="text-xs text-gray-400">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6 mb-6">

          {/* Line Chart */}
          <div className="col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-800 font-semibold">Attendance Overview</h2>
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

          {/* Recent Attendance */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-800 font-semibold">Recent Attendance</h2>
              <button className="text-blue-500 text-xs hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {recentAttendance.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xs flex-shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-xs font-medium truncate">{s.name}</p>
                    <p className="text-gray-400 text-xs">{s.class}</p>
                  </div>
                  <div className="text-right">
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

        {/* Bottom Row */}
        <div className="grid grid-cols-3 gap-6 mb-6">

          {/* Pie Chart */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-800 font-semibold">Attendance by Class</h2>
              <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 focus:outline-none">
                <option>This Month</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 flex-shrink-0">
                <ResponsiveContainer width={128} height={128}>
                  <PieChart>
                    <Pie data={classData} cx={60} cy={60} innerRadius={38} outerRadius={58} dataKey="value" startAngle={90} endAngle={-270}>
                      {classData.map((entry, i) => (
                        <Cell key={i} fill={entry.color}/>
                      ))}
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
              <div className="space-y-2 flex-1">
                {classData.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }}></div>
                    <span className="text-xs text-gray-500 flex-1">{c.name}</span>
                    <span className="text-xs font-medium text-gray-700">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-800 font-semibold">Attendance Trend</h2>
              <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 focus:outline-none">
                <option>This Week</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} barSize={16}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                <YAxis hide domain={[0, 100]}/>
                <Tooltip formatter={(v) => [`${v}%`, 'Attendance']}/>
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <h2 className="text-gray-800 font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Mark Attendance', icon: '📷', color: 'bg-blue-50 text-blue-600 border-blue-100', path: '/live' },
                { label: 'Add Student', icon: '👤', color: 'bg-green-50 text-green-600 border-green-100', path: '/students/add' },
                { label: 'Add User', icon: '👥', color: 'bg-purple-50 text-purple-600 border-purple-100', path: '/settings' },
                { label: 'Generate Report', icon: '📊', color: 'bg-orange-50 text-orange-600 border-orange-100', path: '/reports' },
              ].map((action, i) => (
                <button key={i}
                  onClick={() => navigate(action.path)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${action.color} hover:opacity-80 transition-all text-xs font-medium`}>
                  <span className="text-xl">{action.icon}</span>
                  {action.label}
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

        {/* Summary Table + System Overview */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-gray-800 font-semibold">Attendance Summary</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {['Period', 'Total Classes', 'Classes Held', 'Present', 'Absent', 'Attendance Rate'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summaryData.map((row, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-all">
                    <td className="px-5 py-3 text-sm text-gray-700">{row.period}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{row.totalClasses}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{row.classesHeld}</td>
                    <td className="px-5 py-3 text-sm font-medium text-green-500">{row.present}</td>
                    <td className="px-5 py-3 text-sm font-medium text-red-400">{row.absent}</td>
                    <td className="px-5 py-3">
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
            <h2 className="text-gray-800 font-semibold mb-4">System Overview</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Users', value: '18', icon: '👥', color: 'bg-blue-50' },
                { label: 'Active Users', value: '15', icon: '✅', color: 'bg-green-50' },
                { label: 'Storage Used', value: '23.4 GB', icon: '💾', color: 'bg-orange-50' },
                { label: 'System Status', value: 'Operational', icon: '🟢', color: 'bg-green-50' },
              ].map((item, i) => (
                <div key={i} className={`${item.color} rounded-xl p-3`}>
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-xs text-gray-500 mt-2">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-700">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}