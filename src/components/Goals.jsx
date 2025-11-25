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
import './Goals.css';

const Goals = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    category: 'functional',
    status: 'active',
    measurableObjective: '',
    progress: 0
  });

  const categories = {
    functional: 'Functional Skills',
    motor: 'Motor Skills',
    cognitive: 'Cognitive Skills',
    social: 'Social/Behavioral',
    selfCare: 'Self-Care',
    other: 'Other'
  };

  const statuses = {
    active: 'Active',
    achieved: 'Achieved',
    modified: 'Modified',
    discontinued: 'Discontinued'
  };

  useEffect(() => {
    loadPatient();
    loadGoals();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      const docRef = doc(db, 'patients', patientId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const patientData = { id: docSnap.id, ...docSnap.data() };

        // Security check: ensure this patient belongs to the current user
        if (patientData.userId !== currentUser.uid) {
          navigate('/dashboard');
          return;
        }

        setPatient(patientData);
      } else {
        setError('Patient not found');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error loading patient:', err);
      setError('Failed to load patient');
    }
  };

  const loadGoals = async () => {
    try {
      setLoading(true);
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
      setError('Failed to load goals');
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
      const goalData = {
        ...formData,
        patientId: patientId,
        userId: currentUser.uid,
        progress: parseInt(formData.progress) || 0,
        updatedAt: new Date().toISOString()
      };

      if (editingGoal) {
        // Update existing goal
        const docRef = doc(db, 'goals', editingGoal.id);
        await updateDoc(docRef, goalData);
      } else {
        // Create new goal
        goalData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'goals'), goalData);
      }

      // Reset form and reload goals
      resetForm();
      loadGoals();
    } catch (err) {
      console.error('Error saving goal:', err);
      setError('Failed to save goal');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetDate: goal.targetDate || '',
      category: goal.category,
      status: goal.status,
      measurableObjective: goal.measurableObjective || '',
      progress: goal.progress || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'goals', goalId));
      loadGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetDate: '',
      category: 'functional',
      status: 'active',
      measurableObjective: '',
      progress: 0
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'achieved':
        return 'status-achieved';
      case 'active':
        return 'status-active';
      case 'modified':
        return 'status-modified';
      case 'discontinued':
        return 'status-discontinued';
      default:
        return '';
    }
  };

  const getProgressClass = (progress) => {
    if (progress >= 75) return 'progress-high';
    if (progress >= 50) return 'progress-medium';
    if (progress >= 25) return 'progress-low';
    return 'progress-minimal';
  };

  if (loading && !patient) {
    return <div className="loading">Loading...</div>;
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="goals-container">
      <div className="goals-header">
        <button className="btn-back" onClick={() => navigate(`/patients/${patientId}`)}>
          ← Back
        </button>
        <h1>Treatment Goals - {patient.firstName} {patient.lastName}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="goals-content">
        {/* Stats Summary */}
        <div className="goals-stats">
          <div className="stat-box">
            <div className="stat-number">{goals.filter(g => g.status === 'active').length}</div>
            <div className="stat-label">Active Goals</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{goals.filter(g => g.status === 'achieved').length}</div>
            <div className="stat-label">Achieved</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{goals.length}</div>
            <div className="stat-label">Total Goals</div>
          </div>
        </div>

        {/* Add New Goal Button */}
        <div className="goals-actions">
          <button
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add New Goal'}
          </button>
        </div>

        {/* Goal Form */}
        {showForm && (
          <div className="goal-form-card">
            <h2>{editingGoal ? 'Edit Goal' : 'New Treatment Goal'}</h2>
            <form onSubmit={handleSubmit} className="goal-form">
              <div className="form-group">
                <label htmlFor="title">Goal Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Improve fine motor skills for writing"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {Object.entries(categories).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {Object.entries(statuses).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="targetDate">Target Date</label>
                  <input
                    type="date"
                    id="targetDate"
                    name="targetDate"
                    value={formData.targetDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="measurableObjective">Measurable Objective</label>
                <input
                  type="text"
                  id="measurableObjective"
                  name="measurableObjective"
                  value={formData.measurableObjective}
                  onChange={handleInputChange}
                  placeholder="e.g., Child will write 5 letters independently in 3/5 trials"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description/Notes</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter detailed description, strategies, or notes..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="progress">Progress ({formData.progress}%)</label>
                <input
                  type="range"
                  id="progress"
                  name="progress"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.progress}
                  onChange={handleInputChange}
                  className={`progress-slider ${getProgressClass(formData.progress)}`}
                />
                <div className="progress-labels">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        <div className="goals-list">
          {goals.length === 0 ? (
            <div className="no-goals">
              <p>No treatment goals yet.</p>
              <p>Click "Add New Goal" to create your first goal.</p>
            </div>
          ) : (
            goals.map(goal => (
              <div key={goal.id} className="goal-card">
                <div className="goal-header">
                  <div className="goal-title-row">
                    <h3>{goal.title}</h3>
                    <span className={`status-badge ${getStatusClass(goal.status)}`}>
                      {statuses[goal.status]}
                    </span>
                  </div>
                  <div className="goal-meta">
                    <span className="category-badge">{categories[goal.category]}</span>
                    {goal.targetDate && (
                      <span className="target-date">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {goal.measurableObjective && (
                  <div className="goal-objective">
                    <strong>Objective:</strong> {goal.measurableObjective}
                  </div>
                )}

                {goal.description && (
                  <div className="goal-description">
                    {goal.description}
                  </div>
                )}

                <div className="goal-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span className="progress-percentage">{goal.progress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getProgressClass(goal.progress || 0)}`}
                      style={{ width: `${goal.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="goal-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(goal)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(goal.id)}
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

export default Goals;
