import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PatientFilterProvider } from './contexts/PatientFilterContext';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PatientProfile from './components/PatientProfile';
import AssessmentForm from './components/AssessmentForm';
import ROMAssessmentForm from './components/ROMAssessmentForm';
import Goals from './components/Goals';
import SessionNotes from './components/SessionNotes';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <PatientFilterProvider>
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:patientId"
            element={
              <PrivateRoute>
                <PatientProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:patientId/assessment/new"
            element={
              <PrivateRoute>
                <AssessmentForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:patientId/assessment/:assessmentId"
            element={
              <PrivateRoute>
                <AssessmentForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:patientId/rom-assessment/new"
            element={
              <PrivateRoute>
                <ROMAssessmentForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:patientId/rom-assessment/:assessmentId"
            element={
              <PrivateRoute>
                <ROMAssessmentForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:patientId/goals"
            element={
              <PrivateRoute>
                <Goals />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:patientId/session-notes"
            element={
              <PrivateRoute>
                <SessionNotes />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </PatientFilterProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
