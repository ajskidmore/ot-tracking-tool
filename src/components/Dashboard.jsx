import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { usePatientFilter } from '../contexts/PatientFilterContext';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { patients } = usePatientFilter();
  const [stats, setStats] = useState({
    totalPatients: 0,
    assessmentsThisMonth: 0,
    activeGoals: 0,
    sessionNotesCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadStats();
    }
  }, [currentUser]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load total patients count
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

      // Load session notes count
      const sessionNotesQuery = query(
        collection(db, 'sessionNotes'),
        where('userId', '==', currentUser.uid)
      );
      const sessionNotesSnapshot = await getDocs(sessionNotesQuery);
      const sessionNotesCount = sessionNotesSnapshot.size;

      setStats({
        totalPatients,
        assessmentsThisMonth,
        activeGoals,
        sessionNotesCount
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
      <main className="dashboard-content">
        <div className="welcome-section">
          <div>
            <h2>Welcome Back, {userProfile?.displayName || 'Therapist'}!</h2>
            <p>Track patient progress, assessments, and therapy goals all in one place.</p>
          </div>
          {patients.length > 0 && (
            <div className="patient-selector">
              <label htmlFor="patient-select">Quick Access:</label>
              <select
                id="patient-select"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    navigate(`/patients/${e.target.value}`);
                  }
                }}
                className="patient-select"
              >
                <option value="">Select a patient...</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Assessments</h3>
            <p>Program Evaluations & ROM</p>
            <div className="card-stat">{loading ? '-' : stats.assessmentsThisMonth}</div>
            <p className="card-label">Completed This Month</p>
          </div>

          <div className="dashboard-card">
            <h3>Goals</h3>
            <p>Treatment objectives</p>
            <div className="card-stat">{loading ? '-' : stats.activeGoals}</div>
            <p className="card-label">Active Goals</p>
          </div>

          <div className="dashboard-card">
            <h3>Session Notes</h3>
            <p>Therapy documentation</p>
            <div className="card-stat">{loading ? '-' : stats.sessionNotesCount}</div>
            <p className="card-label">Total Sessions</p>
          </div>

          <div className="dashboard-card">
            <h3>Total Patients</h3>
            <p>Your patient roster</p>
            <div className="card-stat">{loading ? '-' : stats.totalPatients}</div>
            <p className="card-label">Patients in System</p>
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
            Your comprehensive OT tracking tool is ready! Select a patient from the dropdown above to view their profile, or add a new patient to begin tracking.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
