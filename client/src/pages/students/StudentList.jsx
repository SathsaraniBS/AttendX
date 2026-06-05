import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  MdDashboard, MdPeople, MdClass, MdSettings,
  MdNotifications, MdBackup, MdAssignment,
  MdVisibility, MdHistory, MdBarChart,
  MdLogout, MdMenu, MdAdd, MdSearch,
  MdEdit, MdDelete, MdCalendarToday,
  MdClose, MdCheck, MdFilterList,
  MdPerson, MdEmail, MdPhone, MdBadge,
  MdCameraAlt, MdContentCopy, MdVisibilityOff,
  MdDownload, MdUpload
} from 'react-icons/md';
import { FaUserGraduate } from 'react-icons/fa';

// ==================== SIDEBAR ====================
const mainNav = [
  { path: '/live', icon: MdVisibility, label: 'Live Attendance' },
  { path: '/attendance', icon: MdHistory, label: 'Attendance History' },
  { path: '/students', icon: MdPeople, label: 'Students' },
  { path: '/classes', icon: MdClass, label: 'Classes' },
  { path: '/reports', icon: MdBarChart, label: 'Attendance Reports' },
];

const settingsNav = [
  { path: '/settings', icon: MdSettings, label: 'System Settings' },
  { path: '/notifications', icon: MdNotifications, label: 'Notification' },
  { path: '/backup', icon: MdBackup, label: 'Backup' },
  { path: '/logs', icon: MdAssignment, label: 'Activity Logs' },
];

