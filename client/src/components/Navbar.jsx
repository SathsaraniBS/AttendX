import { Link, useLocation } from 'react-router-dom';
import { MdHome, MdAppRegistration } from 'react-icons/md';

function Navbar() {
  const location = useLocation();

  const hideNavbarPaths = [
    '/admin-dashboard',
    '/dashboard',
    '/live',
    '/attendance',
    '/reports',
    '/settings',
    '/classes',
    '/notifications',
    '/backup',
    '/logs',
    '/student-dashboard',
    '/student-attendance',
    '/student-profile',
    '/student-mark-attendance',
  ];

  const isHidden =
    hideNavbarPaths.includes(location.pathname) ||
    location.pathname.startsWith('/students');

  if (isHidden) return null;

  const navLink = (path, Icon, label) => (
    <Link
      to={path}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
        ${location.pathname === path
          ? 'text-cyan-400 border border-cyan-400 bg-cyan-400/10'
          : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10'
        }`}>
      <Icon className="w-4 h-4"/>
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-b-2 border-cyan-400 sticky top-0 z-50 shadow-lg shadow-cyan-400/10">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-cyan-400/20 rounded-xl flex items-center justify-center border border-cyan-400/30">
          <MdHome className="w-5 h-5 text-cyan-400"/>
        </div>
        <span className="text-2xl font-bold text-cyan-400 tracking-widest">AttendX</span>
      </div>

      {/* Nav Links */}
      <div className="flex gap-3">
        {navLink('/', MdHome, 'Home')}
        {navLink('/register', MdAppRegistration, 'Register')}
      </div>
    </nav>
  );
}

export default Navbar;