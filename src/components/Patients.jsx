import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Patients.css';

const Patients = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    diagnosis: '',
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
  }, [currentUser]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'patients'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientsData);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
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
      await addDoc(collection(db, 'patients'), {
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
      loadPatients();
    } catch (err) {
      console.error('Error adding patient:', err);
      setError('Failed to add patient');
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'patients', patientId));
      loadPatients();
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError('Failed to delete patient');
    }
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="patients-page">
      <header className="page-header">
        <div className="header-left">
          <h1 onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>OT Tracking Tool</h1>
          <nav className="nav-links">
            <button
              onClick={() => navigate('/dashboard')}
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/patients')}
              className={`nav-link ${isActive('/patients') ? 'active' : ''}`}
            >
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

      <div className="patients-container">
        <div className="patients-header">
          <div>
            <h2>Patients</h2>
            <p>Manage your patient roster</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Patient
          </button>
        </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading patients...</div>
      ) : patients.length === 0 ? (
        <div className="empty-state">
          <h3>No patients yet</h3>
          <p>Click "Add Patient" to get started</p>
        </div>
      ) : (
        <div className="patients-grid">
          {patients.map(patient => (
            <div key={patient.id} className="patient-card">
              <div className="patient-card-header">
                <h3>{patient.firstName} {patient.lastName}</h3>
                <div className="patient-card-actions">
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    View
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeletePatient(patient.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="patient-card-info">
                <p><strong>Age:</strong> {calculateAge(patient.dateOfBirth)} years</p>
                <p><strong>DOB:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                {patient.diagnosis && <p><strong>Diagnosis:</strong> {patient.diagnosis}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Patient</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>
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
      </div>
    </div>
  );
};

export default Patients;
