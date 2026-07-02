import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MdCalendarToday, MdBarChart, MdEmail, MdPhone,
  MdBadge, MdClass, MdEdit, MdCheck, MdClose,
  MdCheckCircle, MdCancel, MdAccessTime, MdWarning
} from 'react-icons/md';
import StudentSidebar from '../../components/StudentComponents/StudentSidebar';

const BASE = 'http://localhost:5000/api';

export default function StudentProfile() {
  const navigate = useNavigate();
  const [student,        setStudent]        = useState(null);
  const [editing,        setEditing]        = useState(false);
  const [form,           setForm]           = useState({});
  const [saving,         setSaving]         = useState(false);
  const [toast,          setToast]          = useState(null);
  const [loadingStats,   setLoadingStats]   = useState(true);
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0, present: 0, absent: 0, late: 0, rate: 0
  });

  // ── Auth + load ────────────────────────────────────────────────────────────
  useEffect(() => {
    const token    = localStorage.getItem('student_token');
    const userData = localStorage.getItem('student_user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData) {
        const parsed = JSON.parse(userData);
        setStudent(parsed);
        setForm(parsed);
        fetchAttendanceStats(parsed.id, token);
      }
    } catch { navigate('/'); }
  }, [navigate]);

  // ── Fetch attendance stats ─────────────────────────────────────────────────
  const fetchAttendanceStats = async (studentId, token) => {
    setLoadingStats(true);
    try {
      const res = await axios.get(
        `${BASE}/attendance/student/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );
      const records = res.data || [];
      const total   = records.length;
      const present = records.filter(r => r.status === 'Present').length;
      const absent  = records.filter(r => r.status === 'Absent').length;
      const late    = records.filter(r => r.status === 'Late').length;
      // ✅ Fix: Late is also "attended" — include in rate
      const rate    = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
      setAttendanceStats({ total, present, absent, late, rate });
    } catch {
      setAttendanceStats({ total: 0, present: 0, absent: 0, late: 0, rate: 0 });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    navigate('/');
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Save phone — local + API ───────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('student_token');
      try {
        await axios.put(
          `${BASE}/students/${student.id}`,
          { ...student, phone: form.phone },
          { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
        );
      } catch {
        // Backend fail — still update local
      }
      const updated = { ...student, phone: form.phone };
      setStudent(updated);
      localStorage.setItem('student_user', JSON.stringify(updated));
      setEditing(false);
      showToast('Profile updated successfully!');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const attendanceRate  = attendanceStats.rate || student?.attendance || 0;
  const attendanceColor =
    attendanceRate >= 85 ? 'text-green-500'
    : attendanceRate >= 75 ? 'text-yellow-500'
    : 'text-red-500';
  const strokeColor =
    attendanceRate >= 85 ? '#22c55e'
    : attendanceRate >= 75 ? '#eab308'
    : '#ef4444';

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!student) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"/>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar student={student} onLogout={handleLogout}/>

      <div className="flex-1 ml-56">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <h1 className="text-lg font-semibold text-gray-800">My Profile</h1>
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
          <div className="max-w-2xl space-y-5">

            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-bold flex-shrink-0">
                  {student?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold truncate">{student?.name}</h2>
                  <p className="text-blue-100 text-sm mt-1">{student?.className}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-mono">
                      {student?.studentId}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full
                      ${student?.status === 'Active' ? 'bg-green-400/30' : 'bg-red-400/30'}`}>
                      {student?.status || 'Active'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setEditing(!editing); setForm(student); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-xl transition-all flex-shrink-0">
                  <MdEdit className="w-4 h-4"/>
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="space-y-1">

                {[
                  { icon: MdBadge,         label: 'Student ID',    value: student?.studentId },
                  { icon: MdEmail,         label: 'Email Address', value: student?.email },
                  { icon: MdClass,         label: 'Class',         value: student?.className },
                  { icon: MdCalendarToday, label: 'Join Date',     value: student?.joinDate || '—' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50">
                      <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-500"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                        <p className="text-sm font-medium text-gray-700 truncate">{item.value}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Editable Phone */}
                <div className="flex items-center gap-4 py-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MdPhone className="w-4 h-4 text-blue-500"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">Phone Number</p>
                    {editing ? (
                      <input
                        type="tel"
                        value={form.phone || ''}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-blue-300 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
                    ) : (
                      <p className="text-sm font-medium text-gray-700">{student?.phone || '—'}</p>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-3 pt-3">
                    <button onClick={() => setEditing(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-500 text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                      <MdClose className="w-4 h-4"/> Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                      {saving
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Saving...</>
                        : <><MdCheck className="w-4 h-4"/> Save Changes</>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MdBarChart className="w-5 h-5 text-blue-500"/>
                Attendance Summary
              </h3>

              {loadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"/>
                </div>
              ) : (
                <div className="flex items-center gap-6">

                  {/* Circle chart */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="3"
                        strokeDasharray={`${attendanceRate}, 100`}/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold ${attendanceColor}`}>
                        {attendanceRate}%
                      </span>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Classes', value: attendanceStats.total,   color: 'text-blue-600',   bg: 'bg-blue-50',   icon: MdCalendarToday },
                      { label: 'Present',       value: attendanceStats.present, color: 'text-green-600',  bg: 'bg-green-50',  icon: MdCheckCircle },
                      { label: 'Absent',        value: attendanceStats.absent,  color: 'text-red-500',    bg: 'bg-red-50',    icon: MdCancel },
                      { label: 'Late',          value: attendanceStats.late,    color: 'text-yellow-600', bg: 'bg-yellow-50', icon: MdAccessTime },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className={`${item.bg} rounded-xl p-3`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon className={`w-3.5 h-3.5 ${item.color}`}/>
                            <p className="text-xs text-gray-500">{item.label}</p>
                          </div>
                          <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ✅ Low attendance warning */}
              {!loadingStats && attendanceStats.total > 0 && attendanceRate < 75 && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                  <MdWarning className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-xs font-medium text-red-700">Low Attendance Warning!</p>
                    <p className="text-xs text-red-500 mt-0.5">
                      Minimum 75% required. You need {75 - attendanceRate}% more.
                    </p>
                  </div>
                </div>
              )}

              {/* No records */}
              {!loadingStats && attendanceStats.total === 0 && (
                <div className="text-center py-4 mt-4 border-t border-gray-50">
                  <MdCalendarToday className="w-8 h-8 text-gray-200 mx-auto mb-2"/>
                  <p className="text-gray-400 text-sm">No attendance records yet</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ✅ Toast — correct icon for error */}
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