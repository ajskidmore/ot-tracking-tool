import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { usePatientFilter } from '../contexts/PatientFilterContext';
import './AssessmentsView.css';

const AssessmentsView = () => {
  const { currentUser } = useAuth();
  const { selectedPatientId, patients, getSelectedPatient, isAllPatients } = usePatientFilter();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, program, rom

  useEffect(() => {
    if (currentUser) {
      loadAssessments();
    }
  }, [currentUser, selectedPatientId]);

  const loadAssessments = async () => {
    try {
      setLoading(true);

      // Load program evaluations
      const programQuery = query(
        collection(db, 'assessments'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const programSnapshot = await getDocs(programQuery);

      let programAssessments = programSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'program',
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt)
      }));

      // Load ROM assessments
      const romQuery = query(
        collection(db, 'romAssessments'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const romSnapshot = await getDocs(romQuery);

      let romAssessments = romSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'rom',
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt)
      }));

      // Filter by selected patient if not "all"
      if (!isAllPatients) {
        programAssessments = programAssessments.filter(
          a => a.patientId === selectedPatientId
        );
        romAssessments = romAssessments.filter(
          a => a.patientId === selectedPatientId
        );
      }

      // Combine and sort
      const allAssessments = [...programAssessments, ...romAssessments]
        .sort((a, b) => b.createdAt - a.createdAt);

      setAssessments(allAssessments);
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getFilteredAssessments = () => {
    if (filter === 'all') return assessments;
    return assessments.filter(a => a.type === filter);
  };

  const handleCreateAssessment = (type) => {
    if (isAllPatients) {
      alert('Please select a specific patient from the dropdown to create an assessment.');
      return;
    }

    if (type === 'program') {
      navigate(`/patients/${selectedPatientId}/assessment/new`);
    } else {
      navigate(`/patients/${selectedPatientId}/rom-assessment/new`);
    }
  };

  const handleViewAssessment = (assessment) => {
    if (assessment.type === 'program') {
      navigate(`/patients/${assessment.patientId}/assessment/${assessment.id}`);
    } else {
      navigate(`/patients/${assessment.patientId}/rom-assessment/${assessment.id}`);
    }
  };

  const selectedPatient = getSelectedPatient();
  const pageTitle = isAllPatients
    ? 'All Assessments'
    : `Assessments - ${selectedPatient?.firstName} ${selectedPatient?.lastName}`;

  const filteredAssessments = getFilteredAssessments();

  if (loading) {
    return (
      <div className="assessments-view-container">
        <div className="loading-state">Loading assessments...</div>
      </div>
    );
  }

  return (
    <div className="assessments-view-container">
      <div className="assessments-content">
        <div className="assessments-header">
          <div>
            <h1>{pageTitle}</h1>
            <p className="assessments-subtitle">
              Program Evaluations and ROM Assessments
            </p>
          </div>

          {!isAllPatients && (
            <div className="header-actions">
              <button
                className="btn-primary"
                onClick={() => handleCreateAssessment('program')}
              >
                + New Program Evaluation
              </button>
              <button
                className="btn-secondary"
                onClick={() => handleCreateAssessment('rom')}
              >
                + New ROM Assessment
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Assessments ({assessments.length})
          </button>
          <button
            className={`filter-tab ${filter === 'program' ? 'active' : ''}`}
            onClick={() => setFilter('program')}
          >
            Program Evaluations ({assessments.filter(a => a.type === 'program').length})
          </button>
          <button
            className={`filter-tab ${filter === 'rom' ? 'active' : ''}`}
            onClick={() => setFilter('rom')}
          >
            ROM Assessments ({assessments.filter(a => a.type === 'rom').length})
          </button>
        </div>

        {/* Assessments List */}
        {filteredAssessments.length === 0 ? (
          <div className="empty-state-large">
            <div className="empty-icon">📋</div>
            <h3>No assessments found</h3>
            <p>
              {isAllPatients
                ? 'Create your first assessment by selecting a patient from the dropdown above.'
                : 'Get started by creating your first assessment.'}
            </p>
            {!isAllPatients && (
              <div className="empty-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleCreateAssessment('program')}
                >
                  Create Program Evaluation
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleCreateAssessment('rom')}
                >
                  Create ROM Assessment
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="assessments-grid">
            {filteredAssessments.map(assessment => (
              <div
                key={assessment.id}
                className="assessment-card"
                onClick={() => handleViewAssessment(assessment)}
              >
                <div className="assessment-type-badge">
                  {assessment.type === 'program' ? '📊 Program' : '📐 ROM'}
                </div>

                <div className="assessment-info">
                  {isAllPatients && (
                    <h4 className="patient-name">
                      {getPatientName(assessment.patientId)}
                    </h4>
                  )}

                  <div className="assessment-date">
                    {assessment.createdAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>

                  {assessment.type === 'program' && (
                    <div className="assessment-score">
                      <span className="score-label">Total Score:</span>
                      <span className="score-value">{assessment.totalScore || 0}/68</span>
                    </div>
                  )}

                  {assessment.type === 'rom' && (
                    <div className="assessment-measurements">
                      <span className="measurements-count">
                        {Object.keys(assessment.measurements || {}).length} measurements
                      </span>
                    </div>
                  )}

                  <div className="assessment-status">
                    <span className={`status-badge ${assessment.status}`}>
                      {assessment.status || 'complete'}
                    </span>
                  </div>
                </div>

                <div className="assessment-arrow">→</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentsView;
