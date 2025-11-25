import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { usePatientFilter } from '../contexts/PatientFilterContext';
import { Line } from 'react-chartjs-2';
import './ProgramProgressView.css';

const ProgramProgressView = () => {
  const { currentUser } = useAuth();
  const { selectedPatientId, patients, getSelectedPatient, isAllPatients } = usePatientFilter();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadProgramAssessments();
    }
  }, [currentUser, selectedPatientId]);

  const loadProgramAssessments = async () => {
    try {
      setLoading(true);

      const assessmentsQuery = query(
        collection(db, 'assessments'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'complete'),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(assessmentsQuery);

      let assessmentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt)
      }));

      // Filter by selected patient if not "all"
      if (!isAllPatients) {
        assessmentData = assessmentData.filter(
          a => a.patientId === selectedPatientId
        );
      }

      setAssessments(assessmentData);
    } catch (error) {
      console.error('Error loading program assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getDomainScores = (assessment) => {
    const domains = {
      selfCare: { questions: [1, 2, 3, 4], max: 16 },
      productivity: { questions: [5, 6, 7, 8, 9], max: 20 },
      leisure: { questions: [10, 11, 12, 13], max: 16 },
      social: { questions: [14, 15, 16, 17], max: 16 }
    };

    const scores = {};
    Object.entries(domains).forEach(([domain, { questions, max }]) => {
      const score = questions.reduce((sum, q) => {
        return sum + (assessment.responses?.[`q${q}`] || 0);
      }, 0);
      scores[domain] = { score, max, percentage: Math.round((score / max) * 100) };
    });

    return scores;
  };

  const getChartDataForPatient = (patientId) => {
    const patientAssessments = isAllPatients
      ? assessments.filter(a => a.patientId === patientId)
      : assessments;

    if (patientAssessments.length === 0) return null;

    const labels = patientAssessments.map(a =>
      a.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    );

    const datasets = [
      {
        label: 'Self-Care',
        data: patientAssessments.map(a => getDomainScores(a).selfCare.percentage),
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Productivity',
        data: patientAssessments.map(a => getDomainScores(a).productivity.percentage),
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Leisure',
        data: patientAssessments.map(a => getDomainScores(a).leisure.percentage),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Social Participation',
        data: patientAssessments.map(a => getDomainScores(a).social.percentage),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      }
    ];

    return { labels, datasets };
  };

  const getTotalScoreChartData = (patientId) => {
    const patientAssessments = isAllPatients
      ? assessments.filter(a => a.patientId === patientId)
      : assessments;

    if (patientAssessments.length === 0) return null;

    const labels = patientAssessments.map(a =>
      a.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    );

    return {
      labels,
      datasets: [
        {
          label: 'Total Score',
          data: patientAssessments.map(a => a.totalScore || 0),
          borderColor: 'rgb(124, 58, 237)',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          tension: 0.4,
          fill: true,
        }
      ]
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
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  const totalScoreOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 68,
      }
    }
  };

  const handleCreateAssessment = () => {
    if (isAllPatients) {
      alert('Please select a specific patient from the dropdown to create an assessment.');
      return;
    }
    navigate(`/patients/${selectedPatientId}/assessment/new`);
  };

  const selectedPatient = getSelectedPatient();
  const pageTitle = isAllPatients
    ? 'Program Progress - All Patients'
    : `Program Progress - ${selectedPatient?.firstName} ${selectedPatient?.lastName}`;

  if (loading) {
    return (
      <div className="program-progress-container">
        <div className="loading-state">Loading program assessments...</div>
      </div>
    );
  }

  // Group assessments by patient if viewing all patients
  const patientGroups = isAllPatients
    ? [...new Set(assessments.map(a => a.patientId))]
    : [selectedPatientId];

  return (
    <div className="program-progress-container">
      <div className="program-progress-content">
        <div className="program-progress-header">
          <div>
            <h1>{pageTitle}</h1>
            <p className="program-progress-subtitle">
              Track performance across Self-Care, Productivity, Leisure, and Social Participation domains
            </p>
          </div>

          {!isAllPatients && (
            <button className="btn-primary" onClick={handleCreateAssessment}>
              + New Program Evaluation
            </button>
          )}
        </div>

        {assessments.length === 0 ? (
          <div className="empty-state-large">
            <div className="empty-icon">📊</div>
            <h3>No program evaluations found</h3>
            <p>
              {isAllPatients
                ? 'Create your first program evaluation by selecting a patient from the dropdown above.'
                : 'Get started by creating your first program evaluation.'}
            </p>
            {!isAllPatients && (
              <button className="btn-primary" onClick={handleCreateAssessment}>
                Create Program Evaluation
              </button>
            )}
          </div>
        ) : (
          <div className="progress-sections">
            {patientGroups.map(patientId => {
              const chartData = getChartDataForPatient(patientId);
              const totalScoreData = getTotalScoreChartData(patientId);
              const patientAssessments = isAllPatients
                ? assessments.filter(a => a.patientId === patientId)
                : assessments;

              if (!chartData) return null;

              return (
                <div key={patientId} className="patient-progress-section">
                  {isAllPatients && (
                    <h2 className="patient-section-title">
                      {getPatientName(patientId)}
                    </h2>
                  )}

                  <div className="charts-row">
                    {/* Domain Progress Chart */}
                    <div className="chart-card">
                      <h3>Domain Progress Over Time</h3>
                      <div className="chart-container">
                        <Line data={chartData} options={chartOptions} />
                      </div>
                    </div>

                    {/* Total Score Chart */}
                    <div className="chart-card">
                      <h3>Total Score Trend</h3>
                      <div className="chart-container">
                        <Line data={totalScoreData} options={totalScoreOptions} />
                      </div>
                    </div>
                  </div>

                  {/* Latest Assessment Summary */}
                  {patientAssessments.length > 0 && (
                    <div className="latest-assessment-card">
                      <h3>Latest Assessment Summary</h3>
                      <div className="assessment-date">
                        {patientAssessments[patientAssessments.length - 1].createdAt.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>

                      <div className="domains-grid">
                        {Object.entries(getDomainScores(patientAssessments[patientAssessments.length - 1])).map(([domain, data]) => (
                          <div key={domain} className="domain-card">
                            <div className="domain-name">
                              {domain === 'selfCare' ? 'Self-Care' :
                               domain === 'productivity' ? 'Productivity' :
                               domain === 'leisure' ? 'Leisure' :
                               'Social Participation'}
                            </div>
                            <div className="domain-score">
                              {data.score}/{data.max}
                            </div>
                            <div className="domain-bar">
                              <div
                                className="domain-bar-fill"
                                style={{ width: `${data.percentage}%` }}
                              />
                            </div>
                            <div className="domain-percentage">{data.percentage}%</div>
                          </div>
                        ))}
                      </div>

                      <div className="total-score-summary">
                        <span className="total-label">Total Score:</span>
                        <span className="total-value">
                          {patientAssessments[patientAssessments.length - 1].totalScore || 0}/68
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramProgressView;
