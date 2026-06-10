import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MdCalendarToday, MdCameraAlt, MdCheckCircle,
  MdCancel, MdRefresh, MdLocationOn, MdAccessTime,
  MdWarning, MdInfo,MdHistory
} from 'react-icons/md';
import { FaCamera } from 'react-icons/fa';
import StudentSidebar from '../../components/StudentComponents/StudentSidebar';

export default function StudentMarkAttendance() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState('idle');
  // idle | loading | success | already_marked | error
  const [todayRecord, setTodayRecord] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('student_token');
    const userData = localStorage.getItem('student_user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData) {
        const parsed = JSON.parse(userData);
        setStudent(parsed);
        checkTodayAttendance(parsed.id, token);
      }
    } catch { navigate('/'); }
  }, [navigate]);

  // ✅ Clock update every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Check if already marked today
  const checkTodayAttendance = async (studentId, token) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/attendance/student/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = res.data?.find(r => r.date === today);
      if (todayEntry) {
        setTodayRecord(todayEntry);
        setStatus('already_marked');
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    navigate('/');
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ✅ Mark Attendance
  const markAttendance = async () => {
    if (status === 'already_marked') {
      showToast('Attendance already marked for today!', 'error');
      return;
    }

    setLoading(true);
    setStatus('loading');

    try {
      const token = localStorage.getItem('student_token');
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];

      // Late if after 08:30
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isLate = hours > 8 || (hours === 8 && minutes > 30);
      const markStatus = isLate ? 'Late' : 'Present';

      const res = await axios.post(
        'http://localhost:5000/api/attendance/mark',
        {
          studentId: student.id,
          date: today,
          status: markStatus,
          time: timeStr
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );

      setTodayRecord({
        date: today,
        status: markStatus,
        time: timeStr,
        day: now.toLocaleDateString('en-US', { weekday: 'long' })
      });
      setStatus('success');
      showToast(
        isLate
          ? 'Attendance marked as Late!'
          : 'Attendance marked successfully!'
      );
    } catch (err) {
      const errMsg = err.response?.data?.error || '';
      if (errMsg.includes('already') || err.response?.status === 409) {
        setStatus('already_marked');
        showToast('Attendance already marked for today!', 'error');
      } else {
        setStatus('error');
        showToast('Failed to mark attendance. Try again!', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLateTime = currentTime.getHours() > 8 ||
    (currentTime.getHours() === 8 && currentTime.getMinutes() > 30);

  if (!student) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">

      <StudentSidebar student={student} onLogout={handleLogout}/>

      <div className="flex-1 ml-56">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <h1 className="text-lg font-semibold text-gray-800">Mark Attendance</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm border border-gray-200 rounded-lg px-3 py-1.5">
              <MdCalendarToday className="w-4 h-4"/>
              <span>{new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                {student?.name?.charAt(0)}
              </div>
              <span className="text-gray-700 text-sm">{student?.name}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-2xl mx-auto space-y-5">

            {/* Live Clock */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Current Time</p>
                  <p className="text-4xl font-bold font-mono">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit', second: '2-digit'
                    })}
                  </p>
                  <p className="text-blue-100 text-sm mt-2">
                    {currentTime.toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                    ${isLateTime ? 'bg-yellow-400/30 text-yellow-100' : 'bg-green-400/30 text-green-100'}`}>
                    <MdAccessTime className="w-4 h-4"/>
                    {isLateTime ? 'Late Hours' : 'On Time'}
                  </div>
                  <p className="text-blue-100 text-xs mt-2">
                    Cutoff: 08:30 AM
                  </p>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600">
                  {student?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{student?.name}</h3>
                  <p className="text-gray-500 text-sm">{student?.className}</p>
                  <p className="text-gray-400 text-xs font-mono mt-0.5">{student?.studentId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Status</p>
                  <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full">
                    {student?.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* ===== MARK ATTENDANCE SECTION ===== */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <FaCamera className="w-4 h-4 text-blue-500"/>
                Today's Attendance
              </h3>

              {/* Already Marked */}
              {status === 'already_marked' && todayRecord && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-green-50 rounded-2xl border border-green-100">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MdCheckCircle className="w-8 h-8 text-green-500"/>
                    </div>
                    <div>
                      <p className="font-semibold text-green-700">Attendance Already Marked!</p>
                      <p className="text-green-600 text-sm mt-0.5">
                        Your attendance has been recorded for today.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Date', value: todayRecord.date, icon: MdCalendarToday },
                      { label: 'Status', value: todayRecord.status, icon: MdCheckCircle },
                      { label: 'Check-in', value: todayRecord.time || '—', icon: MdAccessTime },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                          <Icon className={`w-5 h-5 mx-auto mb-1
                            ${item.label === 'Status' && todayRecord.status === 'Present'
                              ? 'text-green-500'
                              : item.label === 'Status' && todayRecord.status === 'Late'
                              ? 'text-yellow-500'
                              : 'text-blue-500'}`}/>
                          <p className="text-xs text-gray-400">{item.label}</p>
                          <p className={`text-sm font-semibold mt-0.5
                            ${item.label === 'Status' && todayRecord.status === 'Present'
                              ? 'text-green-600'
                              : item.label === 'Status' && todayRecord.status === 'Late'
                              ? 'text-yellow-600'
                              : 'text-gray-700'}`}>
                            {item.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => navigate('/student-attendance')}
                    className="w-full py-3 border border-blue-200 text-blue-500 text-sm font-medium rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                    <MdHistory className="w-4 h-4"/>
                    View Full Attendance History
                  </button>
                </div>
              )}

              {/* Success */}
              {status === 'success' && todayRecord && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-green-50 rounded-2xl border border-green-100">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MdCheckCircle className="w-8 h-8 text-green-500"/>
                    </div>
                    <div>
                      <p className="font-semibold text-green-700">
                        {todayRecord.status === 'Late'
                          ? 'Marked as Late!'
                          : 'Attendance Marked Successfully!'}
                      </p>
                      <p className="text-green-600 text-sm mt-0.5">
                        Check-in time: {todayRecord.time}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Date', value: todayRecord.date, icon: MdCalendarToday },
                      { label: 'Status', value: todayRecord.status, icon: MdCheckCircle },
                      { label: 'Check-in', value: todayRecord.time || '—', icon: MdAccessTime },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                          <Icon className={`w-5 h-5 mx-auto mb-1
                            ${item.label === 'Status' && todayRecord.status === 'Present'
                              ? 'text-green-500'
                              : item.label === 'Status' && todayRecord.status === 'Late'
                              ? 'text-yellow-500'
                              : 'text-blue-500'}`}/>
                          <p className="text-xs text-gray-400">{item.label}</p>
                          <p className={`text-sm font-semibold mt-0.5
                            ${item.label === 'Status' && todayRecord.status === 'Present'
                              ? 'text-green-600'
                              : item.label === 'Status' && todayRecord.status === 'Late'
                              ? 'text-yellow-600'
                              : 'text-gray-700'}`}>
                            {item.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Idle — Ready to mark */}
              {(status === 'idle' || status === 'error') && (
                <div className="space-y-4">

                  {/* Info */}
                  <div className={`flex items-start gap-3 p-4 rounded-xl border
                    ${isLateTime
                      ? 'bg-yellow-50 border-yellow-100'
                      : 'bg-blue-50 border-blue-100'}`}>
                    {isLateTime
                      ? <MdWarning className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"/>
                      : <MdInfo className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"/>}
                    <div>
                      <p className={`text-sm font-medium ${isLateTime ? 'text-yellow-700' : 'text-blue-700'}`}>
                        {isLateTime ? 'You are marking late attendance' : 'Ready to mark attendance'}
                      </p>
                      <p className={`text-xs mt-0.5 ${isLateTime ? 'text-yellow-600' : 'text-blue-600'}`}>
                        {isLateTime
                          ? 'Attendance will be marked as "Late" since it\'s past 08:30 AM'
                          : 'Attendance will be marked as "Present"'}
                      </p>
                    </div>
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                      <MdCancel className="w-5 h-5 text-red-500 flex-shrink-0"/>
                      <p className="text-sm text-red-600">Failed to mark attendance. Please try again.</p>
                    </div>
                  )}

                  {/* Mark Button */}
                  <button
                    onClick={markAttendance}
                    disabled={loading}
                    className={`w-full py-4 text-white font-semibold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 text-base
                      ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isLateTime
                        ? 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200'
                        : 'bg-blue-500 hover:bg-blue-600 shadow-blue-200'}`}>
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                        Marking Attendance...
                      </>
                    ) : (
                      <>
                        <MdCameraAlt className="w-6 h-6"/>
                        {isLateTime ? 'Mark Late Attendance' : 'Mark Attendance'}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    Click the button to record your attendance for today
                  </p>
                </div>
              )}

              {/* Loading check */}
              {status === 'loading' && (
                <div className="flex flex-col items-center py-10 gap-4">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"/>
                  <p className="text-gray-500 text-sm">Marking your attendance...</p>
                </div>
              )}
            </div>

            {/* Rules Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <MdInfo className="w-4 h-4 text-blue-500"/>
                Attendance Rules
              </h3>
              <div className="space-y-2">
                {[
                  { icon: MdCheckCircle, color: 'text-green-500', text: 'Present — Mark before 08:30 AM' },
                  { icon: MdAccessTime,  color: 'text-yellow-500', text: 'Late — Mark after 08:30 AM' },
                  { icon: MdCancel,      color: 'text-red-500',   text: 'Absent — Not marked by end of day' },
                  { icon: MdInfo,        color: 'text-blue-500',  text: 'Only one attendance per day allowed' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Icon className={`w-4 h-4 ${item.color} flex-shrink-0`}/>
                      {item.text}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'}`}>
          {toast.type === 'error'
            ? <MdCancel className="w-4 h-4"/>
            : <MdCheckCircle className="w-4 h-4 text-green-400"/>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}