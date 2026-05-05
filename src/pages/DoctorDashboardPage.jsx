// ═══════════════════════════════════════════
//  SYNCARE — pages/DoctorDashboardPage.jsx
// ═══════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssignedPatients, toggleAppointmentStatus, submitClinicalReport } from '../api/doctor';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import './DashboardPage.css'; // Reuse existing dashboard styles

const DoctorDashboardPage = () => {
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [reportType, setReportType] = useState('Radiology');
  const [reportBody, setReportBody] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAssignedPatients();
      setPatients(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch assigned patients.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleToggleStatus = async (id) => {
    try {
      await toggleAppointmentStatus(id);
      // Refresh list to show updated status
      fetchPatients();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const openReportModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setReportType('Radiology');
    setReportBody('');
    setReportError(null);
    setReportSuccess(null);
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setSelectedAppointmentId(null);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportBody.trim()) {
      setReportError('Report body cannot be empty.');
      return;
    }
    setSubmittingReport(true);
    setReportError(null);
    try {
      await submitClinicalReport({
        appointment_id: selectedAppointmentId,
        type: reportType,
        report: reportBody,
      });
      setReportSuccess('Report submitted successfully!');
      setTimeout(() => {
        closeReportModal();
        fetchPatients();
      }, 1500);
    } catch (err) {
      setReportError(err.message || 'Failed to submit report.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div className="dashboard__header-inner">
          <div>
            <p className="dashboard__greeting">{greeting()},</p>
            <h1 className="dashboard__name">
              Dr. {user?.doctor_name || 'Doctor'} {user?.doctor_specialty ? `— ${user.doctor_specialty}` : ''}
            </h1>
            <p className="dashboard__meta">
              Doctor ID: <strong>#{user?.doctor_id}</strong>
            </p>
          </div>
          <div className="dashboard__avatar">
            {(user?.doctor_name || 'D')[0].toUpperCase()}
          </div>
        </div>
      </div>

      <div className="dashboard__body">
        <section className="dashboard__section">
          <h2 className="dashboard__section-title">Assigned Patients</h2>
          <p>Here are the appointments assigned to you.</p>

          <Alert type="error" message={error} onDismiss={() => setError(null)} />

          {loading ? (
            <Loader size="sm" label="Fetching patients..." />
          ) : patients.length === 0 ? (
            <div className="dashboard__info-card">
              <p>No patients assigned at this moment.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {patients.map(p => (
                <div key={p.appointment_id} className="dashboard__info-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Patient</span><br /><strong>{p.patient_name}</strong></div>
                    <div><span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Date & Time</span><br />{p.appointment_date} at {p.appointment_time}</div>
                    <div><span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Age / Gender</span><br />{p.patient_age} / {p.patient_gender === 'M' ? 'Male' : 'Female'}</div>
                    <div><span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Status</span><br />
                      <span style={{
                        display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        backgroundColor: p.status === 1 ? 'var(--soft)' : 'var(--soft)',
                        color: p.status === 1 ? 'var(--success)' : 'var(--warn)'
                      }}>
                        {p.status === 1 ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Button
                      variant={p.status === 1 ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleStatus(p.appointment_id)}
                    >
                      {p.status === 1 ? 'Mark Pending' : 'Mark Complete'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openReportModal(p.appointment_id)}
                    >
                      Upload Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--surface)', width: '100%', maxWidth: '500px',
            borderRadius: '12px', padding: '30px', boxShadow: 'var(--shadow)'
          }}>
            <h2 style={{ marginBottom: '5px', fontSize: '1.5rem', color: 'var(--text)' }}>Upload Clinical Report</h2>
            <p style={{ marginBottom: '20px', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Appointment #{selectedAppointmentId}
            </p>

            <Alert type="error" message={reportError} onDismiss={() => setReportError(null)} />
            <Alert type="success" message={reportSuccess} />

            {!reportSuccess && (
              <form onSubmit={handleSubmitReport}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Report Type</label>
                  <select
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '8px',
                      border: '1px solid var(--border)', backgroundColor: 'var(--bg)',
                      color: 'var(--text)', fontSize: '1rem'
                    }}
                  >
                    <option value="Radiology">Radiology</option>
                    <option value="Clinical Results">Clinical Results</option>
                    <option value="Medical Assessment">Medical Assessment</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Report Details</label>
                  <textarea
                    value={reportBody}
                    onChange={e => setReportBody(e.target.value)}
                    rows={5}
                    placeholder="Enter the detailed report..."
                    style={{
                      width: '100%', padding: '12px', borderRadius: '8px',
                      border: '1px solid var(--border)', backgroundColor: 'var(--bg)',
                      color: 'var(--text)', fontSize: '1rem', resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <Button type="button" variant="ghost" onClick={closeReportModal} disabled={submittingReport}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={submittingReport}>
                    Submit
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default DoctorDashboardPage;