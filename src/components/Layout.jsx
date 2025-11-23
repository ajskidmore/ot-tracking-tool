import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="layout-container">
      <header className="layout-header">
        <div className="header-left">
          <h1 onClick={() => navigate('/dashboard')}>OT Tracking Tool</h1>
          <nav className="nav-links">
            <button
              onClick={() => navigate('/dashboard')}
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/patients')}
              className={`nav-link ${isActive('/patients') ? 'active' : ''}`}
            >
              Patients
            </button>
          </nav>
        </div>
        <div className="user-info">
          <span>Welcome, {userProfile?.displayName || currentUser?.email}!</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
