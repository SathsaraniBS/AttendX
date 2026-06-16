import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MdClass, MdPeople, MdBarChart,
  MdMenu, MdAdd, MdSearch, MdEdit, MdDelete,
  MdCalendarToday, MdClose, MdCheck, MdFilterList,
  MdSchool, MdPerson, MdAccessTime, MdRefresh
} from 'react-icons/md';
import AdminSidebar from '../components/AdminComponents/AdminSidebar';

const CLASSES_API  = 'http://localhost:5000/api/classes/';
const STUDENTS_API = 'http://localhost:5000/api/students/';

// ==================== MODAL ====================
function ClassModal({ isOpen, onClose, onSave, editData }) {
  const [form, setForm] = useState({
    name: '', code: '', teacher: '',
    schedule: '', room: '', capacity: 40, status: 'Active'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) setForm(editData);
    else setForm({
      name: '', code: '', teacher: '',
      schedule: '', room: '', capacity: 40, status: 'Active'
    });
  }, [editData, isOpen]);

  const handleSave = async () => {
    if (!form.name || !form.code || !form.teacher) {
      alert('Name, Code, Teacher required!');
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MdClass className="w-5 h-5 text-blue-500"/>
            <h2 className="font-semibold text-gray-800">
              {editData ? 'Edit Class' : 'Add New Class'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <MdClose className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">Class Name *</label>
              <input type="text" placeholder="e.g. BSc IT - Year 1A"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">Class Code *</label>
              <input type="text" placeholder="e.g. BSIT-1A-2024"
                value={form.code}
                onChange={e => setForm({...form, code: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
            </div>
          </div>

          <div>
            <label className="text-gray-700 text-sm font-medium mb-1 block">Teacher / Lecturer *</label>
            <input type="text" placeholder="e.g. Dr. Kasun Perera"
              value={form.teacher}
              onChange={e => setForm({...form, teacher: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">Schedule</label>
              <input type="text" placeholder="e.g. Mon, Wed 09:00 AM"
                value={form.schedule}
                onChange={e => setForm({...form, schedule: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">Room</label>
              <input type="text" placeholder="e.g. Room 101"
                value={form.room}
                onChange={e => setForm({...form, room: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">Capacity</label>
              <input type="number" placeholder="e.g. 40"
                value={form.capacity}
                onChange={e => setForm({...form, capacity: parseInt(e.target.value) || 40})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">Status</label>
              <select value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white">
                <option>Active</option>
                <option>Inactive</option>
                <option>On Break</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2">
            {saving
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Saving...</>
              : <><MdCheck className="w-4 h-4"/> {editData ? 'Update Class' : 'Add Class'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== CLASSES PAGE ====================
export default function Classes() {
  const navigate = useNavigate();
  const [user, setUser]                 = useState(null);
  const [classes, setClasses]           = useState([]);
  const [students, setStudents]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modalOpen, setModalOpen]       = useState(false);
  const [editData, setEditData]         = useState(null);
  const [deleteId, setDeleteId]         = useState(null);
  const [view, setView]                 = useState('grid');
  const [toast, setToast]               = useState(null);

  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    try {
      if (userData && userData !== 'undefined') setUser(JSON.parse(userData));
    } catch { navigate('/'); }

    localStorage.removeItem('attendx_classes');
    fetchAll();
  }, [navigate]);

  // ✅ Classes + Students parallel fetch
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [classRes, studentRes] = await Promise.all([
        axios.get(CLASSES_API,  { headers, timeout: 5000 }),
        axios.get(STUDENTS_API, { headers, timeout: 5000 }),
      ]);

      const classData   = classRes.data   || [];
      const studentData = studentRes.data || [];

      setStudents(studentData);

      // ✅ Use attendance directly from backend (already calculated from attendance table)
      // enrolled count is also from backend — just add student avatars from studentData
      const enriched = classData.map(cls => ({
        ...cls,
        // attendance & enrolled already come correctly from classes.py SQL
        // we only need studentData here for the avatar preview
      }));

      setClasses(enriched);
      // ✅ Save to localStorage for StudentList class dropdown
      localStorage.setItem('attendx_classes', JSON.stringify(enriched));
      console.log(`✅ Loaded ${enriched.length} classes, ${studentData.length} students`);

    } catch (err) {
      console.error('❌ Fetch error:', err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = classes.filter(c => {
    const matchSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ✅ Add / Edit
  const handleSave = async (form) => {
    try {
      const token   = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editData) {
        await axios.put(`${CLASSES_API}${editData.id}`, form, { headers });
        showToast('Class updated successfully!');
      } else {
        await axios.post(CLASSES_API, form, { headers });
        showToast('Class added successfully!');
      }
      await fetchAll();
    } catch (err) {
      console.error('Save error:', err);
      showToast('Something went wrong!', 'error');
    }
    setModalOpen(false);
    setEditData(null);
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${CLASSES_API}${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Class deleted!');
      await fetchAll();
    } catch {
      showToast('Delete failed!', 'error');
    }
    setDeleteId(null);
  };

  // ✅ Stats from backend data (attendance already real from SQL)
  const totalEnrolled = students.length;
  const avgAttendance = classes.length > 0
    ? Math.round(classes.reduce((a, c) => a + (c.attendance || 0), 0) / classes.length)
    : 0;

  const stats = [
    { label: 'Total Classes',  value: classes.length,                                    icon: MdClass,    color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Active Classes', value: classes.filter(c => c.status === 'Active').length, icon: MdCheck,    color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Total Students', value: totalEnrolled,                                     icon: MdPeople,   color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg Attendance (Active Classes)', value: `${avgAttendance}%`,                               icon: MdBarChart, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const statusColor = (s) => {
    if (s === 'Active')   return 'bg-green-50 text-green-600 border-green-100';
    if (s === 'On Break') return 'bg-yellow-50 text-yellow-600 border-yellow-100';
    return 'bg-red-50 text-red-500 border-red-100';
  };

  const attendanceColor = (r) => {
    if (r >= 85) return 'bg-green-500';
    if (r >= 70) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} onLogout={handleLogout}/>

      <div className="flex-1 ml-56">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <MdMenu className="w-5 h-5 text-gray-400"/>
            <h1 className="text-lg font-semibold text-gray-800">Classes</h1>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {classes.length} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll}
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
              <div className="relative flex-1 min-w-48">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input type="text" placeholder="Search classes, teachers..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
              </div>

              <div className="flex items-center gap-2">
                <MdFilterList className="w-4 h-4 text-gray-400"/>
                {['All', 'Active', 'Inactive', 'On Break'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${filterStatus === s ? 'bg-blue-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setView('grid')}
                  className={`px-3 py-2 text-xs transition-all ${view === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  Grid
                </button>
                <button onClick={() => setView('table')}
                  className={`px-3 py-2 text-xs transition-all ${view === 'table' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  Table
                </button>
              </div>

              <button onClick={() => { setEditData(null); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all ml-auto">
                <MdAdd className="w-4 h-4"/> Add Class
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"/>
            </div>
          )}

          {/* GRID VIEW */}
          {!loading && view === 'grid' && (
            <div className="grid grid-cols-3 gap-5">
              {filtered.map(cls => {
                // Student avatars only — attendance comes from backend
                const classStudents = students.filter(s => s.className === cls.name);
                return (
                  <div key={cls.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-bold text-base">{cls.name}</h3>
                          <p className="text-blue-100 text-xs mt-0.5">{cls.code}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium bg-white ${statusColor(cls.status)}`}>
                          {cls.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MdPerson className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                        <span className="truncate">{cls.teacher}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MdAccessTime className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                        <span className="truncate">{cls.schedule || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MdSchool className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                        <span>{cls.room || '—'}</span>
                      </div>

                      {/* Enrolled — from backend SQL (COUNT DISTINCT) */}
                      <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                        <span>Enrolled: {cls.enrolled || 0}/{cls.capacity || 0}</span>
                        <span className="font-medium text-blue-500">
                          {cls.capacity ? Math.round(((cls.enrolled || 0) / cls.capacity) * 100) : 0}% full
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full">
                        <div className="h-1.5 bg-blue-400 rounded-full transition-all"
                          style={{ width: `${cls.capacity ? Math.min(((cls.enrolled || 0) / cls.capacity) * 100, 100) : 0}%` }}/>
                      </div>

                      {/* ✅ Avg Attendance — real % from attendance table via backend */}
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Avg Attendance</span>
                        <span className={`font-bold ${cls.attendance >= 85 ? 'text-green-600' : cls.attendance >= 70 ? 'text-yellow-600' : 'text-gray-400'}`}>
                          {cls.attendance || 0}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full">
                        <div className={`h-1.5 rounded-full ${attendanceColor(cls.attendance || 0)}`}
                          style={{ width: `${cls.attendance || 0}%` }}/>
                      </div>

                      {/* Student avatars preview */}
                      {classStudents.length > 0 && (
                        <div className="flex items-center gap-1 pt-1">
                          {classStudents.slice(0, 5).map((s, i) => (
                            <div key={i}
                              className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 text-xs font-bold -ml-1 first:ml-0">
                              {s.name?.charAt(0)}
                            </div>
                          ))}
                          {classStudents.length > 5 && (
                            <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-500 text-xs font-bold -ml-1">
                              +{classStudents.length - 5}
                            </div>
                          )}
                          <span className="text-xs text-gray-400 ml-1">
                            {classStudents.length} students
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex border-t border-gray-100">
                      <button onClick={() => { setEditData(cls); setModalOpen(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-blue-500 hover:bg-blue-50 transition-all font-medium">
                        <MdEdit className="w-4 h-4"/> Edit
                      </button>
                      <div className="w-px bg-gray-100"/>
                      <button onClick={() => setDeleteId(cls.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-red-400 hover:bg-red-50 transition-all font-medium">
                        <MdDelete className="w-4 h-4"/> Delete
                      </button>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-16 text-center">
                  <MdClass className="w-16 h-16 text-gray-200 mx-auto mb-4"/>
                  <p className="text-gray-400 font-medium">No classes found</p>
                  <p className="text-gray-300 text-sm mt-1">
                    {classes.length === 0 ? 'Add your first class!' : 'Try adjusting your search'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TABLE VIEW */}
          {!loading && view === 'table' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Class', 'Code', 'Teacher', 'Schedule', 'Room', 'Enrolled', 'Attendance', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cls, i) => (
                    <tr key={cls.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-all ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <MdClass className="w-4 h-4 text-blue-600"/>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{cls.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{cls.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cls.teacher}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{cls.schedule || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{cls.room || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-gray-700">
                          {cls.enrolled || 0}
                          <span className="text-gray-400">/{cls.capacity || 0}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                            <div className={`h-1.5 rounded-full ${attendanceColor(cls.attendance || 0)}`}
                              style={{ width: `${cls.attendance || 0}%` }}/>
                          </div>
                          <span className={`text-xs font-medium ${cls.attendance >= 85 ? 'text-green-600' : cls.attendance >= 70 ? 'text-yellow-600' : 'text-gray-400'}`}>
                            {cls.attendance || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(cls.status)}`}>
                          {cls.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditData(cls); setModalOpen(true); }}
                            className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg transition-all">
                            <MdEdit className="w-4 h-4"/>
                          </button>
                          <button onClick={() => setDeleteId(cls.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                            <MdDelete className="w-4 h-4"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <MdClass className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                  <p className="text-gray-400 text-sm">No classes found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ClassModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
        editData={editData}
      />

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdDelete className="w-7 h-7 text-red-500"/>
            </div>
            <h3 className="text-gray-800 font-semibold text-lg mb-2">Delete Class?</h3>
            <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-500 text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-xl">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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