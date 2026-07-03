import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdMenu, MdCalendarToday,
  MdSearch, MdDownload,
  MdRefresh, MdDeleteSweep,
  MdPerson, MdComputer, MdPeople, MdClass, MdBarChart,
  MdCheckCircle, MdError, MdWarning,
  MdInfo, MdChevronLeft, MdChevronRight,
  MdClose, MdCheck, MdAccessTime,
  MdLocationOn, MdDevices, MdAssignment, MdHistory
} from 'react-icons/md';
import { FaUserShield, FaDatabase, FaCamera } from 'react-icons/fa';
import AdminSidebar from '../components/AdminComponents/AdminSidebar';

// ==================== SAMPLE LOG DATA ====================
const generateLogs = () => {
  const actions = [
    { action: 'User Login',          type: 'auth',       level: 'info',    user: 'Admin',   detail: 'Successful login from Chrome/Windows',              ip: '192.168.1.1' },
    { action: 'Student Added',       type: 'student',    level: 'success', user: 'Admin',   detail: 'New student Kasun Perera (S2024009) registered',    ip: '192.168.1.1' },
    { action: 'Attendance Marked',   type: 'attendance', level: 'success', user: 'System',  detail: '24 students marked present in BCA-2A',              ip: '192.168.1.1' },
    { action: 'Backup Created',      type: 'system',     level: 'success', user: 'System',  detail: 'Automatic backup completed — 23.4 MB',              ip: '192.168.1.1' },
    { action: 'Face Recognition',    type: 'camera',     level: 'success', user: 'System',  detail: 'Nimal Silva recognized — attendance marked',         ip: '192.168.1.1' },
    { action: 'Login Failed',        type: 'auth',       level: 'error',   user: 'Unknown', detail: 'Failed login attempt — invalid credentials',         ip: '192.168.1.50' },
    { action: 'Student Deleted',     type: 'student',    level: 'warning', user: 'Admin',   detail: 'Student Eranga Bandara (S2024008) removed',         ip: '192.168.1.1' },
    { action: 'Settings Updated',    type: 'system',     level: 'info',    user: 'Admin',   detail: 'System timezone changed to Asia/Colombo',           ip: '192.168.1.1' },
    { action: 'Password Changed',    type: 'auth',       level: 'info',    user: 'Admin',   detail: 'Admin password updated successfully',               ip: '192.168.1.1' },
    { action: 'Report Exported',     type: 'report',     level: 'info',    user: 'Admin',   detail: 'Attendance report exported as CSV',                 ip: '192.168.1.1' },
    { action: 'Class Created',       type: 'class',      level: 'success', user: 'Admin',   detail: 'New class MCA-2A added with capacity 30',           ip: '192.168.1.1' },
    { action: 'Camera Error',        type: 'camera',     level: 'error',   user: 'System',  detail: 'Camera connection lost — reconnecting...',          ip: '192.168.1.1' },
    { action: 'User Logout',         type: 'auth',       level: 'info',    user: 'Admin',   detail: 'Session ended successfully',                        ip: '192.168.1.1' },
    { action: 'Restore Completed',   type: 'system',     level: 'success', user: 'Admin',   detail: 'Database restored from backup_2026_06_04',          ip: '192.168.1.1' },
    { action: 'Face Not Recognized', type: 'camera',     level: 'warning', user: 'System',  detail: 'Unknown face detected — attendance not marked',     ip: '192.168.1.1' },
  ];

  return actions.map((a, i) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - i * 17);
    return {
      id: i + 1,
      ...a,
      timestamp: date.toLocaleString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }),
      date:    date.toISOString(),
      browser: 'Chrome 120',
      os:      'Windows 11',
    };
  });
};

