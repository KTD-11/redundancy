// ═══════════════════════════════════════════
//  SYNCARE — api/doctor.js
//  Doctor endpoints: fetch patients, toggle status, send report
// ═══════════════════════════════════════════

import api from './apiClient';

/**
 * Fetch all pending (undone) appointments assigned to the authenticated doctor.
 * @returns {{ status, data: Array<{ appointment_id, patient_id, patient_name, appointment_date, appointment_time, appointment_type, status, ... }> }}
 */
export const getAssignedPatients = () =>
  api.get('/doctor/patients/', true);

/**
 * Toggle the completion status of an appointment (0 <-> 1)
 * @param {number} appointmentId 
 * @returns {Promise<void>} 204 No Content
 */
export const toggleAppointmentStatus = (appointmentId) =>
  api.patch(`/doctor/updateappointment/${appointmentId}`, null, true);

/**
 * Submit a clinical report for an appointment
 * @param {{ appointment_id: number, type: string, report: string }} payload 
 * @returns {Promise<void>} 204 No Content
 */
export const submitClinicalReport = (payload) =>
  api.patch('/doctor/sendreport/', payload, true);
