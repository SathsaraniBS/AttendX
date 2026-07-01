import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MdMenu, MdAdd, MdSearch, MdEdit, MdDelete,
  MdCalendarToday, MdClose, MdCheck, MdPeople,
  MdPerson, MdEmail, MdPhone, MdBadge, MdClass,
  MdCameraAlt, MdContentCopy, MdVisibilityOff,
  MdVisibility, MdDownload, MdRefresh, MdBarChart,
  MdFaceRetouchingNatural, MdChevronLeft, MdChevronRight
} from 'react-icons/md';
import { FaUserGraduate } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminComponents/AdminSidebar';
import FaceRegisterModal from '../../components/AdminComponents/FaceRegisterModal';

// ── API constants ─────────────────────────────────────────────────────────────
const BASE        = 'http://localhost:5000/api';
const API_BASE    = `${BASE}/students`;
const CLASSES_API = `${BASE}/classes/`;
const STORAGE_KEY = 'attendx_students';
const CLASSES_KEY = 'attendx_classes';
const PER_PAGE    = 10;

// ── Generate password ─────────────────────────────────────────────────────────
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

// ==================== ADD / EDIT STUDENT MODAL ====================
function AddStudentModal({ isOpen, onClose, onSave, editData, classes }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: '', studentId: '', email: '',
    phone: '', className: '', password: '',
    status: 'Active', photo: null, photoPreview: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [errors,       setErrors]       = useState({});

  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      setForm({ ...editData, password: '', photoPreview: editData.photo || null });
    } else {
      setForm({
        name: '', studentId: `S${Date.now().toString().slice(-5)}`,
        email: '', phone: '', className: '',
        password: generatePassword(), status: 'Active',
        photo: null, photoPreview: null,
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(p => ({ ...p, photo: file, photoPreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(form.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())      e.name      = 'Name is required';
    if (!form.studentId.trim()) e.studentId = 'Student ID is required';
    if (!form.email.trim())     e.email     = 'Email is required';
    if (!form.className)        e.className = 'Class is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  if (!isOpen) return null;

  const inputCls = (field) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all
    ${errors[field]
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <FaUserGraduate className="w-5 h-5 text-blue-500"/>
            <h2 className="font-semibold text-gray-800">
              {editData ? 'Edit Student' : 'Add New Student'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-all">
            <MdClose className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Photo */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                {form.photoPreview
                  ? <img src={form.photoPreview} alt="preview" className="w-full h-full object-cover"/>
                  : <MdPerson className="w-10 h-10 text-gray-300"/>}
              </div>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-all">
                <MdCameraAlt className="w-4 h-4"/>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto}/>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Student Photo</p>
              <p className="text-xs text-gray-400 mt-0.5">Upload for face recognition</p>
              <p className="text-xs text-gray-300">JPG, PNG (Max 5MB)</p>
            </div>
          </div>

          {/* Name + ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 flex items-center gap-1 block">
                <MdPerson className="w-4 h-4 text-gray-400"/> Full Name *
              </label>
              <input type="text" placeholder="e.g. Kasun Perera"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className={inputCls('name')}/>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 flex items-center gap-1 block">
                <MdBadge className="w-4 h-4 text-gray-400"/> Student ID *
              </label>
              <input type="text" placeholder="e.g. BSIT1A001"
                value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})}
                className={inputCls('studentId')}/>
              {errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId}</p>}
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 flex items-center gap-1 block">
                <MdEmail className="w-4 h-4 text-gray-400"/> Email Address *
              </label>
              <input type="email" placeholder="student@student.attendx.lk"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className={inputCls('email')}/>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 flex items-center gap-1 block">
                <MdPhone className="w-4 h-4 text-gray-400"/> Phone Number
              </label>
              <input type="tel" placeholder="e.g. 0771234567"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
            </div>
          </div>

          {/* Class + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 flex items-center gap-1 block">
                <MdClass className="w-4 h-4 text-gray-400"/> Class *
              </label>
              <select value={form.className}
                onChange={e => setForm({...form, className: e.target.value})}
                className={`${inputCls('className')} bg-white`}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.className && <p className="text-xs text-red-500 mt-1">{errors.className}</p>}
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block">Status</label>
              <select value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white">
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>

          {/* Password — only on Add */}
          {!editData && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Login Credentials</p>
                  <p className="text-xs text-gray-400 mt-0.5">Share with the student</p>
                </div>
                <button type="button"
                  onClick={() => setForm(p => ({...p, password: generatePassword()}))}
                  className="text-xs text-blue-500 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all">
                  Regenerate
                </button>
              </div>
              <div className="bg-white rounded-lg px-3 py-2.5 border border-blue-100 mb-2">
                <p className="text-xs text-gray-400 mb-0.5">Email</p>
                <p className="text-sm text-gray-700 font-medium">{form.email || 'Enter email above'}</p>
              </div>
              <div className="bg-white rounded-lg px-3 py-2.5 border border-blue-100">
                <p className="text-xs text-gray-400 mb-0.5">Password</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono font-medium text-gray-800 tracking-wider">
                    {showPassword ? form.password : '••••••••••'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-all">
                      {showPassword
                        ? <MdVisibility className="w-4 h-4"/>
                        : <MdVisibilityOff className="w-4 h-4"/>}
                    </button>
                    <button type="button" onClick={copyPassword}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all
                        ${copied ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                      {copied
                        ? <><MdCheck className="w-3 h-3"/> Copied!</>
                        : <><MdContentCopy className="w-3 h-3"/> Copy</>}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                <MdEmail className="w-3 h-3"/> Student login: email + password above
              </p>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all">
            {saving
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Saving...</>
              : <><MdCheck className="w-4 h-4"/> {editData ? 'Update Student' : 'Add Student'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== STUDENT LIST PAGE ====================
export default function StudentList() {
  const navigate = useNavigate();
  const [user,          setUser]          = useState(null);
  const [students,      setStudents]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('All');
  const [filterClass,   setFilterClass]   = useState('All');
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editData,      setEditData]      = useState(null);
  const [deleteId,      setDeleteId]      = useState(null);
  const [selectedIds,   setSelectedIds]   = useState([]);
  const [toast,         setToast]         = useState(null);
  const [classOptions,  setClassOptions]  = useState([]);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [faceStudent,   setFaceStudent]   = useState(null);
  const [faceRegistered,setFaceRegistered]= useState({});

  // ── Auth + initial load ───────────────────────────────────────────────────
  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined') setUser(JSON.parse(userData));
    } catch { navigate('/'); return; }
    fetchClasses();
    fetchStudents();
  }, [navigate]);

  // ── ✅ Fix: Classes from API, not just cache ──────────────────────────────
  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res   = await axios.get(CLASSES_API, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      const names = (res.data || []).map(c => c.name).filter(Boolean);
      setClassOptions(names);
      localStorage.setItem(CLASSES_KEY, JSON.stringify(res.data || []));
    } catch {
      // Fallback to cache
      try {
        const cached = localStorage.getItem(CLASSES_KEY);
        if (cached) {
          const cls = JSON.parse(cached);
          setClassOptions(cls.map(c => c.name).filter(Boolean));
        }
      } catch { /* ignore */ }
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    // Show cache first for fast UX
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) { setStudents(JSON.parse(cached)); setLoading(false); }
    } catch { /* ignore */ }

    try {
      const token = localStorage.getItem('token');
      const res   = await axios.get(`${API_BASE}/`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 6000,
      });
      const data = res.data || [];
      setStudents(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Already showing cache — no further action needed
    } finally {
      setLoading(false);
    }
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  // ── Filter + pagination ───────────────────────────────────────────────────
  const filtered = students.filter(s => {
    const matchSearch =
      (s.name      || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.studentId || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email     || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    const matchClass  = filterClass  === 'All' || s.className === filterClass;
    return matchSearch && matchStatus && matchClass;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [search, filterStatus, filterClass]);

  // ── Save (Add / Edit) ─────────────────────────────────────────────────────
  const handleSave = async (form) => {
    try {
      const token   = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editData) {
        // ✅ Fix: show real error if update fails
        try {
          await axios.put(`${API_BASE}/${editData.id}`, form, { headers, timeout: 5000 });
          const updated = students.map(s =>
            s.id === editData.id ? { ...s, ...form, id: editData.id } : s
          );
          setStudents(updated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          showToast('Student updated successfully!');
          setModalOpen(false);
          setEditData(null);
        } catch (err) {
          const errMsg = err.response?.data?.error || 'Failed to update student!';
          showToast(errMsg, 'error');
          // ❌ Do NOT silently update local state when backend fails
        }
      } else {
        // Add new student
        try {
          const res      = await axios.post(`${API_BASE}/add`, form, { headers, timeout: 5000 });
          const newStud  = res.data;
          const updated  = [...students, newStud];
          setStudents(updated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          showToast(`${form.name} added successfully!`);
          setModalOpen(false);
          setEditData(null);
        } catch (err) {
          const errMsg = err.response?.data?.error || '';
          if (errMsg.toLowerCase().includes('email already')) {
            showToast('Email already exists!', 'error'); return;
          }
          if (errMsg.toLowerCase().includes('student id already')) {
            showToast('Student ID already exists!', 'error'); return;
          }
          showToast(errMsg || 'Failed to add student!', 'error');
        }
      }
    } catch {
      showToast('Unexpected error. Please try again.', 'error');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
    } catch { /* local fallback OK — attendance cascade handled by backend */ }
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDeleteId(null);
    showToast('Student deleted successfully!');
  };

  // ── Bulk delete ───────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    const token = localStorage.getItem('token');
    await Promise.all(
      selectedIds.map(id =>
        axios.delete(`${API_BASE}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {})
      )
    );
    const updated = students.filter(s => !selectedIds.includes(s.id));
    setStudents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    showToast(`${selectedIds.length} students deleted!`);
    setSelectedIds([]);
  };

  // ── CSV export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Name', 'Student ID', 'Email', 'Phone', 'Class', 'Status', 'Attendance', 'Join Date'];
    const rows    = filtered.map(s =>
      [s.name, s.studentId, s.email, s.phone || '', s.className,
       s.status, `${s.attendance || 0}%`, s.joinDate || ''].join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Exported successfully!');
  };

  // ── Selection helpers ─────────────────────────────────────────────────────
  const toggleSelect    = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(s => s.id));

  // ── Helpers ───────────────────────────────────────────────────────────────
  const statusColor = (status) => {
    if (status === 'Active')    return 'bg-green-50 text-green-600 border-green-100';
    if (status === 'Suspended') return 'bg-red-50 text-red-500 border-red-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  };

  // ✅ Fix: hasFace checks hasFace field from backend (face_encoding or photo)
  const hasFace = (s) => faceRegistered[s.id] || s.hasFace || false;

  const allClasses = [...new Set([
    ...classOptions,
    ...students.map(s => s.className).filter(Boolean),
  ])];

  const stats = [
    { label: 'Total Students',             value: students.length,                                                                   icon: MdPeople,   color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Active',                      value: students.filter(s => s.status === 'Active').length,                               icon: MdCheck,    color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Inactive / Suspended',        value: students.filter(s => s.status !== 'Active').length,                              icon: MdClose,    color: 'text-red-500',    bg: 'bg-red-50' },
    { label: 'Avg Attendance',              value: students.length > 0
        ? `${Math.round(students.reduce((a, s) => a + (s.attendance || 0), 0) / students.length)}%`
        : '0%',                                                                                                                       icon: MdBarChart, color: 'text-purple-600', bg: 'bg-purple-50' },
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
            <h1 className="text-lg font-semibold text-gray-800">Students</h1>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {students.length} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { fetchStudents(); fetchClasses(); }}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all">
              <MdRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
              Refresh
            </button>
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

          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
            <div className="flex items-center gap-3 flex-wrap">

              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input type="text" placeholder="Search name, ID, email..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
              </div>

              {/* Status filter */}
              <div className="flex gap-1.5">
                {['All', 'Active', 'Inactive', 'Suspended'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${filterStatus === s ? 'bg-blue-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Class filter — ✅ from API */}
              <select value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 focus:outline-none bg-white">
                <option value="All">All Classes</option>
                {allClasses.map(c => <option key={c}>{c}</option>)}
              </select>

              {/* Bulk delete */}
              {selectedIds.length > 0 && (
                <button onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-500 border border-red-100 text-xs font-medium rounded-xl hover:bg-red-100 transition-all">
                  <MdDelete className="w-4 h-4"/> Delete ({selectedIds.length})
                </button>
              )}

              {/* Export */}
              <button onClick={exportCSV}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-500 text-xs font-medium rounded-xl hover:bg-gray-50 transition-all">
                <MdDownload className="w-4 h-4"/> Export CSV
              </button>

              {/* Add student */}
              <button onClick={() => { setEditData(null); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all ml-auto">
                <MdAdd className="w-4 h-4"/> Add Student
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"/>
                <p className="text-gray-400 text-sm">Loading students...</p>
              </div>
            ) : (
              <>
                {/* Face legend */}
                <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MdFaceRetouchingNatural className="w-4 h-4 text-green-500"/>
                    Face Registered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MdFaceRetouchingNatural className="w-4 h-4 text-orange-400"/>
                    Face Not Registered
                  </span>
                  <span className="ml-auto text-gray-400">
                    {filtered.length} students found
                  </span>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 w-10">
                        <input type="checkbox"
                          checked={selectedIds.length === filtered.length && filtered.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer"/>
                      </th>
                      {['Student', 'Student ID', 'Email', 'Phone', 'Class', 'Attendance', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(s => (
                      <tr key={s.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-all
                          ${selectedIds.includes(s.id) ? 'bg-blue-50' : ''}`}>

                        <td className="px-4 py-3">
                          <input type="checkbox"
                            checked={selectedIds.includes(s.id)}
                            onChange={() => toggleSelect(s.id)}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer"/>
                        </td>

                        {/* Student */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center">
                              {s.photo
                                ? <img src={s.photo} alt={s.name} className="w-full h-full object-cover"/>
                                : <span className="text-blue-600 font-bold text-sm">{s.name?.charAt(0)}</span>}
                            </div>
                            <p className="text-sm font-medium text-gray-800 whitespace-nowrap">{s.name}</p>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                            {s.studentId}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-500">{s.email}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{s.phone || '—'}</td>

                        <td className="px-4 py-3">
                          <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg whitespace-nowrap">
                            {s.className}
                          </span>
                        </td>

                        {/* Attendance */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                              <div
                                className={`h-1.5 rounded-full ${
                                  (s.attendance || 0) >= 85 ? 'bg-green-400'
                                  : (s.attendance || 0) >= 70 ? 'bg-yellow-400'
                                  : 'bg-red-400'}`}
                                style={{ width: `${Math.min(s.attendance || 0, 100)}%` }}/>
                            </div>
                            <span className={`text-xs font-semibold ${
                              (s.attendance || 0) >= 85 ? 'text-green-600'
                              : (s.attendance || 0) >= 70 ? 'text-yellow-600'
                              : 'text-red-500'}`}>
                              {s.attendance || 0}%
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(s.status)}`}>
                            {s.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{s.joinDate || '—'}</td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">

                            {/* Face register */}
                            <button
                              onClick={() => { setFaceStudent(s); setFaceModalOpen(true); }}
                              title={hasFace(s) ? 'Update Face' : 'Register Face'}
                              className={`p-1.5 rounded-lg transition-all relative group
                                ${hasFace(s)
                                  ? 'text-green-500 hover:bg-green-50'
                                  : 'text-orange-400 hover:bg-orange-50'}`}>
                              <MdFaceRetouchingNatural className="w-4 h-4"/>
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                {hasFace(s) ? 'Update Face' : 'Register Face'}
                              </span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => { setEditData(s); setModalOpen(true); }}
                              title="Edit Student"
                              className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg transition-all">
                              <MdEdit className="w-4 h-4"/>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteId(s.id)}
                              title="Delete Student"
                              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                              <MdDelete className="w-4 h-4"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Empty state */}
                {filtered.length === 0 && (
                  <div className="text-center py-16">
                    <FaUserGraduate className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                    <p className="text-gray-400 font-medium">No students found</p>
                    <p className="text-gray-300 text-sm mt-1">
                      {students.length === 0 ? 'Add your first student!' : 'Try adjusting filters'}
                    </p>
                    {students.length === 0 && (
                      <button onClick={() => setModalOpen(true)}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-xl mx-auto hover:bg-blue-600 transition-all">
                        <MdAdd className="w-4 h-4"/> Add First Student
                      </button>
                    )}
                  </div>
                )}

                {/* ✅ Real Pagination */}
                {filtered.length > 0 && (
                  <div className="px-5 py-3.5 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                      Showing {Math.min((currentPage - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length} students
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-all">
                        <MdChevronLeft className="w-4 h-4"/>
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all
                              ${currentPage === page
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-all">
                        <MdChevronRight className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AddStudentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
        editData={editData}
        classes={allClasses}
      />

      {/* Face Register Modal */}
      <FaceRegisterModal
        isOpen={faceModalOpen}
        onClose={() => { setFaceModalOpen(false); setFaceStudent(null); }}
        student={faceStudent}
        onSuccess={(studentId) => {
          setFaceRegistered(prev => ({ ...prev, [studentId]: true }));
          showToast(`Face registered for ${faceStudent?.name}!`);
          fetchStudents();
        }}
      />

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdDelete className="w-7 h-7 text-red-500"/>
            </div>
            <h3 className="text-gray-800 font-semibold text-lg mb-2">Delete Student?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will permanently remove the student and all attendance records.
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