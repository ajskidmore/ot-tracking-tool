import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    assessmentsThisMonth: 0,
    activeGoals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [currentUser]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load total patients
      const patientsQuery = query(
        collection(db, 'patients'),
        where('userId', '==', currentUser.uid)
      );
      const patientsSnapshot = await getDocs(patientsQuery);
      const totalPatients = patientsSnapshot.size;

      setStats({
        totalPatients,
        assessmentsThisMonth: 0, // Will be populated in Sprint 3
        activeGoals: 0 // Will be populated in Sprint 7
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="header-left">
          <h1>OT Tracking Tool</h1>
          <nav className="nav-links">
            <button onClick={() => navigate('/dashboard')} className="nav-link active">
              Dashboard
            </button>
            <button onClick={() => navigate('/patients')} className="nav-link">
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

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to OT Tracking Tool</h2>
          <p>Your comprehensive solution for tracking occupational therapy assessments and patient progress.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card clickable" onClick={() => navigate('/patients')}>
            <h3>Patients</h3>
            <p>Manage your patient roster</p>
            <div className="card-stat">{loading ? '-' : stats.totalPatients}</div>
            <p className="card-label">Total Patients</p>
          </div>

          <div className="dashboard-card">
            <h3>Assessments</h3>
            <p>Track Program Evaluations and ROM</p>
            <div className="card-stat">{stats.assessmentsThisMonth}</div>
            <p className="card-label">Completed This Month</p>
          </div>

          <div className="dashboard-card">
            <h3>Goals</h3>
            <p>Monitor treatment goals</p>
            <div className="card-stat">{stats.activeGoals}</div>
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
          <h3>Sprint Progress</h3>
          <ul>
            <li>✅ Sprint 1: Authentication and basic setup (Completed)</li>
            <li>✅ Sprint 2: Patient management system (Completed)</li>
            <li>✅ Sprint 3: Program evaluation assessments (Completed)</li>
            <li>⏳ Sprint 4: Progress visualization with charts (Next)</li>
          </ul>
          <p className="info-note">
            You can now add patients and create assessments! Go to any patient profile and click "New Assessment" to get started.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
