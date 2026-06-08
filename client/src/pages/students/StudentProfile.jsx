import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdCalendarToday, MdBarChart, MdEmail, MdPhone,
  MdBadge, MdClass, MdEdit, MdCheck, MdClose
} from 'react-icons/md';
import StudentSidebar from '../../components/StudentComponents/StudentSidebar';

export default function StudentProfile() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('student_token');
    const userData = localStorage.getItem('student_user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData) {
        const parsed = JSON.parse(userData);
        setStudent(parsed);
        setForm(parsed);
      }
    } catch { navigate('/'); }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    navigate('/');
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    const updated = { ...student, phone: form.phone };
    setStudent(updated);
    localStorage.setItem('student_user', JSON.stringify(updated));
    setEditing(false);
    showToast('Profile updated successfully!');
  };

  const attendanceRate = student?.attendance || 0;
  const attendanceColor = attendanceRate >= 85
    ? 'text-green-500' : attendanceRate >= 75
    ? 'text-yellow-500' : 'text-red-500';

  if (!student) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ✅ StudentSidebar Component */}
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
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-bold">
                  {student?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{student?.name}</h2>
                  <p className="text-blue-100 text-sm mt-1">{student?.className}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-mono">
                      {student?.studentId}
                    </span>
                    <span className="text-xs bg-green-400/30 px-2.5 py-1 rounded-full">
                      {student?.status || 'Active'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-xl transition-all">
                  <MdEdit className="w-4 h-4"/>
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Personal Info Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="space-y-4">

                {[
                  { icon: MdBadge, label: 'Student ID', value: student?.studentId },
                  { icon: MdEmail, label: 'Email Address', value: student?.email },
                  { icon: MdClass, label: 'Class', value: student?.className },
                  { icon: MdCalendarToday, label: 'Join Date', value: student?.joinDate || '—' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-500"/>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                        <p className="text-sm font-medium text-gray-700">{item.value}</p>
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
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setEditing(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-500 text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                      <MdClose className="w-4 h-4"/> Cancel
                    </button>
                    <button onClick={handleSave}
                      className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                      <MdCheck className="w-4 h-4"/> Save Changes
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
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={attendanceRate >= 85 ? '#22c55e' : attendanceRate >= 75 ? '#eab308' : '#ef4444'}
                      strokeWidth="3"
                      strokeDasharray={`${attendanceRate}, 100`}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${attendanceColor}`}>{attendanceRate}%</span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Classes', value: 50, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Present', value: Math.round(attendanceRate * 0.5), color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Absent', value: Math.round((100 - attendanceRate) * 0.3), color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Late', value: 3, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                  ].map((item, i) => (
                    <div key={i} className={`${item.bg} rounded-xl p-3`}>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'}`}>
          <MdCheck className="w-4 h-4 text-green-400"/>
          {toast.msg}
        </div>
      )}
    </div>
  );
}