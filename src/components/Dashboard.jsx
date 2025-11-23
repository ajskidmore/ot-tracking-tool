import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>OT Tracking Tool</h1>
        <div className="user-info">
          <span>Welcome, {userProfile?.displayName || currentUser?.email}!</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to OT Tracking Tool</h2>
          <p>Your comprehensive solution for tracking occupational therapy assessments and patient progress.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Patients</h3>
            <p>Manage your patient roster</p>
            <div className="card-stat">0</div>
            <p className="card-label">Total Patients</p>
          </div>

          <div className="dashboard-card">
            <h3>Assessments</h3>
            <p>Track Program Evaluations and ROM</p>
            <div className="card-stat">0</div>
            <p className="card-label">Completed This Month</p>
          </div>

          <div className="dashboard-card">
            <h3>Goals</h3>
            <p>Monitor treatment goals</p>
            <div className="card-stat">0</div>
            <p className="card-label">Active Goals</p>
          </div>

          <div className="dashboard-card">
            <h3>Reports</h3>
            <p>Generate progress reports</p>
            <div className="card-stat">-</div>
            <p className="card-label">Coming Soon</p>
          </div>
        </div>

        <div className="info-section">
          <h3>Getting Started</h3>
          <ul>
            <li>Sprint 1: Authentication and basic setup (Current)</li>
            <li>Sprint 2: Patient management system (Next)</li>
            <li>Sprint 3: Program evaluation assessments</li>
            <li>Sprint 4: Progress visualization with charts</li>
          </ul>
          <p className="info-note">
            This is the MVP foundation. More features will be added in upcoming sprints.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
