import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './PatientProfile.css';

const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatient();
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

        <div className="profile-sections">
          <div className="section-card">
            <h2>Assessments</h2>
            <p className="section-placeholder">No assessments yet. Assessments will be added in Sprint 3.</p>
          </div>

          <div className="section-card">
            <h2>Goals</h2>
            <p className="section-placeholder">No goals yet. Goals will be added in Sprint 7.</p>
          </div>

          <div className="section-card">
            <h2>Session Notes</h2>
            <p className="section-placeholder">No session notes yet. Session notes will be added in Sprint 8.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
