import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdPeople, MdClass, MdSettings,
  MdNotifications, MdBackup, MdAssignment,
  MdVisibility, MdHistory, MdBarChart,
  MdLogout, MdMenu, MdCalendarToday,
  MdCheck, MdClose, MdDelete,
  MdCheckCircle, MdWarning, MdInfo,
  MdError, MdFilterList, MdSearch,
  MdDoneAll, MdDeleteSweep, MdRefresh,
  MdPerson, MdSchool, MdAccessTime
} from 'react-icons/md';
import { FaBell, FaBellSlash } from 'react-icons/fa';
import AdminSidebar from '../components/AdminComponents/AdminSidebar';

// ==================== SAMPLE NOTIFICATIONS ====================
const generateNotifications = () => [
  {
    id: 1, type: 'warning', category: 'attendance',
    title: 'Low Attendance Alert',
    message: 'Eranga Bandara attendance dropped below 60%. Current rate: 30%',
    time: '2 minutes ago', date: new Date().toISOString(),
    read: false, student: 'Eranga Bandara', class: 'BCA-1A'
  },
  {
    id: 2, type: 'success', category: 'attendance',
    title: 'Attendance Marked Successfully',
    message: '24 students marked present in BCA-2A for today.',
    time: '15 minutes ago', date: new Date().toISOString(),
    read: false, class: 'BCA-2A'
  },
  {
    id: 3, type: 'info', category: 'system',
    title: 'System Backup Completed',
    message: 'Automatic database backup completed successfully. Size: 23.4 MB',
    time: '1 hour ago', date: new Date().toISOString(),
    read: false
  },
  {
    id: 4, type: 'warning', category: 'attendance',
    title: 'Low Attendance Alert',
    message: 'Bandara Perera attendance dropped below 60%. Current rate: 45%',
    time: '2 hours ago', date: new Date().toISOString(),
    read: true, student: 'Bandara Perera', class: 'BCA-3A'
  },
  {
    id: 5, type: 'success', category: 'student',
    title: 'New Student Registered',
    message: 'Kasun Perera (S2024009) has been successfully registered with face recognition.',
    time: '3 hours ago', date: new Date().toISOString(),
    read: true, student: 'Kasun Perera'
  },
  {
    id: 6, type: 'error', category: 'system',
    title: 'Camera Connection Failed',
    message: 'Unable to connect to camera device. Please check the connection.',
    time: '5 hours ago', date: new Date().toISOString(),
    read: true
  },
  {
    id: 7, type: 'info', category: 'report',
    title: 'Daily Report Generated',
    message: 'Daily attendance report for June 5, 2026 has been generated.',
    time: '6 hours ago', date: new Date().toISOString(),
    read: true
  },
  {
    id: 8, type: 'warning', category: 'attendance',
    title: 'Absent Students — BCA-2B',
    message: '8 students were absent in BCA-2B today. Attendance rate: 75%',
    time: 'Yesterday', date: new Date(Date.now() - 86400000).toISOString(),
    read: true, class: 'BCA-2B'
  },
  {
    id: 9, type: 'success', category: 'system',
    title: 'System Update Available',
    message: 'FRAS v2.1.0 is available. New features: improved face recognition accuracy.',
    time: 'Yesterday', date: new Date(Date.now() - 86400000).toISOString(),
    read: true
  },
  {
    id: 10, type: 'info', category: 'student',
    title: 'Student Profile Updated',
    message: 'Amali Fernando profile and face data updated successfully.',
    time: '2 days ago', date: new Date(Date.now() - 172800000).toISOString(),
    read: true, student: 'Amali Fernando'
  },
];

