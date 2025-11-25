import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const PatientFilterContext = createContext();

export const usePatientFilter = () => {
  const context = useContext(PatientFilterContext);
  if (!context) {
    throw new Error('usePatientFilter must be used within PatientFilterProvider');
  }
  return context;
};

export const PatientFilterProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState('all');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadPatients();
    }
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
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = (patientId) => {
    setSelectedPatientId(patientId);
  };

  const getSelectedPatient = () => {
    if (selectedPatientId === 'all') return null;
    return patients.find(p => p.id === selectedPatientId);
  };

  const refreshPatients = async () => {
    await loadPatients();
  };

  const value = {
    selectedPatientId,
    selectPatient,
    patients,
    loading,
    getSelectedPatient,
    isAllPatients: selectedPatientId === 'all',
    refreshPatients
  };

  return (
    <PatientFilterContext.Provider value={value}>
      {children}
    </PatientFilterContext.Provider>
  );
};