// ==================== LOGS PAGE ====================
export default function Logs() {
  const navigate = useNavigate();
  const [user,         setUser]         = useState(null);
  const [logs,         setLogs]         = useState(generateLogs());
  const [search,       setSearch]       = useState('');
  const [filterLevel,  setFilterLevel]  = useState('all');
  const [filterType,   setFilterType]   = useState('all');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [selectedLog,  setSelectedLog]  = useState(null);
  const [toast,        setToast]        = useState(null);
  const perPage = 10;

  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined') setUser(JSON.parse(userData));
    } catch { navigate('/'); }
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = logs.filter(log => {
    const matchSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.detail.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchType  = filterType  === 'all' || log.type  === filterType;
    return matchSearch && matchLevel && matchType;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated  = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const clearLogs = () => {
    setLogs([]);
    setSelectedLog(null);
    showToast('All logs cleared!');
  };

  const exportLogs = () => {
    const headers = ['ID', 'Timestamp', 'Action', 'Type', 'Level', 'User', 'Detail', 'IP'];
    const rows    = filtered.map(l =>
      [l.id, l.timestamp, l.action, l.type, l.level, l.user, l.detail, l.ip].join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Logs exported!');
  };

  // ── Config ────────────────────────────────────────────────────────────────
  const levelConfig = {
    success: { icon: MdCheckCircle, color: 'text-green-500',  bg: 'bg-green-50',  border: 'border-green-100',  badge: 'bg-green-100 text-green-700' },
    error:   { icon: MdError,       color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-100',    badge: 'bg-red-100 text-red-700' },
    warning: { icon: MdWarning,     color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100', badge: 'bg-yellow-100 text-yellow-700' },
    info:    { icon: MdInfo,        color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-100',   badge: 'bg-blue-100 text-blue-700' },
  };

  const typeConfig = {
    auth:       { icon: FaUserShield, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Auth' },
    student:    { icon: MdPeople,     color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'Student' },
    attendance: { icon: MdHistory,    color: 'text-green-500',  bg: 'bg-green-50',  label: 'Attendance' },
    system:     { icon: MdComputer,   color: 'text-gray-500',   bg: 'bg-gray-50',   label: 'System' },
    camera:     { icon: FaCamera,     color: 'text-orange-500', bg: 'bg-orange-50', label: 'Camera' },
    report:     { icon: MdBarChart,   color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Report' },
    class:      { icon: MdClass,      color: 'text-teal-500',   bg: 'bg-teal-50',   label: 'Class' },
  };

  const stats = [
    { label: 'Total Logs', value: logs.length,                                    icon: MdAssignment,  color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Success',    value: logs.filter(l => l.level === 'success').length, icon: MdCheckCircle, color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Warnings',   value: logs.filter(l => l.level === 'warning').length, icon: MdWarning,     color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Errors',     value: logs.filter(l => l.level === 'error').length,   icon: MdError,       color: 'text-red-500',    bg: 'bg-red-50' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} onLogout={handleLogout}/>

      <div className="flex-1 ml-56">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <MdMenu className="w-5 h-5 text-gray-400"/>
            <h1 className="text-lg font-semibold text-gray-800">Activity Logs</h1>
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

          <div className="flex gap-5">

            {/* ── Left — Log List ── */}
            <div className="flex-1">

              {/* Toolbar */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
                <div className="flex items-center gap-3 flex-wrap">

                  {/* Search */}
                  <div className="relative flex-1 min-w-48">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input type="text" placeholder="Search logs..."
                      value={search}
                      onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                  </div>

                  {/* Level Filter */}
                  <div className="flex gap-1">
                    {['all', 'success', 'warning', 'error', 'info'].map(l => (
                      <button key={l}
                        onClick={() => { setFilterLevel(l); setCurrentPage(1); }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                          ${filterLevel === l
                            ? l === 'success' ? 'bg-green-500 text-white'
                              : l === 'warning' ? 'bg-yellow-400 text-white'
                              : l === 'error'   ? 'bg-red-500 text-white'
                              : l === 'info'    ? 'bg-blue-500 text-white'
                              : 'bg-blue-500 text-white'
                            : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        {l}
                      </button>
                    ))}
                  </div>

                  {/* Type Filter */}
                  <select value={filterType}
                    onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-500 focus:outline-none bg-white">
                    <option value="all">All Types</option>
                    <option value="auth">Auth</option>
                    <option value="student">Student</option>
                    <option value="attendance">Attendance</option>
                    <option value="system">System</option>
                    <option value="camera">Camera</option>
                    <option value="report">Report</option>
                    <option value="class">Class</option>
                  </select>

                  {/* Actions */}
                  <div className="flex gap-2 ml-auto">
                    <button onClick={() => { setLogs(generateLogs()); showToast('Refreshed!'); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-all">
                      <MdRefresh className="w-4 h-4"/> Refresh
                    </button>
                    <button onClick={exportLogs}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-all">
                      <MdDownload className="w-4 h-4"/> Export
                    </button>
                    <button onClick={clearLogs}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 rounded-xl text-xs text-red-400 hover:bg-red-50 transition-all">
                      <MdDeleteSweep className="w-4 h-4"/> Clear All
                    </button>
                  </div>
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['#', 'Timestamp', 'Action', 'Type', 'User', 'Level', 'IP Address'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((log, i) => {
                      const lConfig    = levelConfig[log.level];
                      const tConfig    = typeConfig[log.type] || typeConfig.system;
                      const LIcon      = lConfig.icon;
                      const TIcon      = tConfig.icon;
                      const isSelected = selectedLog?.id === log.id;
                      return (
                        <tr key={log.id}
                          onClick={() => setSelectedLog(isSelected ? null : log)}
                          className={`border-b border-gray-50 hover:bg-gray-50 transition-all cursor-pointer
                            ${isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {(currentPage - 1) * perPage + i + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                              <MdAccessTime className="w-3.5 h-3.5"/>
                              {log.timestamp}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-800 whitespace-nowrap">{log.action}</p>
                            <p className="text-xs text-gray-400 truncate max-w-48 mt-0.5">{log.detail}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${tConfig.bg} ${tConfig.color} font-medium`}>
                              <TIcon className="w-3 h-3"/>
                              {tConfig.label}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-bold text-xs">{log.user.charAt(0)}</span>
                              </div>
                              <span className="text-xs text-gray-600">{log.user}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${lConfig.badge}`}>
                              <LIcon className="w-3 h-3"/>
                              {log.level.charAt(0).toUpperCase() + log.level.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {log.ip}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Empty */}
                {filtered.length === 0 && (
                  <div className="text-center py-16">
                    <MdAssignment className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                    <p className="text-gray-400 font-medium">No logs found</p>
                    <p className="text-gray-300 text-sm mt-1">Try adjusting your filters</p>
                  </div>
                )}

                {/* Pagination */}
                {filtered.length > 0 && (
                  <div className="px-5 py-3.5 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                      Showing {Math.min((currentPage - 1) * perPage + 1, filtered.length)}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} logs
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-all">
                        <MdChevronLeft className="w-4 h-4"/>
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                        <button key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all
                            ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                          {i + 1}
                        </button>
                      ))}
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
            </div>

            {/* ── Right — Detail Panel ── */}
            <div className="w-72 flex-shrink-0">

              {selectedLog ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                  <div className={`p-5 border-b ${levelConfig[selectedLog.level].bg} ${levelConfig[selectedLog.level].border}`}>
                    <div className="flex justify-between items-start">
                      <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border ${levelConfig[selectedLog.level].border}`}>
                        {(() => {
                          const Icon = levelConfig[selectedLog.level].icon;
                          return <Icon className={`w-5 h-5 ${levelConfig[selectedLog.level].color}`}/>;
                        })()}
                      </div>
                      <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                        <MdClose className="w-4 h-4"/>
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm mt-3">{selectedLog.action}</h3>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelConfig[selectedLog.level].badge}`}>
                        {selectedLog.level.charAt(0).toUpperCase() + selectedLog.level.slice(1)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConfig[selectedLog.type]?.bg} ${typeConfig[selectedLog.type]?.color}`}>
                        {typeConfig[selectedLog.type]?.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Description</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedLog.detail}</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { icon: MdAccessTime, label: 'Timestamp',  value: selectedLog.timestamp },
                        { icon: MdPerson,     label: 'User',       value: selectedLog.user },
                        { icon: MdLocationOn, label: 'IP Address', value: selectedLog.ip },
                        { icon: MdDevices,    label: 'Browser',    value: selectedLog.browser },
                        { icon: MdComputer,   label: 'OS',         value: selectedLog.os },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                            <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="w-3.5 h-3.5 text-gray-400"/>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-400">{item.label}</p>
                              <p className="text-xs font-medium text-gray-700 truncate">{item.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Log ID</p>
                      <p className="text-xs font-mono text-gray-600">
                        LOG-{String(selectedLog.id).padStart(6, '0')}
                      </p>
                    </div>
                  </div>
                </div>

              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                    <MdAssignment className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                    <p className="text-gray-400 font-medium text-sm">Select a log</p>
                    <p className="text-gray-300 text-xs mt-1">Click any row to view details</p>
                  </div>

                  {/* Type Summary */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <h3 className="font-semibold text-gray-700 text-sm mb-3">Log Types</h3>
                    <div className="space-y-2">
                      {Object.entries(typeConfig).map(([key, config]) => {
                        const Icon  = config.icon;
                        const count = logs.filter(l => l.type === key).length;
                        return (
                          <div key={key}
                            onClick={() => { setFilterType(key); setCurrentPage(1); }}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 transition-all">
                            <div className={`w-6 h-6 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-3.5 h-3.5 ${config.color}`}/>
                            </div>
                            <span className="text-xs text-gray-500 flex-1 capitalize">{config.label}</span>
                            <span className="text-xs font-semibold text-gray-600">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Level Summary */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <h3 className="font-semibold text-gray-700 text-sm mb-3">Log Levels</h3>
                    <div className="space-y-2">
                      {Object.entries(levelConfig).map(([key, config]) => {
                        const Icon  = config.icon;
                        const count = logs.filter(l => l.level === key).length;
                        return (
                          <div key={key}
                            onClick={() => { setFilterLevel(key); setCurrentPage(1); }}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 transition-all">
                            <Icon className={`w-4 h-4 ${config.color} flex-shrink-0`}/>
                            <span className="text-xs text-gray-500 flex-1 capitalize">{key}</span>
                            <span className={`text-xs font-bold ${config.color}`}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'}`}>
          {toast.type === 'error'
            ? <MdClose className="w-4 h-4"/>
            : <MdCheck className="w-4 h-4 text-green-400"/>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}