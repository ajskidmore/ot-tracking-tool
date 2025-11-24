import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  assessmentQuestions,
  assessmentDomains,
  domainNames,
  ratingScale,
  calculateAllDomainAverages
} from '../data/assessmentQuestions';
import './AssessmentForm.css';

const AssessmentForm = () => {
  const { patientId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState(null);
  const [assessmentType, setAssessmentType] = useState('pre'); // 'pre' or 'post'
  const [responses, setResponses] = useState({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingAssessment, setExistingAssessment] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    loadData();
  }, [patientId, assessmentId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load patient
      const patientDoc = await getDoc(doc(db, 'patients', patientId));
      if (!patientDoc.exists() || patientDoc.data().userId !== currentUser.uid) {
        navigate('/patients');
        return;
      }
      setPatient({ id: patientDoc.id, ...patientDoc.data() });

      // Load existing assessment if editing
      if (assessmentId && assessmentId !== 'new') {
        const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId));
        if (assessmentDoc.exists()) {
          const data = assessmentDoc.data();
          setExistingAssessment({ id: assessmentDoc.id, ...data });
          setAssessmentType(data.type);
          setResponses(data.responses || {});
          setNotes(data.notes || '');
          // Set view mode if assessment is complete
          setViewMode(data.status === 'complete');
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
  };

  const validateForm = () => {
    const allAnswered = assessmentQuestions.every(q => {
      const response = responses[q.id];
      return response !== undefined && response !== null && response !== '';
    });

    if (!allAnswered) {
      return 'Please answer all questions before submitting';
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

      const domainAverages = calculateAllDomainAverages(responses);

      const assessmentData = {
        patientId,
        userId: currentUser.uid,
        type: assessmentType,
        status,
        responses,
        domainAverages,
        notes,
        updatedAt: new Date().toISOString()
      };

      if (existingAssessment) {
        // Update existing
        await updateDoc(doc(db, 'assessments', assessmentId), assessmentData);
      } else {
        // Create new
        assessmentData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'assessments'), assessmentData);
      }

      navigate(`/patients/${patientId}`);
    } catch (err) {
      console.error('Error saving assessment:', err);
      setError('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const getQuestionsByDomain = (domain) => {
    return assessmentQuestions.filter(q => q.domain === domain);
  };

  if (loading) {
    return <div className="loading">Loading assessment...</div>;
  }

  if (!patient) {
    return <div className="error-message">Patient not found</div>;
  }

  // If viewing a completed assessment, show results
  if (viewMode && existingAssessment) {
    return (
      <div className="assessment-form-page">
        <div className="assessment-form-container">
          <div className="assessment-header">
            <div>
              <h1>Program Evaluation Assessment - Results</h1>
              <p>Patient: {patient.firstName} {patient.lastName}</p>
              <p className="assessment-meta">
                {existingAssessment.type === 'pre' ? 'Pre-Assessment' : 'Post-Assessment'} |
                Completed: {new Date(existingAssessment.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setViewMode(false)}>
                Edit Assessment
              </button>
              <button className="btn-back" onClick={() => navigate(`/patients/${patientId}`)}>
                ← Back to Patient
              </button>
            </div>
          </div>

          {/* Domain Averages Summary */}
          <div className="results-summary">
            <h2>Domain Averages</h2>
            <div className="domain-averages-grid">
              {Object.values(assessmentDomains).map(domain => {
                const average = existingAssessment.domainAverages?.[domain];
                return average ? (
                  <div key={domain} className="domain-average-card">
                    <h3>{domainNames[domain]}</h3>
                    <div className="average-score">{average}</div>
                    <div className="score-label">Average Score</div>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Detailed Responses */}
          <div className="results-details">
            <h2>Detailed Responses</h2>
            {Object.values(assessmentDomains).map(domain => (
              <div key={domain} className="domain-section">
                <h3 className="domain-title">{domainNames[domain]}</h3>
                {getQuestionsByDomain(domain).map(question => {
                  const response = responses[question.id];
                  const rating = ratingScale.find(r => r.value === response);
                  return (
                    <div key={question.id} className="question-result-row">
                      <div className="question-text">
                        <span className="question-number">{question.number}.</span>
                        {question.question}
                      </div>
                      <div className="response-value">
                        <span className="score-badge">{response}</span>
                        <span className="score-description">{rating?.label || 'N/A'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Notes */}
          {notes && (
            <div className="results-notes">
              <h2>Additional Notes</h2>
              <p>{notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-form-page">
      <div className="assessment-form-container">
        <div className="assessment-header">
          <div>
            <h1>Program Evaluation Assessment</h1>
            <p>Patient: {patient.firstName} {patient.lastName}</p>
          </div>
          <button className="btn-back" onClick={() => navigate(`/patients/${patientId}`)}>
            ← Back to Patient
          </button>
        </div>

        {!existingAssessment && (
          <div className="assessment-type-selector">
            <label>Assessment Type:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="pre"
                  checked={assessmentType === 'pre'}
                  onChange={(e) => setAssessmentType(e.target.value)}
                />
                Pre-Assessment
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="post"
                  checked={assessmentType === 'post'}
                  onChange={(e) => setAssessmentType(e.target.value)}
                />
                Post-Assessment
              </label>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="assessment-form">
          {Object.values(assessmentDomains).map(domain => (
            <div key={domain} className="domain-section">
              <h2 className="domain-title">{domainNames[domain]}</h2>

              {getQuestionsByDomain(domain).map(question => (
                <div key={question.id} className="question-row">
                  <div className="question-text">
                    <span className="question-number">{question.number}.</span>
                    {question.question}
                  </div>
                  <div className="rating-options">
                    {ratingScale.map(rating => (
                      <label key={rating.value} className="rating-option">
                        <input
                          type="radio"
                          name={question.id}
                          value={rating.value}
                          checked={responses[question.id] === rating.value}
                          onChange={(e) => handleResponseChange(question.id, Number(e.target.value))}
                        />
                        <span className="rating-label">
                          <span className="rating-value">{rating.value}</span>
                          <span className="rating-description">{rating.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="notes-section">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="6"
              placeholder="Enter any additional observations or notes about this assessment..."
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(`/patients/${patientId}`)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-save"
              onClick={() => handleSave('in_progress')}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleSave('complete')}
              disabled={saving}
            >
              {saving ? 'Submitting...' : 'Submit Complete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentForm;
