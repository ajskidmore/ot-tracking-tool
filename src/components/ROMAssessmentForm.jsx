import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  romMeasurements,
  romBodyRegions,
  romSides,
  regionNames,
  getMeasurementsByRegion,
  calculateROMPercentage,
  getROMStatus
} from '../data/romQuestions';
import './ROMAssessmentForm.css';

const ROMAssessmentForm = () => {
  const { patientId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [assessmentType, setAssessmentType] = useState('pre'); // 'pre' or 'post'
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [measurements, setMeasurements] = useState({});
  const [notes, setNotes] = useState('');
  const [activeRegion, setActiveRegion] = useState(null);

  useEffect(() => {
    loadPatient();
    if (assessmentId && assessmentId !== 'new') {
      loadAssessment();
    }
  }, [patientId, assessmentId]);

  const loadPatient = async () => {
    try {
      const docRef = doc(db, 'patients', patientId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const patientData = { id: docSnap.id, ...docSnap.data() };
        if (patientData.userId !== currentUser.uid) {
          navigate('/patients');
          return;
        }
        setPatient(patientData);
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

  const loadAssessment = async () => {
    try {
      const docRef = doc(db, 'romAssessments', assessmentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userId !== currentUser.uid) {
          navigate('/patients');
          return;
        }
        setAssessmentType(data.type);
        setSelectedRegions(data.selectedRegions || []);
        setMeasurements(data.measurements || {});
        setNotes(data.notes || '');
        if (data.selectedRegions && data.selectedRegions.length > 0) {
          setActiveRegion(data.selectedRegions[0]);
        }
      }
    } catch (err) {
      console.error('Error loading assessment:', err);
      setError('Failed to load assessment');
    }
  };

  const handleRegionToggle = (region) => {
    setSelectedRegions(prev => {
      const isSelected = prev.includes(region);
      if (isSelected) {
        // Remove region and its measurements
        const newMeasurements = { ...measurements };
        getMeasurementsByRegion(region).forEach(m => {
          if (m.bilateral) {
            delete newMeasurements[`${m.id}_left`];
            delete newMeasurements[`${m.id}_right`];
          } else {
            delete newMeasurements[m.id];
          }
        });
        setMeasurements(newMeasurements);
        return prev.filter(r => r !== region);
      } else {
        const newRegions = [...prev, region];
        if (!activeRegion) {
          setActiveRegion(region);
        }
        return newRegions;
      }
    });
  };

  const handleMeasurementChange = (measurementId, side, value) => {
    const key = side ? `${measurementId}_${side}` : measurementId;
    setMeasurements(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validateForm = () => {
    if (selectedRegions.length === 0) {
      return 'Please select at least one body region to assess';
    }

    // Check if at least one measurement has been entered
    const hasMeasurements = Object.values(measurements).some(val => val && val !== '');
    if (!hasMeasurements) {
      return 'Please enter at least one ROM measurement';
    }

    return null;
  };

  const handleSave = async (status = 'in_progress') => {
    try {
      setSaving(true);
      setError('');

      if (status === 'complete') {
        const validationError = validateForm();
        if (validationError) {
          setError(validationError);
          setSaving(false);
          return;
        }
      }

      const assessmentData = {
        patientId,
        userId: currentUser.uid,
        type: assessmentType,
        status,
        selectedRegions,
        measurements,
        notes,
        updatedAt: new Date().toISOString()
      };

      if (assessmentId && assessmentId !== 'new') {
        // Update existing assessment
        const docRef = doc(db, 'romAssessments', assessmentId);
        await updateDoc(docRef, assessmentData);
      } else {
        // Create new assessment
        assessmentData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'romAssessments'), assessmentData);
      }

      navigate(`/patients/${patientId}`);
    } catch (err) {
      console.error('Error saving assessment:', err);
      setError('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!patient) {
    return <div className="error-message">Patient not found</div>;
  }

  const regionMeasurements = activeRegion ? getMeasurementsByRegion(activeRegion) : [];

  return (
    <div className="rom-assessment-container">
      <div className="assessment-header">
        <button className="btn-back" onClick={() => navigate(`/patients/${patientId}`)}>
          ← Back to Patient
        </button>
        <h1>ROM Assessment - {patient.firstName} {patient.lastName}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="assessment-form">
        {/* Assessment Type Selection */}
        <div className="form-section">
          <h2>Assessment Type</h2>
          <div className="type-selection">
            <label className={`type-option ${assessmentType === 'pre' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="assessmentType"
                value="pre"
                checked={assessmentType === 'pre'}
                onChange={(e) => setAssessmentType(e.target.value)}
              />
              <span>Pre-Assessment</span>
            </label>
            <label className={`type-option ${assessmentType === 'post' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="assessmentType"
                value="post"
                checked={assessmentType === 'post'}
                onChange={(e) => setAssessmentType(e.target.value)}
              />
              <span>Post-Assessment</span>
            </label>
          </div>
        </div>

        {/* Region Selection */}
        <div className="form-section">
          <h2>Select Body Regions to Assess</h2>
          <div className="region-selection">
            {Object.values(romBodyRegions).map(region => (
              <label
                key={region}
                className={`region-checkbox ${selectedRegions.includes(region) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region)}
                  onChange={() => handleRegionToggle(region)}
                />
                <span>{regionNames[region]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Measurements */}
        {selectedRegions.length > 0 && (
          <div className="form-section">
            <h2>ROM Measurements</h2>
            <div className="measurements-container">
              {/* Region Tabs */}
              <div className="region-tabs">
                {selectedRegions.map(region => (
                  <button
                    key={region}
                    className={`region-tab ${activeRegion === region ? 'active' : ''}`}
                    onClick={() => setActiveRegion(region)}
                  >
                    {regionNames[region]}
                  </button>
                ))}
              </div>

              {/* Measurements for Active Region */}
              <div className="measurements-content">
                {regionMeasurements.map(measurement => (
                  <div key={measurement.id} className="measurement-item">
                    <div className="measurement-header">
                      <h3>{measurement.movement}</h3>
                      <p className="measurement-description">{measurement.description}</p>
                      <p className="normal-range">
                        Normal: {measurement.normalRange.min}° - {measurement.normalRange.max}°
                      </p>
                    </div>

                    {measurement.bilateral ? (
                      <div className="bilateral-inputs">
                        <div className="side-input">
                          <label>Left</label>
                          <div className="input-with-unit">
                            <input
                              type="number"
                              min="0"
                              max={measurement.normalRange.max + 20}
                              value={measurements[`${measurement.id}_left`] || ''}
                              onChange={(e) => handleMeasurementChange(measurement.id, 'left', e.target.value)}
                              placeholder="0"
                            />
                            <span className="unit">°</span>
                          </div>
                          {measurements[`${measurement.id}_left`] && (
                            <div className="measurement-feedback">
                              <span className={`status-badge ${getROMStatus(calculateROMPercentage(measurements[`${measurement.id}_left`], measurement.normalRange.max))}`}>
                                {calculateROMPercentage(measurements[`${measurement.id}_left`], measurement.normalRange.max)}%
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="side-input">
                          <label>Right</label>
                          <div className="input-with-unit">
                            <input
                              type="number"
                              min="0"
                              max={measurement.normalRange.max + 20}
                              value={measurements[`${measurement.id}_right`] || ''}
                              onChange={(e) => handleMeasurementChange(measurement.id, 'right', e.target.value)}
                              placeholder="0"
                            />
                            <span className="unit">°</span>
                          </div>
                          {measurements[`${measurement.id}_right`] && (
                            <div className="measurement-feedback">
                              <span className={`status-badge ${getROMStatus(calculateROMPercentage(measurements[`${measurement.id}_right`], measurement.normalRange.max))}`}>
                                {calculateROMPercentage(measurements[`${measurement.id}_right`], measurement.normalRange.max)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="single-input">
                        <div className="input-with-unit">
                          <input
                            type="number"
                            min="0"
                            max={measurement.normalRange.max + 20}
                            value={measurements[measurement.id] || ''}
                            onChange={(e) => handleMeasurementChange(measurement.id, null, e.target.value)}
                            placeholder="0"
                          />
                          <span className="unit">°</span>
                        </div>
                        {measurements[measurement.id] && (
                          <div className="measurement-feedback">
                            <span className={`status-badge ${getROMStatus(calculateROMPercentage(measurements[measurement.id], measurement.normalRange.max))}`}>
                              {calculateROMPercentage(measurements[measurement.id], measurement.normalRange.max)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="form-section">
          <h2>Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any additional notes or observations..."
            rows="6"
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate(`/patients/${patientId}`)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn-secondary"
            onClick={() => handleSave('in_progress')}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            className="btn-primary"
            onClick={() => handleSave('complete')}
            disabled={saving}
          >
            {saving ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ROMAssessmentForm;
