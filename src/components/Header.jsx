import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { usePatientFilter } from '../contexts/PatientFilterContext';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPatientId, selectPatient, patients, refreshPatients } = usePatientFilter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    diagnosis: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [currentPatient, setCurrentPatient] = useState(null);
  const [assessmentCounts, setAssessmentCounts] = useState({ assessments: 0, romAssessments: 0, goals: 0 });

  // Check if we're on a patient profile page
  const patientIdMatch = location.pathname.match(/^\/patients\/([^/]+)/);
  const currentPatientId = patientIdMatch ? patientIdMatch[1] : null;

  useEffect(() => {
    if (currentPatientId && currentUser) {
      loadPatientData(currentPatientId);
    } else {
      setCurrentPatient(null);
    }
  }, [currentPatientId, currentUser]);

  const loadPatientData = async (patientId) => {
    try {
      // Load patient info
      const patientDoc = await getDoc(doc(db, 'patients', patientId));
      if (patientDoc.exists()) {
        setCurrentPatient({ id: patientDoc.id, ...patientDoc.data() });
      }

      // Load assessment counts
      const assessmentsQuery = query(
        collection(db, 'assessments'),
        where('patientId', '==', patientId),
        where('userId', '==', currentUser.uid)
      );
      const assessmentsSnapshot = await getDocs(assessmentsQuery);

      const romQuery = query(
        collection(db, 'romAssessments'),
        where('patientId', '==', patientId),
        where('userId', '==', currentUser.uid)
      );
      const romSnapshot = await getDocs(romQuery);

      const goalsQuery = query(
        collection(db, 'goals'),
        where('patientId', '==', patientId),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'active')
      );
      const goalsSnapshot = await getDocs(goalsQuery);

      setAssessmentCounts({
        assessments: assessmentsSnapshot.size,
        romAssessments: romSnapshot.size,
        goals: goalsSnapshot.size
      });
    } catch (err) {
      console.error('Error loading patient data:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handlePatientChange = (e) => {
    const value = e.target.value;

    if (value === 'add-new') {
      setShowAddModal(true);
      return;
    }

    if (value !== 'all') {
      // Navigate to the patient profile
      navigate(`/patients/${value}`);
    } else {
      // Navigate to dashboard when "All Patients" selected
      navigate('/dashboard');
    }
    selectPatient(value);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError('');
      const docRef = await addDoc(collection(db, 'patients'), {
        ...formData,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        diagnosis: '',
        notes: ''
      });

      // Refresh patients list
      await refreshPatients();

      // Navigate to the new patient
      navigate(`/patients/${docRef.id}`);
      selectPatient(docRef.id);
    } catch (err) {
      console.error('Error adding patient:', err);
      setError('Failed to add patient');
    }
  };

  // Don't show header on login/register pages
  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  const isPatientProfilePage = currentPatientId && location.pathname === `/patients/${currentPatientId}`;
  const isGoalsPage = location.pathname.includes('/goals');
  const isSessionNotesPage = location.pathname.includes('/session-notes');

  // Get current active tab from URL hash
  const currentHash = location.hash.slice(1);
  const activeTab = currentHash || 'overview';

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <Link to="/dashboard" className="logo-link">
            <div className="logo">
              <img src="/favicon.svg" alt="OT Tracking Logo" width="32" height="32" />
              <span className="logo-text">OT Tracking</span>
            </div>
          </Link>

          {currentUser && (
            <div className="header-right">
              {/* Patient Selector with Add Patient */}
              <select
                value={selectedPatientId}
                onChange={handlePatientChange}
                className="patient-selector-header"
              >
                <option value="all">All Patients</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
                <option value="add-new" className="add-patient-option">+ Add New Patient</option>
              </select>

              {/* Patient Profile Navigation Tabs - In same row */}
              {currentPatient && currentPatientId && (
                <div className="patient-nav-tabs-inline">
                  <button
                    className={`patient-nav-tab ${isPatientProfilePage && activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => {
                      if (location.pathname === `/patients/${currentPatientId}`) {
                        window.location.hash = '';
                      } else {
                        navigate(`/patients/${currentPatientId}`);
                      }
                    }}
                  >
                    Overview
                  </button>
                  <button
                    className={`patient-nav-tab ${isPatientProfilePage && activeTab === 'assessments' ? 'active' : ''}`}
                    onClick={() => {
                      if (location.pathname === `/patients/${currentPatientId}`) {
                        window.location.hash = 'assessments';
                      } else {
                        navigate(`/patients/${currentPatientId}#assessments`);
                      }
                    }}
                  >
                    Assessments ({assessmentCounts.assessments + assessmentCounts.romAssessments})
                  </button>
                  <button
                    className={`patient-nav-tab ${isPatientProfilePage && activeTab === 'progress' ? 'active' : ''}`}
                    onClick={() => {
                      if (location.pathname === `/patients/${currentPatientId}`) {
                        window.location.hash = 'progress';
                      } else {
                        navigate(`/patients/${currentPatientId}#progress`);
                      }
                    }}
                  >
                    Program Progress
                  </button>
                  <button
                    className={`patient-nav-tab ${isPatientProfilePage && activeTab === 'rom-progress' ? 'active' : ''}`}
                    onClick={() => {
                      if (location.pathname === `/patients/${currentPatientId}`) {
                        window.location.hash = 'rom-progress';
                      } else {
                        navigate(`/patients/${currentPatientId}#rom-progress`);
                      }
                    }}
                  >
                    ROM Progress
                  </button>
                  <button
                    className={`patient-nav-tab ${isGoalsPage ? 'active' : ''}`}
                    onClick={() => navigate(`/patients/${currentPatientId}/goals`)}
                  >
                    Goals ({assessmentCounts.goals})
                  </button>
                  <button
                    className={`patient-nav-tab ${isSessionNotesPage ? 'active' : ''}`}
                    onClick={() => navigate(`/patients/${currentPatientId}/session-notes`)}
                  >
                    Session Notes
                  </button>
                </div>
              )}

              <button onClick={handleLogout} className="logout-button">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Patient</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleAddPatient}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
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
                  <label htmlFor="lastName">Last Name *</label>
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
                <label htmlFor="dateOfBirth">Date of Birth *</label>
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
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  placeholder="e.g., Cerebral Palsy, Autism Spectrum Disorder"
                />
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Any additional information..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
