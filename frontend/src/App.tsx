import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import BuilderPage from './pages/BuilderPage';
import Dashboard from './pages/Dashboard';
import { getCurrentUser } from './auth';

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RequireRole: React.FC<{ allowed: string[]; children: React.ReactElement }> = ({ allowed, children }) => {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/builder"
          element={
            <RequireRole allowed={['doctor', 'typist', 'admin']}>
              <BuilderPage />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