// ==================== NOTIFICATIONS PAGE ====================
export default function Notifications() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(generateNotifications());
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined') setUser(JSON.parse(userData));
    } catch { navigate('/'); }
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    const matchRead = filter === 'all' || (filter === 'unread' && !n.read) || (filter === 'read' && n.read);
    const matchCategory = categoryFilter === 'all' || n.category === categoryFilter;
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());
    return matchRead && matchCategory && matchSearch;
  });

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const clearAll = () => {
    setNotifications([]);
    setSelected(null);
  };

  const typeConfig = {
    success: { icon: MdCheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100', badge: 'bg-green-100 text-green-700' },
    warning: { icon: MdWarning, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100', badge: 'bg-yellow-100 text-yellow-700' },
    error: { icon: MdError, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', badge: 'bg-red-100 text-red-700' },
    info: { icon: MdInfo, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', badge: 'bg-blue-100 text-blue-700' },
  };

  const categoryConfig = {
    attendance: { label: 'Attendance', color: 'bg-purple-100 text-purple-700' },
    student: { label: 'Student', color: 'bg-blue-100 text-blue-700' },
    system: { label: 'System', color: 'bg-gray-100 text-gray-700' },
    report: { label: 'Report', color: 'bg-orange-100 text-orange-700' },
  };

  const stats = [
    { label: 'Total', value: notifications.length, icon: FaBell, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Unread', value: unreadCount, icon: MdNotifications, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Warnings', value: notifications.filter(n => n.type === 'warning').length, icon: MdWarning, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Errors', value: notifications.filter(n => n.type === 'error').length, icon: MdError, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} onLogout={handleLogout}/>

      <div className="flex-1 ml-56">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <MdMenu className="w-5 h-5 text-gray-400"/>
            <h1 className="text-lg font-semibold text-gray-800">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
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

          {/* Main Layout */}
          <div className="flex gap-5">

            {/* Left Panel */}
            <div className="flex-1">

              {/* Toolbar */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
                <div className="flex items-center gap-3 flex-wrap">

                  {/* Search */}
                  <div className="relative flex-1 min-w-48">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input type="text" placeholder="Search notifications..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                  </div>

                  {/* Read Filter */}
                  <div className="flex gap-1">
                    {['all', 'unread', 'read'].map(f => (
                      <button key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all
                          ${filter === f ? 'bg-blue-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        {f === 'all' ? `All (${notifications.length})` : f === 'unread' ? `Unread (${unreadCount})` : 'Read'}
                      </button>
                    ))}
                  </div>

                  {/* Category Filter */}
                  <select value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 focus:outline-none bg-white">
                    <option value="all">All Categories</option>
                    <option value="attendance">Attendance</option>
                    <option value="student">Student</option>
                    <option value="system">System</option>
                    <option value="report">Report</option>
                  </select>

                  {/* Actions */}
                  <div className="flex gap-2 ml-auto">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-all">
                        <MdDoneAll className="w-4 h-4"/>
                        Mark All Read
                      </button>
                    )}
                    <button onClick={clearAll}
                      className="flex items-center gap-1.5 px-3 py-2 border border-red-100 rounded-xl text-xs text-red-400 hover:bg-red-50 transition-all">
                      <MdDeleteSweep className="w-4 h-4"/>
                      Clear All
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-2">
                {filtered.length > 0 ? (
                  filtered.map(notification => {
                    const config = typeConfig[notification.type];
                    const Icon = config.icon;
                    const catConfig = categoryConfig[notification.category];
                    const isSelected = selected?.id === notification.id;

                    return (
                      <div key={notification.id}
                        onClick={() => { setSelected(notification); markRead(notification.id); }}
                        className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all hover:shadow-md
                          ${isSelected ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100'}
                          ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                        <div className="flex items-start gap-3">

                          {/* Icon */}
                          <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0 border ${config.border}`}>
                            <Icon className={`w-5 h-5 ${config.color}`}/>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`text-sm font-semibold ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catConfig.color}`}>
                                  {catConfig.label}
                                </span>
                                <button
                                  onClick={e => { e.stopPropagation(); deleteNotification(notification.id); }}
                                  className="p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all">
                                  <MdClose className="w-4 h-4"/>
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <MdAccessTime className="w-3 h-3"/>
                                {notification.time}
                              </span>
                              {notification.student && (
                                <span className="flex items-center gap-1 text-xs text-blue-400">
                                  <MdPerson className="w-3 h-3"/>
                                  {notification.student}
                                </span>
                              )}
                              {notification.class && (
                                <span className="flex items-center gap-1 text-xs text-purple-400">
                                  <MdSchool className="w-3 h-3"/>
                                  {notification.class}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
                    <FaBellSlash className="w-14 h-14 text-gray-200 mx-auto mb-4"/>
                    <p className="text-gray-400 font-medium">No notifications found</p>
                    <p className="text-gray-300 text-sm mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel — Detail */}
            <div className="w-80 flex-shrink-0">

              {selected ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">

                  {/* Header */}
                  <div className={`p-5 border-b ${typeConfig[selected.type].bg} ${typeConfig[selected.type].border}`}>
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border ${typeConfig[selected.type].border}`}>
                        {(() => { const Icon = typeConfig[selected.type].icon; return <Icon className={`w-6 h-6 ${typeConfig[selected.type].color}`}/>; })()}
                      </div>
                      <button onClick={() => setSelected(null)}
                        className="text-gray-400 hover:text-gray-600 transition-all">
                        <MdClose className="w-5 h-5"/>
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-800 mt-3 text-sm">{selected.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConfig[selected.type].badge}`}>
                        {selected.type.charAt(0).toUpperCase() + selected.type.slice(1)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryConfig[selected.category].color}`}>
                        {categoryConfig[selected.category].label}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{selected.message}</p>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MdAccessTime className="w-4 h-4 text-gray-400"/>
                        <span>{selected.time}</span>
                      </div>
                      {selected.student && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MdPerson className="w-4 h-4 text-blue-400"/>
                          <span>Student: <span className="text-blue-600 font-medium">{selected.student}</span></span>
                        </div>
                      )}
                      {selected.class && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MdSchool className="w-4 h-4 text-purple-400"/>
                          <span>Class: <span className="text-purple-600 font-medium">{selected.class}</span></span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MdCheck className="w-4 h-4 text-gray-400"/>
                        <span>Status: <span className={selected.read ? 'text-green-600' : 'text-orange-500'}>{selected.read ? 'Read' : 'Unread'}</span></span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      {selected.student && (
                        <button
                          onClick={() => navigate('/students')}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-xl border border-blue-100 transition-all">
                          <MdPerson className="w-4 h-4"/>
                          View Student Profile
                        </button>
                      )}
                      {selected.category === 'attendance' && (
                        <button
                          onClick={() => navigate('/attendance')}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-medium rounded-xl border border-purple-100 transition-all">
                          <MdHistory className="w-4 h-4"/>
                          View Attendance
                        </button>
                      )}
                      {selected.category === 'report' && (
                        <button
                          onClick={() => navigate('/reports')}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-medium rounded-xl border border-orange-100 transition-all">
                          <MdBarChart className="w-4 h-4"/>
                          View Reports
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(selected.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-400 text-xs font-medium rounded-xl border border-red-100 transition-all">
                        <MdDelete className="w-4 h-4"/>
                        Delete Notification
                      </button>
                    </div>
                  </div>
                </div>
              ) : (

                /* Empty Detail Panel */
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center sticky top-24">
                  <FaBell className="w-12 h-12 text-gray-200 mx-auto mb-4"/>
                  <p className="text-gray-400 font-medium text-sm">Select a notification</p>
                  <p className="text-gray-300 text-xs mt-1">Click any notification to view details</p>
                </div>
              )}

              {/* Summary Card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-4">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">Category Summary</h3>
                <div className="space-y-2">
                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const count = notifications.filter(n => n.category === key).length;
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-xs font-semibold text-gray-600">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}