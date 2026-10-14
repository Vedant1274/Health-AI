import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import ReportUpload from './pages/ReportUpload';
import ReportResult from './pages/ReportResult';
import FindDoctor from './pages/FindDoctor';
import Emergency from './pages/Emergency';

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-12 px-4 sm:px-6 lg:px-8" style={{ paddingTop: '6rem' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/symptoms" element={
            <ProtectedRoute><SymptomChecker /></ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute><ReportUpload /></ProtectedRoute>
          } />
          <Route path="/reports/:id/result" element={
            <ProtectedRoute><ReportResult /></ProtectedRoute>
          } />
          <Route path="/find-doctor" element={
            <ProtectedRoute><FindDoctor /></ProtectedRoute>
          } />
          <Route path="/emergency" element={
            <ProtectedRoute><Emergency /></ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
