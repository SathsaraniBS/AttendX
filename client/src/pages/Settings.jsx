import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdPeople, MdClass, MdSettings,
  MdNotifications, MdBackup, MdAssignment,
  MdVisibility, MdHistory, MdBarChart,
  MdLogout, MdMenu, MdCalendarToday,
  MdEdit, MdCheck, MdClose, MdSave,
  MdSecurity, MdPerson, MdEmail, MdPhone,
  MdLock, MdColorLens, MdStorage,
  MdNotificationsActive, MdLanguage,
  MdCameraAlt, MdBusiness, MdInfo,
  MdRefresh, MdDelete, MdDownload,
  MdVisibilityOff, MdWarning
} from 'react-icons/md';
import { FaShieldAlt, FaDatabase } from 'react-icons/fa';

// ==================== SETTINGS PAGE ====================
export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Settings
  const [profile, setProfile] = useState({
    name: 'Admin',
    email: 'admin@attendx.com',
    phone: '0771234567',
    role: 'System Administrator',
    organization: 'AttendX Institute',
  });

  // Password Settings
  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: ''
  });

  // System Settings
  const [system, setSystem] = useState({
    systemName: 'FRAS - AttendX',
    timezone: 'Asia/Colombo',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    attendanceStartTime: '08:00',
    attendanceEndTime: '17:00',
    lateThreshold: '15',
    autoMarkAbsent: true,
  });

  // Camera Settings
  const [camera, setCamera] = useState({
    recognitionInterval: '3',
    confidenceThreshold: '0.6',
    cameraResolution: '640x480',
    autoCapture: true,
    savePhotos: false,
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    lowAttendanceAlert: true,
    lowAttendanceThreshold: '75',
    dailyReport: true,
    weeklyReport: false,
    reportEmail: 'admin@attendx.com',
  });

  // Database Settings
  const [dbInfo] = useState({
    host: 'localhost',
    port: '5432',
    name: 'attendx_db',
    status: 'Connected',
    size: '23.4 MB',
    lastBackup: '2026-06-05 10:30 AM',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined') {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setProfile(p => ({ ...p, name: parsed.name || 'Admin', email: parsed.email || 'admin@attendx.com' }));
      }
    } catch { navigate('/'); }
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveProfile = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...userData, name: profile.name, email: profile.email }));
    setUser(u => ({ ...u, name: profile.name }));
    showToast('Profile updated successfully!');
  };

  const changePassword = () => {
    if (!passwords.current) { showToast('Enter current password!', 'error'); return; }
    if (passwords.newPass.length < 6) { showToast('Password must be at least 6 characters!', 'error'); return; }
    if (passwords.newPass !== passwords.confirm) { showToast('Passwords do not match!', 'error'); return; }
    setPasswords({ current: '', newPass: '', confirm: '' });
    showToast('Password changed successfully!');
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: MdPerson },
    { key: 'security', label: 'Security', icon: FaShieldAlt },
    { key: 'system', label: 'System', icon: MdSettings },
    { key: 'camera', label: 'Camera / AI', icon: MdCameraAlt },
    { key: 'notifications', label: 'Notifications', icon: MdNotificationsActive },
    { key: 'database', label: 'Database', icon: FaDatabase },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <Sidebar user={user} onLogout={handleLogout}/> */}

      <div className="flex-1 ml-56">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <MdMenu className="w-5 h-5 text-gray-400"/>
            <h1 className="text-lg font-semibold text-gray-800">System Settings</h1>
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
          <div className="flex gap-6">

            {/* Side Tabs */}
            <div className="w-48 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all border-b border-gray-50 last:border-0
                        ${activeTab === tab.key
                          ? 'bg-blue-50 text-blue-600 font-medium border-l-2 border-l-blue-500'
                          : 'text-gray-500 hover:bg-gray-50'}`}>
                      <Icon className="w-4 h-4 flex-shrink-0"/>
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-5">

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <MdPerson className="w-5 h-5 text-blue-500"/>
                    <h2 className="font-semibold text-gray-800">Profile Settings</h2>
                  </div>
                  <div className="p-6 space-y-5">

                    {/* Avatar */}
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                          {profile.name.charAt(0)}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-all">
                          <MdCameraAlt className="w-4 h-4"/>
                        </button>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{profile.name}</p>
                        <p className="text-sm text-gray-400">{profile.role}</p>
                        <p className="text-xs text-blue-500 mt-1">{profile.email}</p>
                      </div>
                    </div>

                    {/* Form */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block flex items-center gap-1">
                          <MdPerson className="w-4 h-4 text-gray-400"/>
                          Full Name
                        </label>
                        <input type="text" value={profile.name}
                          onChange={e => setProfile({...profile, name: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block flex items-center gap-1">
                          <MdEmail className="w-4 h-4 text-gray-400"/>
                          Email Address
                        </label>
                        <input type="email" value={profile.email}
                          onChange={e => setProfile({...profile, email: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block flex items-center gap-1">
                          <MdPhone className="w-4 h-4 text-gray-400"/>
                          Phone Number
                        </label>
                        <input type="tel" value={profile.phone}
                          onChange={e => setProfile({...profile, phone: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block flex items-center gap-1">
                          <MdBusiness className="w-4 h-4 text-gray-400"/>
                          Organization
                        </label>
                        <input type="text" value={profile.organization}
                          onChange={e => setProfile({...profile, organization: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button onClick={saveProfile}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all">
                        <MdSave className="w-4 h-4"/>
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="space-y-5">

                  {/* Change Password */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                      <MdLock className="w-5 h-5 text-blue-500"/>
                      <h2 className="font-semibold text-gray-800">Change Password</h2>
                    </div>
                    <div className="p-6 space-y-4">

                      {/* Current Password */}
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block">Current Password</label>
                        <div className="relative">
                          <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder="Enter current password"
                            value={passwords.current}
                            onChange={e => setPasswords({...passwords, current: e.target.value})}
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                          <button type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showCurrentPassword ? <MdVisibility className="w-4 h-4"/> : <MdVisibilityOff className="w-4 h-4"/>}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* New Password */}
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1.5 block">New Password</label>
                          <div className="relative">
                            <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              placeholder="New password"
                              value={passwords.newPass}
                              onChange={e => setPasswords({...passwords, newPass: e.target.value})}
                              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                            <button type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showNewPassword ? <MdVisibility className="w-4 h-4"/> : <MdVisibilityOff className="w-4 h-4"/>}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="text-gray-700 text-sm font-medium mb-1.5 block">Confirm Password</label>
                          <div className="relative">
                            <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm password"
                              value={passwords.confirm}
                              onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                            <button type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showConfirmPassword ? <MdVisibility className="w-4 h-4"/> : <MdVisibilityOff className="w-4 h-4"/>}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Password strength */}
                      {passwords.newPass && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Password Strength</p>
                          <div className="flex gap-1">
                            {[1,2,3,4].map(i => (
                              <div key={i} className={`flex-1 h-1.5 rounded-full ${
                                passwords.newPass.length >= i * 3
                                  ? passwords.newPass.length >= 10 ? 'bg-green-400'
                                    : passwords.newPass.length >= 7 ? 'bg-yellow-400'
                                    : 'bg-red-400'
                                  : 'bg-gray-100'}`}></div>
                            ))}
                          </div>
                          <p className="text-xs mt-1 text-gray-400">
                            {passwords.newPass.length >= 10 ? '✅ Strong'
                              : passwords.newPass.length >= 7 ? '⚠️ Medium'
                              : '❌ Weak'}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button onClick={changePassword}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all">
                          <MdSecurity className="w-4 h-4"/>
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                      <FaShieldAlt className="w-4 h-4 text-blue-500"/>
                      <h2 className="font-semibold text-gray-800">Session & Security</h2>
                    </div>
                    <div className="p-6 space-y-4">
                      {[
                        { label: 'Current Session', value: 'Active — Chrome, Windows', status: 'green' },
                        { label: 'Last Login', value: new Date().toLocaleString(), status: 'blue' },
                        { label: 'Account Status', value: 'Active', status: 'green' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                          <span className="text-sm text-gray-500">{item.label}</span>
                          <span className={`text-sm font-medium ${item.status === 'green' ? 'text-green-600' : 'text-blue-600'}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium rounded-xl border border-red-100 transition-all">
                        <MdLogout className="w-4 h-4"/>
                        Logout All Sessions
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SYSTEM TAB */}
              {activeTab === 'system' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <MdSettings className="w-5 h-5 text-blue-500"/>
                    <h2 className="font-semibold text-gray-800">System Configuration</h2>
                  </div>
                  <div className="p-6 space-y-5">

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block flex items-center gap-1">
                          <MdBusiness className="w-4 h-4 text-gray-400"/>
                          System Name
                        </label>
                        <input type="text" value={system.systemName}
                          onChange={e => setSystem({...system, systemName: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block flex items-center gap-1">
                          <MdLanguage className="w-4 h-4 text-gray-400"/>
                          Language
                        </label>
                        <select value={system.language}
                          onChange={e => setSystem({...system, language: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white">
                          <option>English</option>
                          <option>Sinhala</option>
                          <option>Tamil</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block">Timezone</label>
                        <select value={system.timezone}
                          onChange={e => setSystem({...system, timezone: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white">
                          <option>Asia/Colombo</option>
                          <option>Asia/Kolkata</option>
                          <option>UTC</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block">Date Format</label>
                        <select value={system.dateFormat}
                          onChange={e => setSystem({...system, dateFormat: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white">
                          <option>DD/MM/YYYY</option>
                          <option>MM/DD/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>

                    {/* Attendance Time Settings */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <MdCalendarToday className="w-4 h-4 text-blue-500"/>
                        Attendance Time Configuration
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-gray-600 text-xs font-medium mb-1 block">Start Time</label>
                          <input type="time" value={system.attendanceStartTime}
                            onChange={e => setSystem({...system, attendanceStartTime: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"/>
                        </div>
                        <div>
                          <label className="text-gray-600 text-xs font-medium mb-1 block">End Time</label>
                          <input type="time" value={system.attendanceEndTime}
                            onChange={e => setSystem({...system, attendanceEndTime: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"/>
                        </div>
                        <div>
                          <label className="text-gray-600 text-xs font-medium mb-1 block">Late Threshold (min)</label>
                          <input type="number" value={system.lateThreshold}
                            onChange={e => setSystem({...system, lateThreshold: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"/>
                        </div>
                      </div>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center justify-between py-3 border border-gray-100 rounded-xl px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Auto Mark Absent</p>
                        <p className="text-xs text-gray-400">Automatically mark absent after end time</p>
                      </div>
                      <button
                        onClick={() => setSystem(s => ({...s, autoMarkAbsent: !s.autoMarkAbsent}))}
                        className={`w-11 h-6 rounded-full transition-all duration-300 relative ${system.autoMarkAbsent ? 'bg-blue-500' : 'bg-gray-200'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${system.autoMarkAbsent ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`}
                          style={{ left: system.autoMarkAbsent ? '22px' : '2px' }}></span>
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <button onClick={() => showToast('System settings saved!')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all">
                        <MdSave className="w-4 h-4"/>
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CAMERA TAB */}
              {activeTab === 'camera' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <MdCameraAlt className="w-5 h-5 text-blue-500"/>
                    <h2 className="font-semibold text-gray-800">Camera & Face Recognition Settings</h2>
                  </div>
                  <div className="p-6 space-y-5">

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block">Recognition Interval (seconds)</label>
                        <input type="number" value={camera.recognitionInterval}
                          onChange={e => setCamera({...camera, recognitionInterval: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                          min="1" max="10"/>
                        <p className="text-xs text-gray-400 mt-1">Face scan කරන frequency</p>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block">Confidence Threshold</label>
                        <input type="number" value={camera.confidenceThreshold}
                          onChange={e => setCamera({...camera, confidenceThreshold: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                          min="0.1" max="1" step="0.1"/>
                        <p className="text-xs text-gray-400 mt-1">0.1 (low) - 1.0 (high accuracy)</p>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block">Camera Resolution</label>
                        <select value={camera.cameraResolution}
                          onChange={e => setCamera({...camera, cameraResolution: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white">
                          <option>640x480</option>
                          <option>1280x720</option>
                          <option>1920x1080</option>
                        </select>
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                      {[
                        { key: 'autoCapture', label: 'Auto Capture', desc: 'Automatically capture and recognize faces' },
                        { key: 'savePhotos', label: 'Save Captured Photos', desc: 'Save recognized face photos to database' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between py-3 border border-gray-100 rounded-xl px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{item.label}</p>
                            <p className="text-xs text-gray-400">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setCamera(c => ({...c, [item.key]: !c[item.key]}))}
                            className={`w-11 h-6 rounded-full transition-all duration-300 relative ${camera[item.key] ? 'bg-blue-500' : 'bg-gray-200'}`}>
                            <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                              style={{ left: camera[item.key] ? '22px' : '2px' }}></span>
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <button onClick={() => showToast('Camera settings saved!')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all">
                        <MdSave className="w-4 h-4"/>
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <MdNotificationsActive className="w-5 h-5 text-blue-500"/>
                    <h2 className="font-semibold text-gray-800">Notification Settings</h2>
                  </div>
                  <div className="p-6 space-y-5">

                    {/* Toggles */}
                    <div className="space-y-3">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                        { key: 'lowAttendanceAlert', label: 'Low Attendance Alert', desc: 'Alert when attendance drops below threshold' },
                        { key: 'dailyReport', label: 'Daily Report', desc: 'Receive daily attendance summary' },
                        { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive weekly attendance report' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between py-3 border border-gray-100 rounded-xl px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{item.label}</p>
                            <p className="text-xs text-gray-400">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setNotifications(n => ({...n, [item.key]: !n[item.key]}))}
                            className={`w-11 h-6 rounded-full transition-all duration-300 relative ${notifications[item.key] ? 'bg-blue-500' : 'bg-gray-200'}`}>
                            <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                              style={{ left: notifications[item.key] ? '22px' : '2px' }}></span>
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block">Low Attendance Threshold (%)</label>
                        <input type="number" value={notifications.lowAttendanceThreshold}
                          onChange={e => setNotifications({...notifications, lowAttendanceThreshold: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                          min="1" max="100"/>
                      </div>
                      <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block flex items-center gap-1">
                          <MdEmail className="w-4 h-4 text-gray-400"/>
                          Report Email
                        </label>
                        <input type="email" value={notifications.reportEmail}
                          onChange={e => setNotifications({...notifications, reportEmail: e.target.value})}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button onClick={() => showToast('Notification settings saved!')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all">
                        <MdSave className="w-4 h-4"/>
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DATABASE TAB */}
              {activeTab === 'database' && (
                <div className="space-y-5">

                  {/* DB Status */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                      <FaDatabase className="w-4 h-4 text-blue-500"/>
                      <h2 className="font-semibold text-gray-800">Database Information</h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        {[
                          { label: 'Host', value: dbInfo.host, icon: MdStorage },
                          { label: 'Port', value: dbInfo.port, icon: MdInfo },
                          { label: 'Database Name', value: dbInfo.name, icon: FaDatabase },
                          { label: 'Database Size', value: dbInfo.size, icon: MdStorage },
                          { label: 'Last Backup', value: dbInfo.lastBackup, icon: MdBackup },
                          { label: 'Status', value: dbInfo.status, icon: MdCheck },
                        ].map((item, i) => {
                          const Icon = item.icon;
                          return (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4 text-blue-500"/>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">{item.label}</p>
                                <p className={`text-sm font-medium ${item.label === 'Status' ? 'text-green-600' : 'text-gray-700'}`}>
                                  {item.value}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* DB Actions */}
                      <div className="flex gap-3">
                        <button onClick={() => showToast('Backup started!')}
                          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all">
                          <MdBackup className="w-4 h-4"/>
                          Backup Now
                        </button>
                        <button onClick={() => showToast('Database exported!')}
                          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
                          <MdDownload className="w-4 h-4"/>
                          Export Data
                        </button>
                        <button onClick={() => showToast('Connection refreshed!', 'success')}
                          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
                          <MdRefresh className="w-4 h-4"/>
                          Test Connection
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-white rounded-xl border border-red-100 shadow-sm">
                    <div className="px-6 py-4 border-b border-red-100 flex items-center gap-2">
                      <MdWarning className="w-5 h-5 text-red-500"/>
                      <h2 className="font-semibold text-red-600">Danger Zone</h2>
                    </div>
                    <div className="p-6 space-y-3">
                      {[
                        { label: 'Clear Attendance Records', desc: 'Delete all attendance data permanently', btn: 'Clear Records' },
                        { label: 'Reset All Students', desc: 'Remove all registered students and face data', btn: 'Reset Students' },
                        { label: 'Factory Reset', desc: 'Reset entire system to default settings', btn: 'Factory Reset' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{item.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => showToast(`⚠️ ${item.btn} requires confirmation!`, 'error')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-all flex-shrink-0 ml-4">
                            <MdDelete className="w-4 h-4"/>
                            {item.btn}
                          </button>
                        </div>
                      ))}
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