// ═══════════════════════════════════════════
//  SYNCARE — api/auth.js
//  Auth endpoints: signup, signin, delete account
// ═══════════════════════════════════════════

import api from './apiClient';

/**
 * Register a new patient.
 * @param {{ name, age, gender, number, gov_id, password }} payload
 * @returns {{ status, message, id, token }}
 */
export const signup = (payload) => api.post('/patient/signup/', payload, false);

/**
 * Sign in with auth_id + password + staff flag.
 * @param {{ auth_id, password, staff }} payload
 * @returns {{ status, data: { patient_id, patient_name, patient_gender } | { doctor_id, doctor_name, doctor_specialty }, token }}
 */
export const signin = (payload) => api.post('/signin/', payload, false);

/**
 * Delete the currently authenticated user account.
 * Requires a valid JWT (auth = true).
 * @returns {{ status, message }}
 */
export const deleteAccount = () => api.delete('/patient/remove/', true);
