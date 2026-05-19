import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import BuilderPage from './pages/BuilderPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ReceptionistRegistration from './pages/ReceptionistRegistration';
import { getCurrentUser } from './auth';
import { useStore } from './store';

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

const GlobalBackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTemplate = useStore((state) => state.activeTemplate);
  const hiddenPaths = new Set(['/', '/login', '/register']);
  const hasEventContext = new URLSearchParams(location.search).has('eventId');
  const hasBuilderLocalBack =
    location.pathname === '/builder' &&
    Boolean(activeTemplate) &&
    !activeTemplate?.persisted &&
    !hasEventContext;
  const shouldHide = hiddenPaths.has(location.pathname) || hasBuilderLocalBack;

  if (shouldHide) {
    return null;
  }

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
          return;
        }

        navigate('/', { replace: true });
      }}
      className="fixed top-3 left-3 z-[120] inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-2.5 py-1.5 text-xs sm:top-5 sm:left-3 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Go back to previous page"
      title="Back"
    >
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </button>
  );
};

const App: React.FC = () => {
  const { setDarkMode } = useStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem('medical_builder_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      return;
    }

    if (savedTheme === 'light') {
      setDarkMode(false);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, [setDarkMode]);

  return (
    <Router>
      <GlobalBackButton />
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
          path="/register-patient"
          element={
            <RequireRole allowed={['receptionist', 'admin']}>
              <ReceptionistRegistration />
            </RequireRole>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireRole allowed={['admin']}>
              <AdminPanel />
            </RequireRole>
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
