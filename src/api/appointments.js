// ═══════════════════════════════════════════
//  SYNCARE — api/appointments.js
//  Appointment endpoints: book, fetch, cancel
// ═══════════════════════════════════════════

import api from './apiClient';

/**
 * Book a new appointment.
 * @param {{ date: string, time: string, type: string }} payload
 *   date format: DD/MM/YYYY  |  time format: HH:MM (24h)
 * @returns {{ status, message }}
 */
export const bookAppointment = (payload) =>
  api.post('/patient/book/', payload, true);

/**
 * Fetch all appointments for the authenticated user.
 * @returns {{ status, data: Array<{ appointment_id, appointment_date, appointment_time, appointment_type, appointment_name }> }}
 */
export const fetchAppointments = () =>
  api.get('/patient/appointments/', true);

/**
 * Cancel an appointment.
 * Pass appointment_id as a number, or "*" to cancel ALL.
 * @param {number | "*"} appointmentId
 * @returns {{ status, message }}
 */
export const cancelAppointment = (appointmentId) =>
  api.post('/patient/cancel/', { appointment_id: appointmentId }, true);

/**
 * Get the clinical report for a specific appointment
 * @param {number} appointmentId 
 * @returns {{ status, data: { reportType, reportBody } }}
 */
export const getClinicalReport = (appointmentId) =>
  api.get(`/patient/report/${appointmentId}`, true);

