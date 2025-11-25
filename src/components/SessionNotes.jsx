import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './SessionNotes.css';

const SessionNotes = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    duration: '',
    focus: '',
    activities: '',
    observations: '',
    progress: '',
    nextSteps: '',
    attendanceStatus: 'completed'
  });

  const attendanceStatuses = {
    completed: 'Completed',
    cancelled: 'Cancelled',
    noShow: 'No Show',
    rescheduled: 'Rescheduled'
  };

  useEffect(() => {
    loadPatient();
    loadSessions();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      const docRef = doc(db, 'patients', patientId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const patientData = { id: docSnap.id, ...docSnap.data() };
        if (patientData.userId !== currentUser.uid) {
          navigate('/dashboard');
          return;
        }
        setPatient(patientData);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error loading patient:', err);
      setError('Failed to load patient');
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'sessionNotes'),
        where('patientId', '==', patientId),
        where('userId', '==', currentUser.uid),
        orderBy('sessionDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const sessionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load session notes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const sessionData = {
        ...formData,
        patientId,
        userId: currentUser.uid,
        duration: parseInt(formData.duration) || 0,
        updatedAt: new Date().toISOString()
      };

      if (editingSession) {
        // Update existing session
        const docRef = doc(db, 'sessionNotes', editingSession.id);
        await updateDoc(docRef, sessionData);
      } else {
        // Create new session
        sessionData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'sessionNotes'), sessionData);
      }

      // Reset form and reload sessions
      resetForm();
      loadSessions();
    } catch (err) {
      console.error('Error saving session:', err);
      setError('Failed to save session note');
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      sessionDate: session.sessionDate,
      duration: session.duration || '',
      focus: session.focus || '',
      activities: session.activities || '',
      observations: session.observations || '',
      progress: session.progress || '',
      nextSteps: session.nextSteps || '',
      attendanceStatus: session.attendanceStatus || 'completed'
    });
    setShowForm(true);
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session note?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'sessionNotes', sessionId));
      loadSessions();
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete session note');
    }
  };

  const resetForm = () => {
    setFormData({
      sessionDate: new Date().toISOString().split('T')[0],
      duration: '',
      focus: '',
      activities: '',
      observations: '',
      progress: '',
      nextSteps: '',
      attendanceStatus: 'completed'
    });
    setEditingSession(null);
    setShowForm(false);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'noShow':
        return 'status-no-show';
      case 'rescheduled':
        return 'status-rescheduled';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !patient) {
    return <div className="loading">Loading...</div>;
  }

  const completedSessions = sessions.filter(s => s.attendanceStatus === 'completed');
  const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  return (
    <div className="session-notes-container">
      <div className="session-header">
        <button className="btn-back" onClick={() => navigate(`/patients/${patientId}`)}>
          ← Back
        </button>
        <h1>Session Notes - {patient?.firstName} {patient?.lastName}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="session-content">
        {/* Stats Summary */}
        <div className="session-stats">
          <div className="stat-box">
            <div className="stat-number">{completedSessions.length}</div>
            <div className="stat-label">Sessions Completed</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{totalDuration}</div>
            <div className="stat-label">Total Minutes</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{sessions.length}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
        </div>

        {/* Add New Session Button */}
        <div className="session-actions">
          <button
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add Session Note'}
          </button>
        </div>

        {/* Session Form */}
        {showForm && (
          <div className="session-form-card">
            <h2>{editingSession ? 'Edit Session Note' : 'New Session Note'}</h2>
            <form onSubmit={handleSubmit} className="session-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sessionDate">Session Date *</label>
                  <input
                    type="date"
                    id="sessionDate"
                    name="sessionDate"
                    value={formData.sessionDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="0"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 30, 45, 60"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="attendanceStatus">Status</label>
                  <select
                    id="attendanceStatus"
                    name="attendanceStatus"
                    value={formData.attendanceStatus}
                    onChange={handleInputChange}
                  >
                    {Object.entries(attendanceStatuses).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="focus">Session Focus</label>
                <input
                  type="text"
                  id="focus"
                  name="focus"
                  value={formData.focus}
                  onChange={handleInputChange}
                  placeholder="e.g., Fine motor skills, Handwriting practice"
                />
              </div>

              <div className="form-group">
                <label htmlFor="activities">Activities Completed</label>
                <textarea
                  id="activities"
                  name="activities"
                  value={formData.activities}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Describe activities performed during the session..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="observations">Observations & Performance</label>
                <textarea
                  id="observations"
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Note patient's performance, behavior, engagement level..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="progress">Progress Toward Goals</label>
                <textarea
                  id="progress"
                  name="progress"
                  value={formData.progress}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Document progress toward treatment goals..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="nextSteps">Plan for Next Session</label>
                <textarea
                  id="nextSteps"
                  name="nextSteps"
                  value={formData.nextSteps}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="What to work on next session..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingSession ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sessions List */}
        <div className="sessions-list">
          {sessions.length === 0 ? (
            <div className="no-sessions">
              <p>No session notes yet.</p>
              <p>Click "Add Session Note" to document your first therapy session.</p>
            </div>
          ) : (
            sessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-card-header">
                  <div className="session-date-info">
                    <h3>{formatDate(session.sessionDate)}</h3>
                    {session.duration && (
                      <span className="duration-badge">{session.duration} min</span>
                    )}
                  </div>
                  <span className={`status-badge ${getStatusClass(session.attendanceStatus)}`}>
                    {attendanceStatuses[session.attendanceStatus]}
                  </span>
                </div>

                {session.focus && (
                  <div className="session-focus">
                    <strong>Focus:</strong> {session.focus}
                  </div>
                )}

                {session.activities && (
                  <div className="session-section">
                    <h4>Activities</h4>
                    <p>{session.activities}</p>
                  </div>
                )}

                {session.observations && (
                  <div className="session-section">
                    <h4>Observations</h4>
                    <p>{session.observations}</p>
                  </div>
                )}

                {session.progress && (
                  <div className="session-section">
                    <h4>Progress</h4>
                    <p>{session.progress}</p>
                  </div>
                )}

                {session.nextSteps && (
                  <div className="session-section">
                    <h4>Next Steps</h4>
                    <p>{session.nextSteps}</p>
                  </div>
                )}

                <div className="session-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(session)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(session.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionNotes;
