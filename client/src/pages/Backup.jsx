import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdPeople, MdClass, MdSettings,
  MdNotifications, MdBackup, MdAssignment,
  MdVisibility, MdHistory, MdBarChart,
  MdLogout, MdMenu, MdCalendarToday,
  MdCheck, MdClose, MdDelete,
  MdDownload, MdUpload, MdRefresh,
  MdStorage, MdInfo, MdWarning,
  MdSchedule, MdCheckCircle, MdError,
  MdFolder, MdCloud, MdComputer
} from 'react-icons/md';
import { FaDatabase, FaCloudUploadAlt, FaCloudDownloadAlt, FaHdd } from 'react-icons/fa';
import AdminSidebar from '../components/AdminComponents/AdminSidebar';
// ==================== SAMPLE DATA ====================
const sampleBackups = [
  {
    id: 1,
    name: 'backup_2026_06_05_103000',
    date: '2026-06-05 10:30 AM',
    size: '23.4 MB',
    type: 'Auto',
    status: 'Success',
    tables: ['students', 'attendance', 'users', 'classes'],
  },
  {
    id: 2,
    name: 'backup_2026_06_04_103000',
    date: '2026-06-04 10:30 AM',
    size: '22.8 MB',
    type: 'Auto',
    status: 'Success',
    tables: ['students', 'attendance', 'users', 'classes'],
  },
  {
    id: 3,
    name: 'backup_2026_06_03_140000',
    date: '2026-06-03 2:00 PM',
    size: '21.5 MB',
    type: 'Manual',
    status: 'Success',
    tables: ['students', 'attendance', 'users', 'classes'],
  },
  {
    id: 4,
    name: 'backup_2026_06_02_103000',
    date: '2026-06-02 10:30 AM',
    size: '20.9 MB',
    type: 'Auto',
    status: 'Failed',
    tables: [],
  },
  {
    id: 5,
    name: 'backup_2026_06_01_103000',
    date: '2026-06-01 10:30 AM',
    size: '19.7 MB',
    type: 'Auto',
    status: 'Success',
    tables: ['students', 'attendance', 'users', 'classes'],
  },
];

