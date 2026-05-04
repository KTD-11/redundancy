// ═══════════════════════════════════════════
//  SYNCARE — apiClient.js
//  Central fetch wrapper: base URL, headers,
//  JWT attachment, token expiry, error normalization
// ═══════════════════════════════════════════

import {
  BASE_URL,
  TOKEN_KEY,
  TOKEN_TS_KEY,
  TOKEN_EXPIRY_MS,
} from '../utils/constants';

// ── Token helpers ──────────────────────────
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_TS_KEY, Date.now().toString());
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_TS_KEY);
};

export const isTokenExpired = () => {
  const ts = localStorage.getItem(TOKEN_TS_KEY);
  if (!ts) return true;
  return Date.now() - Number(ts) > TOKEN_EXPIRY_MS;
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token && !isTokenExpired();
};

// ── Core request function ──────────────────
/**
 * @param {string} endpoint  e.g. '/signin/'
 * @param {object} options   standard fetch options
 * @param {boolean} auth     attach Bearer token when true
 */
const request = async (endpoint, options = {}, auth = false) => {
  // Token expiry guard
  if (auth && isTokenExpired()) {
    removeToken();
    // Emit a custom event so AuthContext can react
    window.dispatchEvent(new CustomEvent('syncare:session-expired'));
    throw new ApiError(401, 'Session expired. Please sign in again.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(auth && getToken()
      ? { Authorization: `Bearer ${getToken()}` }
      : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Try to parse JSON body regardless of status
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.detail ||
      `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, data);
  }

  return data;
};

// ── Custom error class ─────────────────────
export class ApiError extends Error {
  constructor(status, message, raw = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.raw = raw;
  }
}

// ── HTTP verb shortcuts ────────────────────
export const api = {
  get: (endpoint, auth = true) =>
    request(endpoint, { method: 'GET' }, auth),

  post: (endpoint, body, auth = false) =>
    request(
      endpoint,
      { method: 'POST', body: JSON.stringify(body) },
      auth
    ),

  patch: (endpoint, body, auth = false) =>
    request(
      endpoint,
      { method: 'PATCH', body: body ? JSON.stringify(body) : null },
      auth
    ),

  delete: (endpoint, auth = true) =>
    request(endpoint, { method: 'DELETE' }, auth),
};

export default api;