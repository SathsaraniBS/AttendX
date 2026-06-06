import { Link, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdPeople, MdClass, MdSettings,
  MdNotifications, MdBackup, MdAssignment,
  MdVisibility, MdHistory, MdBarChart,
  MdLogout, MdPerson
} from 'react-icons/md';
import { FaCamera } from 'react-icons/fa';

// ==================== NAV ITEMS ====================
const mainNavItems = [
  { path: '/live', icon: FaCamera, label: 'Live Attendance' },
  { path: '/attendance', icon: MdHistory, label: 'Attendance History' },
  { path: '/students', icon: MdPeople, label: 'Students' },
  { path: '/classes', icon: MdClass, label: 'Classes' },
  { path: '/reports', icon: MdBarChart, label: 'Attendance Reports' },
];

const settingsNavItems = [
  { path: '/settings', icon: MdSettings, label: 'System Settings' },
  { path: '/notifications', icon: MdNotifications, label: 'Notification' },
  { path: '/backup', icon: MdBackup, label: 'Backup' },
  { path: '/logs', icon: MdAssignment, label: 'Activity Logs' },
];

// ==================== SIDEBAR COMPONENT ====================
function AdminSidebar({ user, onLogout }) {
  const location = useLocation();

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active =
      location.pathname === item.path ||
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

      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <MdVisibility className="w-5 h-5 text-white"/>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">FRAS</p>
            <p className="text-gray-400 text-xs leading-tight">Face Recognition</p>
            <p className="text-gray-400 text-xs leading-tight">Attendance System</p>
          </div>
        </div>
      </div>

      {/* Dashboard Link */}
      <div className="mt-3">
        <Link to="/admin-dashboard"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-all text-sm
            ${location.pathname === '/admin-dashboard' || location.pathname === '/dashboard'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
          <MdDashboard className="w-5 h-5 flex-shrink-0"/>
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Main Section */}
      <div className="px-4 pt-4 pb-1">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Main</p>
      </div>
      <nav className="space-y-0.5 pb-2">
        {mainNavItems.map(item => <NavItem key={item.path} item={item}/>)}
      </nav>

      {/* Settings Section */}
      <div className="px-4 pt-4 pb-1">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Settings</p>
      </div>
      <nav className="space-y-0.5 pb-2">
        {settingsNavItems.map(item => <NavItem key={item.path} item={item}/>)}
      </nav>

      {/* Admin Profile */}
      <div className="mt-auto border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.name || 'Admin'}
            </p>
            <p className="text-gray-400 text-xs truncate">System Administrator</p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="text-gray-400 hover:text-red-400 transition-all">
            <MdLogout className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;