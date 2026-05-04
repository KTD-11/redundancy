// ═══════════════════════════════════════════
//  SYNCARE — App.jsx
//  Root: Router, AuthProvider, theme, layout
// ═══════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute   from './components/ui/ProtectedRoute';
import Navbar           from './components/ui/Navbar';

import HomePage              from './pages/HomePage';
import LoginPage             from './pages/LoginPage';
import SignupPage            from './pages/SignupPage';
import DashboardPage         from './pages/DashboardPage';
import DoctorDashboardPage   from './pages/DoctorDashboardPage';
import BookAppointmentPage   from './pages/BookAppointmentPage';
import AppointmentsPage      from './pages/AppointmentsPage';
import NotFoundPage          from './pages/NotFoundPage';
import AboutUsPage           from './pages/AboutUsPage';
import MapPage               from './pages/MapPage';

import { useAuth } from './context/AuthContext';

import './global.css';

const DashboardWrapper = () => {
  const { isDoctor } = useAuth();
  return isDoctor ? <DoctorDashboardPage /> : <DashboardPage />;
};

const App = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('syncare_theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('syncare_theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <HashRouter>
      <LanguageProvider>
        <AuthProvider>
          <Navbar theme={theme} onToggleTheme={toggleTheme} />

        <main>
          <Routes>
            {/* Public */}
            <Route path="/"       element={<HomePage />} />
            <Route path="/about"  element={<AboutUsPage />} />
            <Route path="/map"    element={<MapPage />} />
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><DashboardWrapper /></ProtectedRoute>}
            />
            <Route
              path="/appointments"
              element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>}
            />
            <Route
              path="/appointments/book"
              element={<ProtectedRoute><BookAppointmentPage /></ProtectedRoute>}
            />
            <Route
              path="/appointments/lookup"
              element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>}
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </AuthProvider>
      </LanguageProvider>
    </HashRouter>
  );
};

export default App;
