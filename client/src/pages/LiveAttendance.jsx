import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

// ==================== SIDEBAR ====================
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
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">👁️</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">FRAS</p>
            <p className="text-gray-400 text-xs">Face Recognition</p>
            <p className="text-gray-400 text-xs">Attendance System</p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Link to="/dashboard"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-all text-sm
            ${location.pathname === '/dashboard'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
          <span className="w-5 text-center">🏠</span>
          <span>Dashboard</span>
        </Link>
      </div>

      <div className="px-4 pt-4 pb-1">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Main</p>
      </div>
      <nav className="space-y-0.5 pb-2">
        {[
          { path: '/live', icon: '👁️', label: 'Live Attendance' },
          { path: '/attendance', icon: '🕐', label: 'Attendance History' },
          { path: '/students', icon: '👥', label: 'Students' },
          { path: '/classes', icon: '📚', label: 'Classes' },
          { path: '/reports', icon: '📊', label: 'Attendance Reports' },
        ].map(item => <NavItem key={item.path} item={item}/>)}
      </nav>

      <div className="px-4 pt-4 pb-1">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Settings</p>
      </div>
      <nav className="space-y-0.5 pb-2">
        {[
          { path: '/settings', icon: '⚙️', label: 'System Settings' },
          { path: '/notifications', icon: '🔔', label: 'Notification' },
          { path: '/backup', icon: '☁️', label: 'Backup' },
          { path: '/logs', icon: '📋', label: 'Activity Logs' },
        ].map(item => <NavItem key={item.path} item={item}/>)}
      </nav>

      <div className="mt-auto border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</p>
            <p className="text-gray-400 text-xs">System Administrator</p>
          </div>
          <button onClick={onLogout} title="Logout"
            className="text-gray-400 hover:text-red-400 transition-all text-lg">
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
}

// ==================== LIVE ATTENDANCE ====================
export default function LiveAttendance() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [recognized, setRecognized] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [stats, setStats] = useState({
    total: 0, present: 0, absent: 0
  });
  const [lastRecognized, setLastRecognized] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined') {
        setUser(JSON.parse(userData));
      }
    } catch {
      navigate('/');
    }
    fetchTodayAttendance();
  }, [navigate]);

  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/attendance/today',
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setTodayAttendance(res.data || []);
      setStats({
        total: res.data?.length || 0,
        present: res.data?.filter(a => a.status === 'Present').length || 0,
        absent: res.data?.filter(a => a.status === 'Absent').length || 0,
      });
    } catch {
      // API connect නොවුනොත් sample data
      setTodayAttendance([
        { name: 'Kasun Perera', student_id: 'S001', time_in: '08:30', status: 'Present' },
        { name: 'Nimal Silva', student_id: 'S002', time_in: '08:45', status: 'Present' },
        { name: 'Amali Fernando', student_id: 'S003', time_in: '09:00', status: 'Late' },
      ]);
      setStats({ total: 24, present: 18, absent: 6 });
    }
  };

  // Camera Start
  const startCamera = async () => {
    setIsLoading(true);
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsActive(true);
      startRecognition();
    } catch (err) {
      setError('Camera access denied! Please allow camera permission.');
    } finally {
      setIsLoading(false);
    }
  };

  // Camera Stop
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsActive(false);
    setLastRecognized(null);
  }, [stream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Face Recognition — සෑම 3 seconds කට
  const startRecognition = () => {
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);

      const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

      try {
        const res = await axios.post(
          'http://localhost:5000/api/attendance/recognize',
          { frame: base64Image },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
        );

        if (res.data && res.data.length > 0) {
          const matched = res.data.filter(r => r.status === 'marked');
          if (matched.length > 0) {
            setLastRecognized(matched[0]);
            setRecognized(prev => {
              const exists = prev.find(p => p.name === matched[0].name);
              if (!exists) return [matched[0], ...prev].slice(0, 10);
              return prev;
            });
            fetchTodayAttendance();
          }
        }
      } catch {
        // API error — ignore
      }
    }, 3000);
  };

  const handleLogout = () => {
    stopCamera();
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <Sidebar user={user} onLogout={handleLogout}/>

      {/* MAIN */}
      <div className="flex-1 ml-56">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-800">👁️ Live Attendance</h1>
            {isActive && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric',
                month: 'long', day: 'numeric'
              })}
            </span>
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
            {[
              { label: 'Total Students', value: stats.total, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Present Today', value: stats.present, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Absent Today', value: stats.absent, icon: '❌', color: 'text-red-500', bg: 'bg-red-50' },
              {
                label: 'Attendance Rate',
                value: stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}%` : '0%',
                icon: '📊', color: 'text-purple-600', bg: 'bg-purple-50'
              },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <span className="text-xl">{s.icon}</span>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-6">

            {/* Camera Section */}
            <div className="col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800">📷 Camera Feed</h2>
                  <div className="flex gap-2">
                    {!isActive ? (
                      <button onClick={startCamera} disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-70">
                        {isLoading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Starting...
                          </>
                        ) : (
                          <> ▶ Start Recognition </>
                        )}
                      </button>
                    ) : (
                      <button onClick={stopCamera}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all">
                        ⏹ Stop
                      </button>
                    )}
                  </div>
                </div>

                {/* Video Feed */}
                <div className="relative bg-gray-900" style={{ aspectRatio: '4/3' }}>
                  {isActive ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />

                      {/* Corner brackets */}
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-400"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-400"></div>
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-400"></div>
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-400"></div>

                      {/* Scanning line */}
                      <div className="absolute left-4 right-4 h-0.5 bg-blue-400/60 animate-bounce"
                        style={{ top: '50%' }}></div>

                      {/* LIVE badge */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        RECORDING
                      </div>

                      {/* Recognition Result Popup */}
                      {lastRecognized && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2">
                          ✅ {lastRecognized.name} — Attendance Marked!
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-16">
                      <span className="text-6xl mb-4 opacity-30">📷</span>
                      <p className="text-gray-500 text-sm">Camera is inactive</p>
                      <p className="text-gray-400 text-xs mt-1">Click "Start Recognition" to begin</p>
                      {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-500 text-xs px-4 py-2 rounded-lg">
                          ⚠️ {error}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Canvas (hidden) */}
                <canvas ref={canvasRef} className="hidden"/>
              </div>

              {/* Recently Recognized */}
              {recognized.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 text-sm mb-3">
                    🎯 Recently Recognized
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recognized.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full">
                        <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">
                          {r.name?.charAt(0)}
                        </span>
                        {r.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 text-sm">📋 Today's Attendance</h2>
                <span className="text-xs text-gray-400">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
                {todayAttendance.length > 0 ? (
                  todayAttendance.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-all">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                        {a.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-xs font-medium truncate">{a.name}</p>
                        <p className="text-gray-400 text-xs">{a.student_id}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-gray-400 text-xs">{a.time_in}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border
                          ${a.status === 'Present'
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : a.status === 'Late'
                            ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                            : 'bg-red-50 text-red-500 border-red-100'}`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <span className="text-4xl mb-3 opacity-30">📋</span>
                    <p className="text-gray-400 text-sm">No attendance yet</p>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <div className="px-4 py-3 border-t border-gray-100">
                <button className="w-full py-2 border border-gray-200 rounded-lg text-gray-500 text-xs font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                  📥 Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}