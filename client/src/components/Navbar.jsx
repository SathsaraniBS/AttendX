import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const hideNavbarPaths = [
    '/admin-dashboard',
    '/live',
    '/attendance',
    '/reports',
    '/settings',
    '/classes',
    '/notifications',
    '/backup',
    '/logs',
  ];

  const isHidden =
    hideNavbarPaths.includes(location.pathname) ||
    location.pathname.startsWith('/students');

  if (isHidden) return null;

  const navLink = (path, icon, label) => (
    <Link
      to={path}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
        ${location.pathname === path
          ? 'text-cyan-400 border border-cyan-400 bg-cyan-400/10'
          : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10'
        }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-b-2 border-cyan-400 sticky top-0 z-50 shadow-lg shadow-cyan-400/10">
      <div className="flex items-center gap-3">
        <span className="text-3xl">👁️</span>
        <span className="text-2xl font-bold text-cyan-400 tracking-widest">AttendX</span>
      </div>
      <div className="flex gap-3">
        {navLink('/', '🏠', 'Home')}
        {navLink('/register', '📝', 'Register')}
      </div>
    </nav>
  );
}

export default Navbar;