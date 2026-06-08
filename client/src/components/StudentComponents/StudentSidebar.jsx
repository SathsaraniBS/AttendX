import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdHistory, MdPerson, MdLogout
} from 'react-icons/md';
import { FaUserGraduate } from 'react-icons/fa';

const navItems = [
  { label: 'Dashboard', icon: MdDashboard, path: '/student-dashboard' },
  { label: 'My Attendance', icon: MdHistory, path: '/student-attendance' },
  { label: 'My Profile', icon: MdPerson, path: '/student-profile' },
];

export default function StudentSidebar({ student, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-[#0f1729] flex flex-col z-50 overflow-y-auto">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <FaUserGraduate className="w-4 h-4 text-white"/>
          </div>
          <div>
            <p className="text-white font-bold text-sm">FRAS</p>
            <p className="text-gray-400 text-xs">Student Portal</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200
                ${active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              <Icon className="w-5 h-5 flex-shrink-0"/>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Student Profile Bottom */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {student?.name?.charAt(0) || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {student?.name || 'Student'}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {student?.studentId || ''}
            </p>
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