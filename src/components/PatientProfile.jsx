import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { domainNames } from '../data/assessmentQuestions';
import ProgressCharts from './ProgressCharts';
import ROMProgressCharts from './ROMProgressCharts';
import './PatientProfile.css';

const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [romAssessments, setRomAssessments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'assessments', 'progress'

  useEffect(() => {
    loadPatient();
    loadAssessments();
    loadROMAssessments();
    loadGoals();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'patients', patientId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const patientData = { id: docSnap.id, ...docSnap.data() };

        // Security check: ensure this patient belongs to the current user
        if (patientData.userId !== currentUser.uid) {
          navigate('/patients');
          return;
        }

        setPatient(patientData);
        setFormData(patientData);
      } else {
        setError('Patient not found');
        navigate('/patients');
      }
    } catch (err) {
      console.error('Error loading patient:', err);
      setError('Failed to load patient');
    } finally {
      setLoading(false);
    }
  };

  const loadAssessments = async () => {
    try {
      const q = query(
        collection(db, 'assessments'),
        where('patientId', '==', patientId),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const assessmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssessments(assessmentsData);
    } catch (err) {
      console.error('Error loading assessments:', err);
    }
  };

  const loadROMAssessments = async () => {
    try {
      const q = query(
        collection(db, 'romAssessments'),
        where('patientId', '==', patientId),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const romData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRomAssessments(romData);
    } catch (err) {
      console.error('Error loading ROM assessments:', err);
    }
  };

  const loadGoals = async () => {
    try {
      const q = query(
        collection(db, 'goals'),
        where('patientId', '==', patientId),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const goalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoals(goalsData);
    } catch (err) {
      console.error('Error loading goals:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    try {
      setError('');
      const docRef = doc(db, 'patients', patientId);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });

      setPatient({ ...formData, id: patientId });
      setEditing(false);
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Failed to update patient');
    }
  };

  const handleCancelEdit = () => {
    setFormData(patient);
    setEditing(false);
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  if (loading) {
    return <div className="loading">Loading patient...</div>;
  }

  if (!patient) {
    return <div className="error-message">Patient not found</div>;
  }

  return (
    <div className="patient-profile-container">
      <div className="profile-header">
        <button className="btn-back" onClick={() => navigate('/patients')}>
          ← Back to Patients
        </button>
        <div className="profile-header-actions">
          {!editing ? (
            <button className="btn-primary" onClick={() => setEditing(true)}>
              Edit Patient
            </button>
          ) : (
            <>
              <button className="btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveChanges}>
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="profile-content">
        <div className="profile-card">
          <h1>{patient.firstName} {patient.lastName}</h1>

          {!editing ? (
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Age:</span>
                <span className="info-value">{calculateAge(patient.dateOfBirth)} years old</span>
              </div>
              <div className="info-row">
                <span className="info-label">Date of Birth:</span>
                <span className="info-value">{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
              </div>
              {patient.diagnosis && (
                <div className="info-row">
                  <span className="info-label">Diagnosis:</span>
                  <span className="info-value">{patient.diagnosis}</span>
                </div>
              )}
              {patient.notes && (
                <div className="info-row">
                  <span className="info-label">Notes:</span>
                  <span className="info-value">{patient.notes}</span>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveChanges} className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="diagnosis">Diagnosis</label>
                <input
                  type="text"
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
            </form>
          )}
        </div>

        <div className="profile-tabs">
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === 'assessments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assessments')}
            >
              Assessments ({assessments.length})
            </button>
            <button
              className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              Program Progress
            </button>
            <button
              className={`tab-button ${activeTab === 'rom-progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('rom-progress')}
            >
              ROM Progress
            </button>
            <button
              className={`tab-button ${activeTab === 'goals' ? 'active' : ''}`}
              onClick={() => navigate(`/patients/${patientId}/goals`)}
            >
              Goals ({goals.filter(g => g.status === 'active').length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="profile-sections">
                <div className="section-card">
                  <h2>Quick Stats</h2>
                  <div className="quick-stats">
                    <div className="quick-stat">
                      <div className="quick-stat-number">{assessments.length}</div>
                      <div className="quick-stat-label">Program Evals</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-number">{romAssessments.length}</div>
                      <div className="quick-stat-label">ROM Assessments</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-number">{assessments.filter(a => a.status === 'complete').length + romAssessments.filter(r => r.status === 'complete').length}</div>
                      <div className="quick-stat-label">Completed</div>
                    </div>
                    <div className="quick-stat" style={{ cursor: 'pointer' }} onClick={() => navigate(`/patients/${patientId}/goals`)}>
                      <div className="quick-stat-number">{goals.filter(g => g.status === 'active').length}</div>
                      <div className="quick-stat-label">Active Goals</div>
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <h2>Recent Activity</h2>
                  {assessments.length === 0 && romAssessments.length === 0 ? (
                    <p className="section-placeholder">No activity yet.</p>
                  ) : (
                    <div className="recent-activity">
                      {[...assessments.map(a => ({ ...a, assessmentType: 'program' })),
                        ...romAssessments.map(r => ({ ...r, assessmentType: 'rom' }))]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5)
                        .map(assessment => (
                        <div key={assessment.id} className="activity-item">
                          <span className={`type-badge ${assessment.type}`}>
                            {assessment.assessmentType === 'rom' ? 'ROM' : assessment.type === 'pre' ? 'Pre' : 'Post'}
                          </span>
                          <span className="activity-text">
                            {assessment.assessmentType === 'rom' ? 'ROM Assessment' : 'Program Evaluation'} {assessment.status === 'complete' ? 'completed' : 'saved as draft'}
                          </span>
                          <span className="activity-date">
                            {new Date(assessment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'assessments' && (
              <div className="section-card section-card-full">
                <div className="section-header">
                  <h2>Assessments</h2>
                  <div className="assessment-buttons">
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/patients/${patientId}/assessment/new`)}
                    >
                      + Program Evaluation
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/patients/${patientId}/rom-assessment/new`)}
                    >
                      + ROM Assessment
                    </button>
                  </div>
                </div>
                {assessments.length === 0 && romAssessments.length === 0 ? (
                  <p className="section-placeholder">No assessments yet. Click a button above to get started.</p>
                ) : (
                  <div className="assessments-list">
                    {/* Program Evaluations */}
                    {assessments.map(assessment => (
                      <div key={`prog-${assessment.id}`} className="assessment-item">
                        <div className="assessment-info">
                          <div className="assessment-type">
                            <span className="assessment-category">Program Evaluation</span>
                            <span className={`type-badge ${assessment.type}`}>
                              {assessment.type === 'pre' ? 'Pre-Assessment' : 'Post-Assessment'}
                            </span>
                            <span className={`status-badge ${assessment.status}`}>
                              {assessment.status === 'complete' ? 'Complete' : 'Draft'}
                            </span>
                          </div>
                          <div className="assessment-date">
                            {new Date(assessment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {assessment.status === 'complete' && assessment.domainAverages && (
                          <div className="domain-averages">
                            {Object.entries(assessment.domainAverages).map(([domain, avg]) => (
                              avg && (
                                <div key={domain} className="domain-avg">
                                  <span className="domain-name">{domainNames[domain]}:</span>
                                  <span className="domain-value">{avg}</span>
                                </div>
                              )
                            ))}
                          </div>
                        )}
                        <button
                          className="btn-view-assessment"
                          onClick={() => navigate(`/patients/${patientId}/assessment/${assessment.id}`)}
                        >
                          {assessment.status === 'complete' ? 'View' : 'Continue'}
                        </button>
                      </div>
                    ))}

                    {/* ROM Assessments */}
                    {romAssessments.map(romAssessment => (
                      <div key={`rom-${romAssessment.id}`} className="assessment-item">
                        <div className="assessment-info">
                          <div className="assessment-type">
                            <span className="assessment-category">ROM Assessment</span>
                            <span className={`type-badge ${romAssessment.type}`}>
                              {romAssessment.type === 'pre' ? 'Pre-Assessment' : 'Post-Assessment'}
                            </span>
                            <span className={`status-badge ${romAssessment.status}`}>
                              {romAssessment.status === 'complete' ? 'Complete' : 'Draft'}
                            </span>
                          </div>
                          <div className="assessment-date">
                            {new Date(romAssessment.createdAt).toLocaleDateString()}
                          </div>
                          {romAssessment.selectedRegions && romAssessment.selectedRegions.length > 0 && (
                            <div className="rom-regions">
                              Regions: {romAssessment.selectedRegions.join(', ')}
                            </div>
                          )}
                        </div>
                        <button
                          className="btn-view-assessment"
                          onClick={() => navigate(`/patients/${patientId}/rom-assessment/${romAssessment.id}`)}
                        >
                          {romAssessment.status === 'complete' ? 'View' : 'Continue'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <ProgressCharts assessments={assessments} />
            )}

            {activeTab === 'rom-progress' && (
              <ROMProgressCharts romAssessments={romAssessments} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
