import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { usePatientFilter } from '../contexts/PatientFilterContext';
import { Line, Radar } from 'react-chartjs-2';
import './ROMProgressView.css';

const ROMProgressView = () => {
  const { currentUser } = useAuth();
  const { selectedPatientId, patients, getSelectedPatient, isAllPatients } = usePatientFilter();
  const navigate = useNavigate();
  const [romAssessments, setRomAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJoint, setSelectedJoint] = useState('all');

  useEffect(() => {
    if (currentUser) {
      loadROMAssessments();
    }
  }, [currentUser, selectedPatientId]);

  const loadROMAssessments = async () => {
    try {
      setLoading(true);

      const romQuery = query(
        collection(db, 'romAssessments'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(romQuery);

      let romData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt)
      }));

      // Filter by selected patient if not "all"
      if (!isAllPatients) {
        romData = romData.filter(a => a.patientId === selectedPatientId);
      }

      setRomAssessments(romData);
    } catch (error) {
      console.error('Error loading ROM assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  // Get all unique joint measurements across all assessments
  const getAllJoints = () => {
    const joints = new Set();
    romAssessments.forEach(assessment => {
      Object.keys(assessment.measurements || {}).forEach(joint => joints.add(joint));
    });
    return Array.from(joints).sort();
  };

  const getJointProgressData = (patientId, joint) => {
    const patientAssessments = isAllPatients
      ? romAssessments.filter(a => a.patientId === patientId)
      : romAssessments;

    if (patientAssessments.length === 0) return null;

    // Filter assessments that have this joint measurement
    const relevantAssessments = patientAssessments.filter(
      a => a.measurements && a.measurements[joint] !== undefined
    );

    if (relevantAssessments.length === 0) return null;

    const labels = relevantAssessments.map(a =>
      a.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    );

    return {
      labels,
      datasets: [
        {
          label: joint,
          data: relevantAssessments.map(a => a.measurements[joint]),
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          tension: 0.4,
          fill: true,
        }
      ]
    };
  };

  const getAllJointsRadarData = (patientId) => {
    const patientAssessments = isAllPatients
      ? romAssessments.filter(a => a.patientId === patientId)
      : romAssessments;

    if (patientAssessments.length === 0) return null;

    const latestAssessment = patientAssessments[patientAssessments.length - 1];
    const joints = Object.keys(latestAssessment.measurements || {}).sort();

    if (joints.length === 0) return null;

    return {
      labels: joints,
      datasets: [
        {
          label: 'ROM Measurements (degrees)',
          data: joints.map(joint => latestAssessment.measurements[joint]),
          backgroundColor: 'rgba(236, 72, 153, 0.2)',
          borderColor: 'rgb(236, 72, 153)',
          borderWidth: 2,
        }
      ]
    };
  };

  const lineChartOptions = {
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
        max: 180,
        ticks: {
          callback: function(value) {
            return value + '°';
          }
        }
      }
    }
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 180,
        ticks: {
          callback: function(value) {
            return value + '°';
          }
        }
      }
    }
  };

  const handleCreateAssessment = () => {
    if (isAllPatients) {
      alert('Please select a specific patient from the dropdown to create an assessment.');
      return;
    }
    navigate(`/patients/${selectedPatientId}/rom-assessment/new`);
  };

  const selectedPatient = getSelectedPatient();
  const pageTitle = isAllPatients
    ? 'ROM Progress - All Patients'
    : `ROM Progress - ${selectedPatient?.firstName} ${selectedPatient?.lastName}`;

  const allJoints = getAllJoints();
  const patientGroups = isAllPatients
    ? [...new Set(romAssessments.map(a => a.patientId))]
    : [selectedPatientId];

  if (loading) {
    return (
      <div className="rom-progress-container">
        <div className="loading-state">Loading ROM assessments...</div>
      </div>
    );
  }

  return (
    <div className="rom-progress-container">
      <div className="rom-progress-content">
        <div className="rom-progress-header">
          <div>
            <h1>{pageTitle}</h1>
            <p className="rom-progress-subtitle">
              Track range of motion measurements and improvements over time
            </p>
          </div>

          {!isAllPatients && (
            <button className="btn-primary" onClick={handleCreateAssessment}>
              + New ROM Assessment
            </button>
          )}
        </div>

        {romAssessments.length === 0 ? (
          <div className="empty-state-large">
            <div className="empty-icon">📐</div>
            <h3>No ROM assessments found</h3>
            <p>
              {isAllPatients
                ? 'Create your first ROM assessment by selecting a patient from the dropdown above.'
                : 'Get started by creating your first ROM assessment.'}
            </p>
            {!isAllPatients && (
              <button className="btn-primary" onClick={handleCreateAssessment}>
                Create ROM Assessment
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Joint Filter */}
            {allJoints.length > 0 && (
              <div className="joint-filter">
                <label htmlFor="joint-select">View Joint:</label>
                <select
                  id="joint-select"
                  value={selectedJoint}
                  onChange={(e) => setSelectedJoint(e.target.value)}
                  className="joint-select"
                >
                  <option value="all">All Joints Overview</option>
                  {allJoints.map(joint => (
                    <option key={joint} value={joint}>{joint}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="progress-sections">
              {patientGroups.map(patientId => {
                const patientAssessments = isAllPatients
                  ? romAssessments.filter(a => a.patientId === patientId)
                  : romAssessments;

                if (patientAssessments.length === 0) return null;

                return (
                  <div key={patientId} className="patient-progress-section">
                    {isAllPatients && (
                      <h2 className="patient-section-title">
                        {getPatientName(patientId)}
                      </h2>
                    )}

                    {selectedJoint === 'all' ? (
                      <>
                        {/* Radar Chart - Latest Assessment Overview */}
                        <div className="chart-card full-width">
                          <h3>Latest Assessment Overview</h3>
                          <div className="chart-container">
                            {getAllJointsRadarData(patientId) ? (
                              <Radar
                                data={getAllJointsRadarData(patientId)}
                                options={radarChartOptions}
                              />
                            ) : (
                              <div className="empty-state">No measurements available</div>
                            )}
                          </div>
                        </div>

                        {/* All Joints Line Charts */}
                        <div className="joints-grid">
                          {allJoints.map(joint => {
                            const jointData = getJointProgressData(patientId, joint);
                            if (!jointData) return null;

                            return (
                              <div key={joint} className="chart-card">
                                <h3>{joint}</h3>
                                <div className="chart-container-small">
                                  <Line data={jointData} options={lineChartOptions} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      /* Single Joint Detailed View */
                      <div className="chart-card full-width">
                        <h3>{selectedJoint} Progress Over Time</h3>
                        <div className="chart-container">
                          {getJointProgressData(patientId, selectedJoint) ? (
                            <Line
                              data={getJointProgressData(patientId, selectedJoint)}
                              options={lineChartOptions}
                            />
                          ) : (
                            <div className="empty-state">No measurements for this joint</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Latest Measurements Table */}
                    {patientAssessments.length > 0 && (
                      <div className="measurements-card">
                        <h3>Latest Measurements</h3>
                        <div className="measurements-date">
                          {patientAssessments[patientAssessments.length - 1].createdAt.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>

                        <div className="measurements-table">
                          {Object.entries(patientAssessments[patientAssessments.length - 1].measurements || {})
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([joint, value]) => (
                              <div key={joint} className="measurement-row">
                                <span className="measurement-joint">{joint}</span>
                                <span className="measurement-value">{value}°</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ROMProgressView;
