import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  MdDashboard, MdPeople, MdClass, MdSettings,
  MdNotifications, MdBackup, MdAssignment,
  MdVisibility, MdHistory, MdBarChart,
  MdPlayArrow, MdStop, MdDownload,
  MdCalendarToday, MdCheckCircle, MdCancel,
  MdTrendingUp, MdLogout, MdMenu
} from 'react-icons/md';
import { FaUserCheck, FaCamera } from 'react-icons/fa';
import AdminSidebar from '../components/AdminComponents/AdminSidebar';

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
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
  const [lastRecognized, setLastRecognized] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined') setUser(JSON.parse(userData));
    } catch { navigate('/'); }
    fetchTodayAttendance();
  }, [navigate]);

  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/today', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTodayAttendance(res.data || []);
      setStats({
        total: res.data?.length || 0,
        present: res.data?.filter(a => a.status === 'Present').length || 0,
        absent: res.data?.filter(a => a.status === 'Absent').length || 0,
      });
    } catch {
      setTodayAttendance([
        { name: 'Kasun Perera', student_id: 'S001', time_in: '08:30', status: 'Present' },
        { name: 'Nimal Silva', student_id: 'S002', time_in: '08:45', status: 'Present' },
        { name: 'Amali Fernando', student_id: 'S003', time_in: '09:00', status: 'Late' },
      ]);
      setStats({ total: 24, present: 18, absent: 6 });
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setIsActive(true);
      startRecognition();
    } catch {
      setError('Camera access denied! Please allow camera permission.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStream(null);
    setIsActive(false);
    setLastRecognized(null);
  }, [stream]);

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

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
        if (res.data?.length > 0) {
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
      } catch { /* ignore */ }
    }, 3000);
  };

  const handleLogout = () => {
    stopCamera();
    localStorage.clear();
    navigate('/');
  };

  const statCards = [
    { label: 'Total Students', value: stats.total, icon: MdPeople, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Present Today', value: stats.present, icon: MdCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Absent Today', value: stats.absent, icon: MdCancel, color: 'text-red-500', bg: 'bg-red-50' },
    {
      label: 'Attendance Rate',
      value: stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}%` : '0%',
      icon: MdTrendingUp, color: 'text-purple-600', bg: 'bg-purple-50'
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
            <h1 className="text-lg font-semibold text-gray-800">Live Attendance</h1>
            {isActive && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
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
            {statCards.map((s, i) => {
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

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-6">

            {/* Camera */}
            <div className="col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FaCamera className="w-4 h-4 text-gray-500"/>
                    <h2 className="font-semibold text-gray-800 text-sm">Camera Feed</h2>
                  </div>
                  {!isActive ? (
                    <button onClick={startCamera} disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-70">
                      {isLoading ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      ) : (
                        <MdPlayArrow className="w-4 h-4"/>
                      )}
                      {isLoading ? 'Starting...' : 'Start Recognition'}
                    </button>
                  ) : (
                    <button onClick={stopCamera}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all">
                      <MdStop className="w-4 h-4"/>
                      Stop
                    </button>
                  )}
                </div>

                {/* Video */}
                <div className="relative bg-gray-900" style={{ aspectRatio: '4/3' }}>
                  {isActive ? (
                    <>
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"/>

                      {/* Corner brackets */}
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-400"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-400"></div>
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-400"></div>
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-400"></div>

                      {/* Scan line */}
                      <div className="absolute left-4 right-4 h-0.5 bg-blue-400/60 animate-bounce" style={{ top: '50%' }}></div>

                      {/* LIVE badge */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        RECORDING
                      </div>

                      {/* Recognition popup */}
                      {lastRecognized && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 whitespace-nowrap">
                          <MdCheckCircle className="w-4 h-4"/>
                          {lastRecognized.name} — Attendance Marked!
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-16">
                      <FaCamera className="w-16 h-16 text-gray-600 opacity-20 mb-4"/>
                      <p className="text-gray-500 text-sm">Camera is inactive</p>
                      <p className="text-gray-400 text-xs mt-1">Click "Start Recognition" to begin</p>
                      {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-500 text-xs px-4 py-2 rounded-lg flex items-center gap-2">
                          <MdCancel className="w-4 h-4"/>
                          {error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden"/>
              </div>

              {/* Recently Recognized */}
              {recognized.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FaUserCheck className="w-4 h-4 text-green-500"/>
                    <h3 className="font-semibold text-gray-800 text-sm">Recently Recognized</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recognized.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full">
                        <MdCheckCircle className="w-3.5 h-3.5"/>
                        {r.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MdAssignment className="w-4 h-4 text-gray-500"/>
                  <h2 className="font-semibold text-gray-800 text-sm">Today's Attendance</h2>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto" style={{ maxHeight: '460px' }}>
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
                    <MdAssignment className="w-12 h-12 text-gray-300 mb-3"/>
                    <p className="text-gray-400 text-sm">No attendance yet</p>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-gray-100">
                <button className="w-full py-2 border border-gray-200 rounded-lg text-gray-500 text-xs font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                  <MdDownload className="w-4 h-4"/>
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}