// ==================== BACKUP PAGE ====================
export default function Backup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [backups, setBackups] = useState(sampleBackups);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [toast, setToast] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [restoreId, setRestoreId] = useState(null);
  const [activeTab, setActiveTab] = useState('backups');
  const [scheduleSettings, setScheduleSettings] = useState({
    enabled: true,
    frequency: 'daily',
    time: '10:30',
    retention: '30',
    destination: 'local',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
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

  const startBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          const newBackup = {
            id: Date.now(),
            name: `backup_${new Date().toISOString().replace(/[-:T]/g, '_').split('.')[0]}`,
            date: new Date().toLocaleString('en-US', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit'
            }),
            size: `${(Math.random() * 5 + 20).toFixed(1)} MB`,
            type: 'Manual',
            status: 'Success',
            tables: ['students', 'attendance', 'users', 'classes'],
          };
          setBackups(prev => [newBackup, ...prev]);
          showToast('Backup completed successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleRestore = (id) => {
    setIsRestoring(true);
    setRestoreId(null);
    setTimeout(() => {
      setIsRestoring(false);
      showToast('Database restored successfully!');
    }, 3000);
  };

  const handleDelete = (id) => {
    setBackups(prev => prev.filter(b => b.id !== id));
    setDeleteId(null);
    showToast('Backup deleted!');
  };

  const handleDownload = (backup) => {
    showToast(`Downloading ${backup.name}...`);
  };

  const stats = [
    {
      label: 'Total Backups',
      value: backups.length,
      icon: FaDatabase,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Successful',
      value: backups.filter(b => b.status === 'Success').length,
      icon: MdCheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Failed',
      value: backups.filter(b => b.status === 'Failed').length,
      icon: MdError,
      color: 'text-red-500',
      bg: 'bg-red-50'
    },
    {
      label: 'Storage Used',
      value: '23.4 MB',
      icon: FaHdd,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} onLogout={handleLogout}/>

      <div className="flex-1 ml-56">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <MdMenu className="w-5 h-5 text-gray-400"/>
            <h1 className="text-lg font-semibold text-gray-800">Backup & Restore</h1>
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

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-5 mb-6">

            {/* Manual Backup */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FaCloudUploadAlt className="w-5 h-5 text-blue-500"/>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Manual Backup</h3>
                  <p className="text-xs text-gray-400">Create backup now</p>
                </div>
              </div>

              {isBackingUp ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Backing up...</span>
                    <span>{backupProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${backupProgress}%` }}></div>
                  </div>
                  <div className="space-y-1">
                    {['students', 'attendance', 'classes', 'users'].map((table, i) => (
                      <div key={table} className={`flex items-center gap-2 text-xs ${backupProgress > i * 25 ? 'text-green-500' : 'text-gray-300'}`}>
                        <MdCheck className="w-3 h-3"/>
                        Backing up {table}...
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <button onClick={startBackup}
                  className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                  <MdBackup className="w-4 h-4"/>
                  Start Backup
                </button>
              )}
            </div>

            {/* Restore */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <FaCloudDownloadAlt className="w-5 h-5 text-green-500"/>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Restore Database</h3>
                  <p className="text-xs text-gray-400">Restore from backup file</p>
                </div>
              </div>

              {isRestoring ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-blue-500">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Restoring database...
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-green-400 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="w-full py-2.5 border-2 border-dashed border-gray-200 text-gray-400 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-2 hover:border-blue-300 hover:text-blue-400 cursor-pointer">
                    <MdUpload className="w-4 h-4"/>
                    Upload Backup File
                    <input type="file" accept=".sql,.backup,.dump" className="hidden"
                      onChange={() => showToast('Restore from file — coming soon!')}/>
                  </label>
                  <p className="text-xs text-gray-300 text-center">or restore from list below</p>
                </div>
              )}
            </div>

            {/* Storage Info */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <FaHdd className="w-5 h-5 text-purple-500"/>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Storage Info</h3>
                  <p className="text-xs text-gray-400">Backup storage usage</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Used Space</span>
                    <span className="font-medium">23.4 MB / 100 GB</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-purple-400 rounded-full" style={{ width: '0.23%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Database', value: '18.2 MB', icon: FaDatabase },
                    { label: 'Face Data', value: '5.2 MB', icon: MdFolder },
                    { label: 'Backups', value: '23.4 MB', icon: MdCloud },
                    { label: 'Available', value: '99.9 GB', icon: MdStorage },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-1.5 text-gray-500">
                        <Icon className="w-3.5 h-3.5 text-gray-400"/>
                        <span>{item.label}:</span>
                        <span className="font-medium text-gray-700">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
            {[
              { key: 'backups', label: 'Backup History', icon: MdBackup },
              { key: 'schedule', label: 'Auto Schedule', icon: MdSchedule },
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

          {/* BACKUP HISTORY TAB */}
          {activeTab === 'backups' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-sm">Backup History</h3>
                <button onClick={() => showToast('Refreshed!')}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all">
                  <MdRefresh className="w-4 h-4"/>
                  Refresh
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Backup Name', 'Date & Time', 'Size', 'Type', 'Tables', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup, i) => (
                    <tr key={backup.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">

                      {/* Name */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaDatabase className="w-3.5 h-3.5 text-blue-500"/>
                          </div>
                          <span className="text-xs font-mono text-gray-600 truncate max-w-36">
                            {backup.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MdCalendarToday className="w-3.5 h-3.5"/>
                          {backup.date}
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <span className="text-xs font-medium text-gray-600">{backup.size}</span>
                      </td>

                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium
                          ${backup.type === 'Auto'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                          {backup.type}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {backup.tables.length > 0 ? (
                            backup.tables.map(t => (
                              <span key={t} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-red-400">—</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium
                          ${backup.status === 'Success'
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'bg-red-50 text-red-500 border-red-100'}`}>
                          {backup.status === 'Success'
                            ? <MdCheckCircle className="w-3 h-3"/>
                            : <MdError className="w-3 h-3"/>}
                          {backup.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          {backup.status === 'Success' && (
                            <>
                              <button
                                onClick={() => handleDownload(backup)}
                                title="Download"
                                className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg transition-all">
                                <MdDownload className="w-4 h-4"/>
                              </button>
                              <button
                                onClick={() => setRestoreId(backup.id)}
                                title="Restore"
                                className="p-1.5 text-green-400 hover:bg-green-50 rounded-lg transition-all">
                                <MdRefresh className="w-4 h-4"/>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDeleteId(backup.id)}
                            title="Delete"
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                            <MdDelete className="w-4 h-4"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {backups.length === 0 && (
                <div className="text-center py-16">
                  <FaDatabase className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                  <p className="text-gray-400 font-medium">No backups found</p>
                  <p className="text-gray-300 text-sm mt-1">Create your first backup</p>
                </div>
              )}
            </div>
          )}

          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <div className="space-y-5">

              {/* Auto Backup Settings */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MdSchedule className="w-5 h-5 text-blue-500"/>
                    <h3 className="font-semibold text-gray-800">Auto Backup Schedule</h3>
                  </div>
                  {/* Toggle */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {scheduleSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => setScheduleSettings(s => ({...s, enabled: !s.enabled}))}
                      className={`w-11 h-6 rounded-full transition-all duration-300 relative ${scheduleSettings.enabled ? 'bg-blue-500' : 'bg-gray-200'}`}>
                      <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                        style={{ left: scheduleSettings.enabled ? '22px' : '2px' }}></span>
                    </button>
                  </div>
                </div>

                <div className={`p-6 space-y-5 ${!scheduleSettings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <label className="text-gray-700 text-sm font-medium mb-1.5 block">Backup Frequency</label>
                      <select value={scheduleSettings.frequency}
                        onChange={e => setScheduleSettings({...scheduleSettings, frequency: e.target.value})}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white">
                        <option value="hourly">Every Hour</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-700 text-sm font-medium mb-1.5 block">Backup Time</label>
                      <input type="time" value={scheduleSettings.time}
                        onChange={e => setScheduleSettings({...scheduleSettings, time: e.target.value})}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"/>
                    </div>

                    <div>
                      <label className="text-gray-700 text-sm font-medium mb-1.5 block">Retention Period (days)</label>
                      <input type="number" value={scheduleSettings.retention}
                        onChange={e => setScheduleSettings({...scheduleSettings, retention: e.target.value})}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                        min="1" max="365"/>
                      <p className="text-xs text-gray-400 mt-1">Backups older than this will be deleted</p>
                    </div>

                    <div>
                      <label className="text-gray-700 text-sm font-medium mb-1.5 block">Backup Destination</label>
                      <div className="space-y-2">
                        {[
                          { key: 'local', label: 'Local Storage', icon: MdComputer },
                          { key: 'cloud', label: 'Cloud Storage', icon: MdCloud },
                        ].map(dest => {
                          const Icon = dest.icon;
                          return (
                            <label key={dest.key}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                ${scheduleSettings.destination === dest.key
                                  ? 'border-blue-300 bg-blue-50'
                                  : 'border-gray-200 hover:bg-gray-50'}`}>
                              <input type="radio"
                                checked={scheduleSettings.destination === dest.key}
                                onChange={() => setScheduleSettings({...scheduleSettings, destination: dest.key})}
                                className="text-blue-500"/>
                              <Icon className={`w-4 h-4 ${scheduleSettings.destination === dest.key ? 'text-blue-500' : 'text-gray-400'}`}/>
                              <span className={`text-sm font-medium ${scheduleSettings.destination === dest.key ? 'text-blue-700' : 'text-gray-600'}`}>
                                {dest.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Preview */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <MdInfo className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"/>
                      <div>
                        <p className="text-sm font-semibold text-blue-800">Schedule Preview</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Next backup: <span className="font-medium">
                            {scheduleSettings.frequency === 'daily' ? `Today at ${scheduleSettings.time}`
                              : scheduleSettings.frequency === 'weekly' ? `Next week at ${scheduleSettings.time}`
                              : scheduleSettings.frequency === 'hourly' ? 'Every hour'
                              : `Next month at ${scheduleSettings.time}`}
                          </span>
                        </p>
                        <p className="text-xs text-blue-500 mt-0.5">
                          Backups older than {scheduleSettings.retention} days will be automatically deleted
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button onClick={() => showToast('Schedule settings saved!')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all">
                      <MdCheck className="w-4 h-4"/>
                      Save Schedule
                    </button>
                  </div>
                </div>
              </div>

              {/* Next Scheduled Backups */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">Upcoming Scheduled Backups</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Today', time: scheduleSettings.time, status: 'Scheduled' },
                    { label: 'Tomorrow', time: scheduleSettings.time, status: 'Scheduled' },
                    { label: 'Day After', time: scheduleSettings.time, status: 'Scheduled' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <MdSchedule className="w-4 h-4 text-blue-500"/>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{item.label}</p>
                          <p className="text-xs text-gray-400">at {item.time}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-medium">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdDelete className="w-7 h-7 text-red-500"/>
            </div>
            <h3 className="text-gray-800 font-semibold text-lg mb-2">Delete Backup?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This backup file will be permanently deleted and cannot be recovered.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-500 text-sm hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-xl transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {restoreId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdWarning className="w-7 h-7 text-yellow-500"/>
            </div>
            <h3 className="text-gray-800 font-semibold text-lg mb-2">Restore Database?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will replace your current database with this backup. All current data will be overwritten.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRestoreId(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-500 text-sm hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={() => handleRestore(restoreId)}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-xl transition-all">
                Restore
              </button>
            </div>
          </div>
        </div>
      )}

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