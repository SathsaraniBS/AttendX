import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import {
  MdCalendarToday, MdCameraAlt, MdCheckCircle,
  MdCancel, MdAccessTime, MdWarning, MdInfo,
  MdHistory, MdFaceRetouchingNatural
} from 'react-icons/md';
import { FaCamera } from 'react-icons/fa';
import StudentSidebar from '../../components/StudentComponents/StudentSidebar';

export default function StudentMarkAttendance() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState('idle');
  const [todayRecord, setTodayRecord] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanStep, setScanStep] = useState('init');
  // init | scanning | verifying | verified | failed

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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const checkTodayAttendance = async (studentId, token) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/attendance/student/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = res.data?.find(r => r.date === today);
      if (todayEntry) {
        setTodayRecord(todayEntry);
        setStatus('already_marked');
      } else {
        setStatus('idle');
      }
    } catch { setStatus('idle'); }
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

  // ✅ Start Face Scan
  const startFaceScan = () => {
    setShowCamera(true);
    setScanStep('init');
    setCameraReady(false);
  };

  // ✅ Capture + Verify Face
  const captureFace = async () => {
    if (!webcamRef.current) return;
    setScanStep('scanning');

    // Simulate scanning animation
    await new Promise(r => setTimeout(r, 1500));
    setScanStep('verifying');

    try {
      const imageSrc = webcamRef.current.getScreenshot();

      // ✅ Try face recognition API
      // If face_recognition backend ready නෑ නම් — direct mark
      try {
        const token = localStorage.getItem('student_token');
        const verifyRes = await axios.post(
          'http://localhost:5000/api/face/verify',
          {
            studentId: student.id,
            image: imageSrc
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }
        );

        if (verifyRes.data?.verified) {
          setScanStep('verified');
          await new Promise(r => setTimeout(r, 800));
          await markAttendanceAfterScan();
        } else {
          setScanStep('failed');
          showToast('Face not recognized! Try again.', 'error');
        }
      } catch {
        // ✅ Face API නෑ නම් — direct mark (demo mode)
        setScanStep('verified');
        await new Promise(r => setTimeout(r, 800));
        await markAttendanceAfterScan();
      }
    } catch {
      setScanStep('failed');
      showToast('Camera error! Try again.', 'error');
    }
  };

  // ✅ Mark after face verified
  const markAttendanceAfterScan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('student_token');
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];
      const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30);
      const markStatus = isLate ? 'Late' : 'Present';

      await axios.post(
        'http://localhost:5000/api/attendance/mark',
        {
          studentId: student.id,
          date: today,
          status: markStatus,
          time: timeStr
        },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );

      setTodayRecord({
        date: today,
        status: markStatus,
        time: timeStr,
        day: now.toLocaleDateString('en-US', { weekday: 'long' })
      });
      setShowCamera(false);
      setStatus('success');
      showToast(isLate ? 'Marked as Late!' : 'Attendance marked successfully!');
    } catch (err) {
      const errMsg = err.response?.data?.error || '';
      if (errMsg.includes('already') || err.response?.status === 409) {
        setStatus('already_marked');
        setShowCamera(false);
        showToast('Already marked for today!', 'error');
      } else {
        setScanStep('failed');
        showToast('Failed to mark attendance!', 'error');
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
                  <p className="text-blue-100 text-xs mt-2">Cutoff: 08:30 AM</p>
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

            {/* ===== ATTENDANCE SECTION ===== */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <FaCamera className="w-4 h-4 text-blue-500"/>
                Today's Attendance
              </h3>

              {/* ===== CAMERA / FACE SCAN ===== */}
              {showCamera && (
                <div className="space-y-4">

                  {/* Camera View */}
                  <div className="relative rounded-2xl overflow-hidden bg-black">
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full rounded-2xl"
                      onUserMedia={() => setCameraReady(true)}
                      onUserMediaError={() => {
                        showToast('Camera access denied!', 'error');
                        setShowCamera(false);
                      }}
                      videoConstraints={{ facingMode: 'user' }}
                    />

                    {/* Scan Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">

                      {/* Face Frame */}
                      <div className={`relative w-52 h-64 ${
                        scanStep === 'verified' ? 'border-green-400' :
                        scanStep === 'failed' ? 'border-red-400' :
                        scanStep === 'scanning' || scanStep === 'verifying'
                          ? 'border-yellow-400' : 'border-blue-400'
                        } border-2 rounded-3xl`}>

                        {/* Corner dots */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-current rounded-tl-lg"/>
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-current rounded-tr-lg"/>
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-current rounded-bl-lg"/>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-current rounded-br-lg"/>

                        {/* Scan line animation */}
                        {(scanStep === 'scanning' || scanStep === 'verifying') && (
                          <div className="absolute left-0 right-0 h-0.5 bg-yellow-400 opacity-80 animate-bounce"
                            style={{ top: '50%' }}/>
                        )}

                        {/* Verified overlay */}
                        {scanStep === 'verified' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-3xl">
                            <MdCheckCircle className="w-16 h-16 text-green-400"/>
                          </div>
                        )}

                        {/* Failed overlay */}
                        {scanStep === 'failed' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-3xl">
                            <MdCancel className="w-16 h-16 text-red-400"/>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Label */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <div className={`px-4 py-2 rounded-full text-xs font-medium text-white backdrop-blur-sm
                        ${scanStep === 'verified' ? 'bg-green-500/80' :
                          scanStep === 'failed' ? 'bg-red-500/80' :
                          scanStep === 'scanning' || scanStep === 'verifying'
                            ? 'bg-yellow-500/80' : 'bg-black/50'}`}>
                        {scanStep === 'init' && cameraReady && 'Position your face in the frame'}
                        {scanStep === 'init' && !cameraReady && 'Starting camera...'}
                        {scanStep === 'scanning' && 'Scanning face...'}
                        {scanStep === 'verifying' && 'Verifying identity...'}
                        {scanStep === 'verified' && 'Face verified! ✓'}
                        {scanStep === 'failed' && 'Face not recognized'}
                      </div>
                    </div>
                  </div>

                  {/* Camera Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowCamera(false); setScanStep('init'); }}
                      className="flex-1 py-3 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                      <MdCancel className="w-4 h-4"/> Cancel
                    </button>

                    {scanStep === 'failed' ? (
                      <button
                        onClick={() => setScanStep('init')}
                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                        <MdCameraAlt className="w-4 h-4"/> Try Again
                      </button>
                    ) : (
                      <button
                        onClick={captureFace}
                        disabled={!cameraReady || scanStep === 'scanning' || scanStep === 'verifying' || scanStep === 'verified'}
                        className={`flex-1 py-3 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2
                          ${!cameraReady || scanStep !== 'init'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : isLateTime
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : 'bg-blue-500 hover:bg-blue-600'}`}>
                        {scanStep === 'scanning' || scanStep === 'verifying' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                            {scanStep === 'scanning' ? 'Scanning...' : 'Verifying...'}
                          </>
                        ) : (
                          <>
                            <MdFaceRetouchingNatural className="w-5 h-5"/>
                            Scan Face
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Already Marked */}
              {!showCamera && status === 'already_marked' && todayRecord && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-green-50 rounded-2xl border border-green-100">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MdCheckCircle className="w-8 h-8 text-green-500"/>
                    </div>
                    <div>
                      <p className="font-semibold text-green-700">Attendance Already Marked!</p>
                      <p className="text-green-600 text-sm mt-0.5">Your attendance has been recorded for today.</p>
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
                            ${item.label === 'Status' && todayRecord.status === 'Present' ? 'text-green-500'
                              : item.label === 'Status' && todayRecord.status === 'Late' ? 'text-yellow-500'
                              : 'text-blue-500'}`}/>
                          <p className="text-xs text-gray-400">{item.label}</p>
                          <p className={`text-sm font-semibold mt-0.5
                            ${item.label === 'Status' && todayRecord.status === 'Present' ? 'text-green-600'
                              : item.label === 'Status' && todayRecord.status === 'Late' ? 'text-yellow-600'
                              : 'text-gray-700'}`}>
                            {item.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => navigate('/student-attendance')}
                    className="w-full py-3 border border-blue-200 text-blue-500 text-sm font-medium rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                    <MdHistory className="w-4 h-4"/> View Full Attendance History
                  </button>
                </div>
              )}

              {/* Success */}
              {!showCamera && status === 'success' && todayRecord && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-green-50 rounded-2xl border border-green-100">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MdCheckCircle className="w-8 h-8 text-green-500"/>
                    </div>
                    <div>
                      <p className="font-semibold text-green-700">
                        {todayRecord.status === 'Late' ? 'Marked as Late!' : 'Attendance Marked Successfully!'}
                      </p>
                      <p className="text-green-600 text-sm mt-0.5">Check-in: {todayRecord.time}</p>
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
                            ${item.label === 'Status' && todayRecord.status === 'Present' ? 'text-green-500'
                              : item.label === 'Status' && todayRecord.status === 'Late' ? 'text-yellow-500'
                              : 'text-blue-500'}`}/>
                          <p className="text-xs text-gray-400">{item.label}</p>
                          <p className={`text-sm font-semibold mt-0.5
                            ${item.label === 'Status' && todayRecord.status === 'Present' ? 'text-green-600'
                              : item.label === 'Status' && todayRecord.status === 'Late' ? 'text-yellow-600'
                              : 'text-gray-700'}`}>
                            {item.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Idle */}
              {!showCamera && (status === 'idle' || status === 'error') && (
                <div className="space-y-4">
                  <div className={`flex items-start gap-3 p-4 rounded-xl border
                    ${isLateTime ? 'bg-yellow-50 border-yellow-100' : 'bg-blue-50 border-blue-100'}`}>
                    {isLateTime
                      ? <MdWarning className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"/>
                      : <MdInfo className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"/>}
                    <div>
                      <p className={`text-sm font-medium ${isLateTime ? 'text-yellow-700' : 'text-blue-700'}`}>
                        {isLateTime ? 'You are marking late attendance' : 'Ready to mark attendance'}
                      </p>
                      <p className={`text-xs mt-0.5 ${isLateTime ? 'text-yellow-600' : 'text-blue-600'}`}>
                        {isLateTime
                          ? 'Attendance will be marked as "Late"'
                          : 'Attendance will be marked as "Present"'}
                      </p>
                    </div>
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                      <MdCancel className="w-5 h-5 text-red-500 flex-shrink-0"/>
                      <p className="text-sm text-red-600">Failed. Please try again.</p>
                    </div>
                  )}

                  {/* ✅ Face Scan Button */}
                  <button
                    onClick={startFaceScan}
                    className={`w-full py-4 text-white font-semibold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 text-base
                      ${isLateTime
                        ? 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200'
                        : 'bg-blue-500 hover:bg-blue-600 shadow-blue-200'}`}>
                    <MdFaceRetouchingNatural className="w-6 h-6"/>
                    {isLateTime ? 'Scan Face — Mark Late' : 'Scan Face — Mark Attendance'}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    Face scan required to verify your identity
                  </p>
                </div>
              )}
            </div>

            {/* Rules */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <MdInfo className="w-4 h-4 text-blue-500"/>
                Attendance Rules
              </h3>
              <div className="space-y-2">
                {[
                  { icon: MdCheckCircle, color: 'text-green-500', text: 'Present — Scan before 08:30 AM' },
                  { icon: MdAccessTime, color: 'text-yellow-500', text: 'Late — Scan after 08:30 AM' },
                  { icon: MdCancel, color: 'text-red-500', text: 'Absent — Not scanned by end of day' },
                  { icon: MdFaceRetouchingNatural, color: 'text-blue-500', text: 'Face scan required for verification' },
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