function Sidebar({ user, onLogout }) {
  const location = useLocation();

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = location.pathname === item.path ||
      (item.path === '/students' && location.pathname.startsWith('/students'));
    return (
      <Link to={item.path}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-all duration-200 text-sm
          ${active
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
        <Icon className="w-5 h-5 flex-shrink-0"/>
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-[#0f1729] flex flex-col z-50 overflow-y-auto">
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <MdVisibility className="w-5 h-5 text-white"/>
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
          <MdDashboard className="w-5 h-5 flex-shrink-0"/>
          <span>Dashboard</span>
        </Link>
      </div>

      <div className="px-4 pt-4 pb-1">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Main</p>
      </div>
      <nav className="space-y-0.5 pb-2">
        {mainNav.map(item => <NavItem key={item.path} item={item}/>)}
      </nav>

      <div className="px-4 pt-4 pb-1">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Settings</p>
      </div>
      <nav className="space-y-0.5 pb-2">
        {settingsNav.map(item => <NavItem key={item.path} item={item}/>)}
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
            className="text-gray-400 hover:text-red-400 transition-all">
            <MdLogout className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ==================== AUTO GENERATE PASSWORD ====================
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

// ==================== ADD STUDENT MODAL ====================
function AddStudentModal({ isOpen, onClose, onSave, editData, classes }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: '', studentId: '', email: '',
    phone: '', className: '', password: '',
    status: 'Active', photo: null, photoPreview: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({ ...editData, password: '', photoPreview: editData.photo || null });
    } else {
      const newPassword = generatePassword();
      setForm({
        name: '', studentId: `S${Date.now().toString().slice(-4)}`,
        email: '', phone: '', className: '',
        password: newPassword, status: 'Active',
        photo: null, photoPreview: null
      });
    }
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

  const regeneratePassword = () => {
    setForm(p => ({ ...p, password: generatePassword() }));
  };

  if (!isOpen) return null;

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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <MdClose className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Photo Upload */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                {form.photoPreview ? (
                  <img src={form.photoPreview} alt="preview"
                    className="w-full h-full object-cover"/>
                ) : (
                  <MdPerson className="w-10 h-10 text-gray-300"/>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-all">
                <MdCameraAlt className="w-4 h-4"/>
              </button>
              <input ref={fileRef} type="file" accept="image/*"
                className="hidden" onChange={handlePhoto}/>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Student Photo</p>
              <p className="text-xs text-gray-400 mt-0.5">Upload a clear face photo for recognition</p>
              <p className="text-xs text-gray-300 mt-0.5">JPG, PNG (Max 5MB)</p>
            </div>
          </div>

          {/* Name + ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block flex items-center gap-1">
                <MdPerson className="w-4 h-4 text-gray-400"/>
                Full Name *
              </label>
              <input type="text" placeholder="e.g. Kasun Perera"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                required/>
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block flex items-center gap-1">
                <MdBadge className="w-4 h-4 text-gray-400"/>
                Student ID *
              </label>
              <input type="text" placeholder="e.g. S2024001"
                value={form.studentId}
                onChange={e => setForm({...form, studentId: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                required/>
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block flex items-center gap-1">
                <MdEmail className="w-4 h-4 text-gray-400"/>
                Email Address *
              </label>
              <input type="email" placeholder="student@email.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                required/>
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block flex items-center gap-1">
                <MdPhone className="w-4 h-4 text-gray-400"/>
                Phone Number
              </label>
              <input type="tel" placeholder="e.g. 0771234567"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
            </div>
          </div>

          {/* Class + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block flex items-center gap-1">
                <MdClass className="w-4 h-4 text-gray-400"/>
                Class *
              </label>
              <select value={form.className}
                onChange={e => setForm({...form, className: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                required>
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1.5 block">Status</label>
              <select value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white">
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Login Credentials</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Share these credentials with the student
                </p>
              </div>
              <button type="button" onClick={regeneratePassword}
                className="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all">
                Regenerate
              </button>
            </div>

            {/* Email display */}
            <div className="bg-white rounded-lg px-3 py-2.5 border border-blue-100 mb-2">
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="text-sm text-gray-700 font-medium">
                {form.email || 'Enter email above'}
              </p>
            </div>

            {/* Password display */}
            <div className="bg-white rounded-lg px-3 py-2.5 border border-blue-100">
              <p className="text-xs text-gray-400 mb-0.5">Password</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-mono font-medium text-gray-800 tracking-wider">
                  {showPassword ? form.password : '••••••••••'}
                </p>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-all">
                    {showPassword
                      ? <MdVisibility className="w-4 h-4"/>
                      : <MdVisibilityOff className="w-4 h-4"/>}
                  </button>
                  <button type="button" onClick={copyPassword}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all
                      ${copied
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                    {copied
                      ? <><MdCheck className="w-3 h-3"/> Copied!</>
                      : <><MdContentCopy className="w-3 h-3"/> Copy</>}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
              <MdEmail className="w-3 h-3"/>
              Student can login using email + password above
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={() => onSave(form)}
            className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2">
            <MdCheck className="w-4 h-4"/>
            {editData ? 'Update Student' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== STUDENT LIST PAGE ====================
const sampleStudents = [
  { id: 1, name: 'Kasun Perera', studentId: 'S2024001', email: 'kasun@student.com', phone: '0771234567', className: 'BCA - 2A', status: 'Active', attendance: 85, photo: null, joinDate: '2024-01-15' },
  { id: 2, name: 'Nimal Silva', studentId: 'S2024002', email: 'nimal@student.com', phone: '0777654321', className: 'BCA - 2A', status: 'Active', attendance: 72, photo: null, joinDate: '2024-01-15' },
  { id: 3, name: 'Amali Fernando', studentId: 'S2024003', email: 'amali@student.com', phone: '0761234567', className: 'BCA - 2B', status: 'Active', attendance: 91, photo: null, joinDate: '2024-01-16' },
  { id: 4, name: 'Sathsarani BS', studentId: 'S2024004', email: 'sathsarani@student.com', phone: '0752345678', className: 'BCA - 2B', status: 'Active', attendance: 88, photo: null, joinDate: '2024-01-16' },
  { id: 5, name: 'Bandara Perera', studentId: 'S2024005', email: 'bandara@student.com', phone: '0712345678', className: 'BCA - 3A', status: 'Inactive', attendance: 45, photo: null, joinDate: '2024-01-17' },
  { id: 6, name: 'Chamara Silva', studentId: 'S2024006', email: 'chamara@student.com', phone: '0723456789', className: 'BCA - 3A', status: 'Active', attendance: 78, photo: null, joinDate: '2024-01-17' },
  { id: 7, name: 'Dilani Jayawardena', studentId: 'S2024007', email: 'dilani@student.com', phone: '0734567890', className: 'BCA - 3B', status: 'Active', attendance: 93, photo: null, joinDate: '2024-01-18' },
  { id: 8, name: 'Eranga Bandara', studentId: 'S2024008', email: 'eranga@student.com', phone: '0745678901', className: 'BCA - 1A', status: 'Suspended', attendance: 30, photo: null, joinDate: '2024-01-18' },
];

const classOptions = ['BCA - 1A', 'BCA - 2A', 'BCA - 2B', 'BCA - 3A', 'BCA - 3B', 'MCA - 1A'];

export default function StudentList() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState(sampleStudents);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterClass, setFilterClass] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined') setUser(JSON.parse(userData));
    } catch { navigate('/'); }
  }, [navigate]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const filtered = students.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    const matchClass = filterClass === 'All' || s.className === filterClass;
    return matchSearch && matchStatus && matchClass;
  });

  const handleSave = async (form) => {
    try {
      if (editData) {
        setStudents(prev => prev.map(s =>
          s.id === editData.id ? { ...s, ...form, id: editData.id } : s
        ));
        showToast('Student updated successfully!');
      } else {
        const newStudent = {
          ...form,
          id: Date.now(),
          attendance: 0,
          joinDate: new Date().toISOString().split('T')[0],
          photo: form.photoPreview || null,
        };
        setStudents(prev => [...prev, newStudent]);

        // API call (backend ready වුනාම)
        // await axios.post('http://localhost:5000/api/students/add', form);

        showToast(`Student ${form.name} added! Credentials sent to ${form.email}`);
      }
      setModalOpen(false);
      setEditData(null);
    } catch (err) {
      showToast('Error saving student!', 'error');
    }
  };

  const handleDelete = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setDeleteId(null);
    showToast('Student deleted successfully!');
  };

  const handleBulkDelete = () => {
    setStudents(prev => prev.filter(s => !selectedIds.includes(s.id)));
    setSelectedIds([]);
    showToast(`${selectedIds.length} students deleted!`);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(s => s.id));
  };

  const statusColor = (status) => {
    if (status === 'Active') return 'bg-green-50 text-green-600 border-green-100';
    if (status === 'Suspended') return 'bg-red-50 text-red-500 border-red-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  };

  const attendanceColor = (rate) => {
    if (rate >= 85) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-500';
  };

  const stats = [
    { label: 'Total Students', value: students.length, icon: MdPeople, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Students', value: students.filter(s => s.status === 'Active').length, icon: MdCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Inactive / Suspended', value: students.filter(s => s.status !== 'Active').length, icon: MdClose, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Avg Attendance', value: `${Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length)}%`, icon: MdBarChart, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} onLogout={handleLogout}/>

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
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                {['All', 'Active', 'Inactive', 'Suspended'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${filterStatus === s
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Class Filter */}
              <select value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 focus:outline-none focus:border-blue-400 bg-white">
                <option value="All">All Classes</option>
                {classOptions.map(c => <option key={c}>{c}</option>)}
              </select>

              {/* Bulk Delete */}
              {selectedIds.length > 0 && (
                <button onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-500 border border-red-100 text-xs font-medium rounded-xl hover:bg-red-100 transition-all">
                  <MdDelete className="w-4 h-4"/>
                  Delete ({selectedIds.length})
                </button>
              )}

              {/* Export */}
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-500 text-xs font-medium rounded-xl hover:bg-gray-50 transition-all">
                <MdDownload className="w-4 h-4"/>
                Export
              </button>

              {/* Add Student */}
              <button
                onClick={() => { setEditData(null); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all ml-auto">
                <MdAdd className="w-4 h-4"/>
                Add Student
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-500 cursor-pointer"/>
                  </th>
                  {['Student', 'Student ID', 'Email', 'Phone', 'Class', 'Attendance', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-all
                      ${selectedIds.includes(s.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox"
                        checked={selectedIds.includes(s.id)}
                        onChange={() => toggleSelect(s.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-500 cursor-pointer"/>
                    </td>

                    {/* Student Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center">
                          {s.photo ? (
                            <img src={s.photo} alt={s.name} className="w-full h-full object-cover"/>
                          ) : (
                            <span className="text-blue-600 font-bold text-sm">
                              {s.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{s.name}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                        {s.studentId}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-500">{s.email}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{s.phone}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                        {s.className}
                      </span>
                    </td>

                    {/* Attendance */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                          <div
                            className={`h-1.5 rounded-full ${s.attendance >= 85 ? 'bg-green-400' : s.attendance >= 70 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${s.attendance}%` }}></div>
                        </div>
                        <span className={`text-xs font-semibold ${attendanceColor(s.attendance)}`}>
                          {s.attendance}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-400">{s.joinDate}</td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditData(s); setModalOpen(true); }}
                          className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit">
                          <MdEdit className="w-4 h-4"/>
                        </button>
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete">
                          <MdDelete className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <FaUserGraduate className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-400 font-medium">No students found</p>
                <p className="text-gray-300 text-sm mt-1">Try adjusting your search or filters</p>
                <button
                  onClick={() => { setEditData(null); setModalOpen(true); }}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-xl mx-auto hover:bg-blue-600 transition-all">
                  <MdAdd className="w-4 h-4"/>
                  Add First Student
                </button>
              </div>
            )}

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  Showing {filtered.length} of {students.length} students
                </p>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-all">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs">1</button>
                  <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-all">
                    Next
                  </button>
                </div>
              </div>
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
        classes={classOptions}
      />

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdDelete className="w-7 h-7 text-red-500"/>
            </div>
            <h3 className="text-gray-800 font-semibold text-lg mb-2">Delete Student?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will permanently remove the student and all their attendance records.
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

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 transition-all
          ${toast.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-gray-900 text-white'}`}>
          {toast.type === 'error'
            ? <MdClose className="w-4 h-4"/>
            : <MdCheck className="w-4 h-4 text-green-400"/>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}