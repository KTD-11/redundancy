// ═══════════════════════════════════════════
//  SYNCARE — context/AuthContext.js
//  Global auth state: user info, JWT, login/logout
// ═══════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
} from '../api/apiClient';
import { USER_KEY } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

  // Handle session expiry event fired by apiClient
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('syncare:session-expired', handler);
    return () => window.removeEventListener('syncare:session-expired', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Called after a successful signin or signup response.
   * @param {{ patient_id, patient_name, patient_gender }} userData
   * @param {string} token
   */
  const login = useCallback((userData, token) => {
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const isDoctor = !!user?.doctor_id;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isDoctor, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Convenience hook */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
