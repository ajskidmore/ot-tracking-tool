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

      // Load assessments this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const assessmentsQuery = query(
        collection(db, 'assessments'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'complete')
      );
      const assessmentsSnapshot = await getDocs(assessmentsQuery);
      const assessmentsThisMonth = assessmentsSnapshot.docs.filter(doc => {
        const createdAt = new Date(doc.data().createdAt);
        return createdAt >= firstDayOfMonth;
      }).length;

      // Load active goals
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'active')
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      const activeGoals = goalsSnapshot.size;

      setStats({
        totalPatients,
        assessmentsThisMonth,
        activeGoals
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
          <h3>Application Features</h3>
          <ul>
            <li>✅ Patient Management - Add, edit, and track patient information</li>
            <li>✅ Program Evaluations - 17-question assessments across 4 domains</li>
            <li>✅ ROM Assessments - Comprehensive range of motion tracking</li>
            <li>✅ Progress Visualization - Charts and trends for all assessments</li>
            <li>✅ Goal Tracking - Create and monitor treatment goals</li>
            <li>✅ Session Notes - Document therapy sessions with detailed notes</li>
          </ul>
          <p className="info-note">
            Your comprehensive OT tracking tool is ready! Navigate to Patients to begin managing your caseload.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
