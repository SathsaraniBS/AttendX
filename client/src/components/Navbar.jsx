import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">👁️</span>
        <span className="brand-name">AttendX</span>
      </div>
      <ul className="navbar-links">
        <li>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            🏠 Home
          </Link>
        </li>
        <li>
          <Link 
            to="/register" 
            className={location.pathname === '/register' ? 'active' : ''}
          >
            📝 Register
          </Link>
        </li>
        <li>
          <Link 
            to="/reports" 
            className={location.pathname === '/reports' ? 'active' : ''}
          >
            📊 Reports
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;