import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { usePatientFilter } from '../contexts/PatientFilterContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './AllPatientsOverview.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AllPatientsOverview = () => {
  const { currentUser } = useAuth();
  const { selectedPatientId, patients, getSelectedPatient, isAllPatients } = usePatientFilter();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    assessmentsThisMonth: 0,
    activeGoals: 0,
    sessionNotesCount: 0,
  });
  const [assessmentData, setAssessmentData] = useState([]);
  const [romData, setRomData] = useState([]);
  const [goalProgress, setGoalProgress] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadOverviewData();
    }
  }, [currentUser, selectedPatientId]);

  const loadOverviewData = async () => {
    try {
      setLoading(true);

      // Build queries based on patient filter
      const patientFilter = isAllPatients
        ? where('userId', '==', currentUser.uid)
        : where('patientId', '==', selectedPatientId);

      // Load stats
      const patientsQuery = query(
        collection(db, 'patients'),
        where('userId', '==', currentUser.uid)
      );
      const patientsSnapshot = await getDocs(patientsQuery);
      const totalPatients = isAllPatients ? patientsSnapshot.size : 1;

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

      let filteredAssessments = assessmentsSnapshot.docs;
      if (!isAllPatients) {
        filteredAssessments = filteredAssessments.filter(
          doc => doc.data().patientId === selectedPatientId
        );
      }

      const assessmentsThisMonth = filteredAssessments.filter(doc => {
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

      let filteredGoals = goalsSnapshot.docs;
      if (!isAllPatients) {
        filteredGoals = filteredGoals.filter(
          doc => doc.data().patientId === selectedPatientId
        );
      }
      const activeGoals = filteredGoals.length;

      // Load session notes count
      const sessionNotesQuery = query(
        collection(db, 'sessionNotes'),
        where('userId', '==', currentUser.uid)
      );
      const sessionNotesSnapshot = await getDocs(sessionNotesQuery);

      let filteredNotes = sessionNotesSnapshot.docs;
      if (!isAllPatients) {
        filteredNotes = filteredNotes.filter(
          doc => doc.data().patientId === selectedPatientId
        );
      }
      const sessionNotesCount = filteredNotes.length;

      setStats({
        totalPatients,
        assessmentsThisMonth,
        activeGoals,
        sessionNotesCount,
      });

      // Load assessment history for charts
      const assessmentHistory = filteredAssessments
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: new Date(doc.data().createdAt)
        }))
        .sort((a, b) => a.createdAt - b.createdAt);

      setAssessmentData(assessmentHistory);

      // Load ROM data
      const romQuery = query(
        collection(db, 'romAssessments'),
        where('userId', '==', currentUser.uid)
      );
      const romSnapshot = await getDocs(romQuery);

      let filteredRom = romSnapshot.docs;
      if (!isAllPatients) {
        filteredRom = filteredRom.filter(
          doc => doc.data().patientId === selectedPatientId
        );
      }

      const romHistory = filteredRom
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: new Date(doc.data().createdAt)
        }))
        .sort((a, b) => a.createdAt - b.createdAt);

      setRomData(romHistory);

      // Load goal progress
      const goalProgressData = filteredGoals.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoalProgress(goalProgressData);

    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data preparation
  const getAssessmentChartData = () => {
    if (assessmentData.length === 0) return null;

    const labels = assessmentData.map(a =>
      a.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    return {
      labels,
      datasets: [
        {
          label: 'Overall Score',
          data: assessmentData.map(a => a.totalScore || 0),
          borderColor: 'rgb(124, 58, 237)',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const getROMChartData = () => {
    if (romData.length === 0) return null;

    const labels = romData.map(r =>
      r.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    // Calculate average ROM score
    const avgScores = romData.map(r => {
      const measurements = r.measurements || {};
      const values = Object.values(measurements).filter(m => typeof m === 'number');
      return values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Average ROM',
          data: avgScores,
          backgroundColor: 'rgba(236, 72, 153, 0.8)',
        },
      ],
    };
  };

  const getGoalStatusData = () => {
    const statusCounts = goalProgress.reduce((acc, goal) => {
      acc[goal.status] = (acc[goal.status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: ['Active', 'Achieved', 'On Hold'],
      datasets: [
        {
          data: [
            statusCounts.active || 0,
            statusCounts.achieved || 0,
            statusCounts.onHold || 0,
          ],
          backgroundColor: [
            'rgba(124, 58, 237, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ],
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const selectedPatient = getSelectedPatient();
  const pageTitle = isAllPatients
    ? 'All Patients Overview'
    : `${selectedPatient?.firstName} ${selectedPatient?.lastName}`;

  if (loading) {
    return (
      <div className="overview-container">
        <div className="loading-state">Loading overview data...</div>
      </div>
    );
  }

  return (
    <div className="overview-container">
      <div className="overview-content">
        <div className="overview-header">
          <h1>{pageTitle}</h1>
          <p className="overview-subtitle">
            Comprehensive tracking and progress visualization
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.totalPatients}</div>
            <div className="stat-label">
              {isAllPatients ? 'Total Patients' : 'Patient'}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{stats.assessmentsThisMonth}</div>
            <div className="stat-label">Assessments This Month</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats.activeGoals}</div>
            <div className="stat-label">Active Goals</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{stats.sessionNotesCount}</div>
            <div className="stat-label">Session Notes</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Assessment Progress */}
          <div className="chart-card">
            <h3>Assessment Progress</h3>
            {assessmentData.length > 0 ? (
              <div className="chart-container">
                <Line data={getAssessmentChartData()} options={chartOptions} />
              </div>
            ) : (
              <div className="empty-state">
                <p>No assessment data available</p>
                <button
                  className="btn-primary"
                  onClick={() => navigate('/assessments')}
                >
                  Create Assessment
                </button>
              </div>
            )}
          </div>

          {/* ROM Progress */}
          <div className="chart-card">
            <h3>ROM Progress</h3>
            {romData.length > 0 ? (
              <div className="chart-container">
                <Bar data={getROMChartData()} options={chartOptions} />
              </div>
            ) : (
              <div className="empty-state">
                <p>No ROM data available</p>
                <button
                  className="btn-primary"
                  onClick={() => navigate('/rom-progress')}
                >
                  Create ROM Assessment
                </button>
              </div>
            )}
          </div>

          {/* Goal Status */}
          <div className="chart-card">
            <h3>Goal Status Distribution</h3>
            {goalProgress.length > 0 ? (
              <div className="chart-container">
                <Doughnut data={getGoalStatusData()} options={chartOptions} />
              </div>
            ) : (
              <div className="empty-state">
                <p>No goals available</p>
                <button
                  className="btn-primary"
                  onClick={() => navigate('/goals')}
                >
                  Create Goal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button
              className="action-btn"
              onClick={() => navigate('/assessments')}
            >
              <span className="action-icon">📋</span>
              New Assessment
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/rom-progress')}
            >
              <span className="action-icon">📐</span>
              New ROM Assessment
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/goals')}
            >
              <span className="action-icon">🎯</span>
              Manage Goals
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/session-notes')}
            >
              <span className="action-icon">📝</span>
              Add Session Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPatientsOverview;
