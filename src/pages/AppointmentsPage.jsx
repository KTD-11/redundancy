// ═══════════════════════════════════════════
//  SYNCARE — pages/AppointmentsPage.jsx
//  Lookup a single appointment and cancel it
// ═══════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppointments from '../hooks/useAppointments';
import { useAuth } from '../context/AuthContext';
import { getClinicalReport } from '../api/appointments';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import ClinicalReportModal from '../components/ui/ClinicalReportModal';
import './InnerPage.css';
import './AppointmentsPage.css';

const calculateTravel = (userLat, userLng, apptTime) => {
  if (!userLat || !userLng || !apptTime) return null;
  const destLat = 30.03028;
  const destLng = 31.22917;

  const toRad = x => x * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(destLat - userLat);
  const dLon = toRad(destLng - userLng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(userLat)) * Math.cos(toRad(destLat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  const mins = Math.round((d / 20) * 60) + 10;

  const [hh, mm] = apptTime.split(':').map(Number);
  const totalMins = hh * 60 + mm;
  const departMins = totalMins - mins - 15;

  const depH = Math.floor(departMins / 60);
  const depM = departMins % 60;

  const safeDepH = depH < 0 ? 24 + depH : depH;
  const formattedDepart = `${String(safeDepH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`;

  return { duration: mins, departure: formattedDepart };
};

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, error, appointments, clearError, fetchAll, cancel } = useAppointments();

  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMsg, setCancelMsg] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const [showCancelAll, setShowCancelAll] = useState(false);

  const [locLat, setLocLat] = useState(user?.lat || null);
  const [locLng, setLocLng] = useState(user?.lng || null);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportFetchError, setReportFetchError] = useState(null);

  useEffect(() => {
    if (user?.lat) setLocLat(user.lat);
    if (user?.lng) setLocLng(user.lng);
  }, [user]);

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocLat(pos.coords.latitude);
        setLocLng(pos.coords.longitude);
      },
      () => alert('Unable to get location.')
    );
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCancel = async (id) => {
    setCancelLoading(true);
    setCancelError(null);
    setCancelMsg(null);
    try {
      const res = await cancel(id);
      if (res) {
        setCancelMsg(res.message || 'Appointment cancelled.');
        await fetchAll(); // Refresh list after cancel
      }
    } catch (err) {
      setCancelError(err?.message || 'Cancel failed.');
    } finally {
      setCancelLoading(false);
      setShowCancelAll(false);
    }
  };

  const handleViewReport = async (appointment) => {
    setReportModalOpen(true);
    setReportLoading(true);
    setReportFetchError(null);
    setSelectedReport(null);
    setSelectedAppointment(appointment);

    try {
      const res = await getClinicalReport(appointment.appointment_id);
      if (res && res.data) {
        setSelectedReport(res.data);
      } else {
        setReportFetchError('No report data received.');
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('no report found')) {
        setReportFetchError('No report available yet.');
      } else {
        setReportFetchError(err.message || 'Failed to fetch report.');
      }
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="inner-page">
      <button className="inner-page__back" onClick={() => navigate(-1)}>← Back</button>

      <div className="appts-page">
        <div className="appts-page__header">
          <span className="appts-page__tag">📋 Appointments</span>
          <h1>Your Appointments</h1>
          <p>View all your scheduled appointments or cancel them.</p>
        </div>

        {/* Appointments List */}
        <div className="appts-page__card">
          <h2>Scheduled Visits</h2>

          {error && <Alert type="error" message={error} onDismiss={clearError} />}

          {loading && !cancelLoading && <Loader size="sm" label="Fetching…" />}

          {!loading && appointments?.length === 0 && (
            <p>You have no upcoming appointments.</p>
          )}

          {!loading && appointments?.length > 0 && (
            <div className="appts-list">
              {appointments.map((appointment) => (
                <div key={appointment.appointment_id} className="appts-page__result">
                  <div className="appts-page__result-grid">
                    <div><span className="appts-page__label">ID</span><span>#{appointment.appointment_id}</span></div>
                    <div><span className="appts-page__label">Date</span><span>{appointment.appointment_date}</span></div>
                    <div><span className="appts-page__label">Time</span><span>{appointment.appointment_time}</span></div>
                    <div><span className="appts-page__label">Clinic</span><span>{appointment.appointment_name}</span></div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={cancelLoading}
                      onClick={() => handleCancel(appointment.appointment_id)}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewReport(appointment)}
                    >
                      View Report
                    </Button>

                    {!locLat ? (
                      <Button variant="secondary" size="sm" onClick={handleCaptureLocation}>
                        📍 Allow Location to see Travel Route
                      </Button>
                    ) : (
                      <>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${locLat},${locLng}&destination=30.03028,31.22917`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn--primary btn--sm"
                          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                        >
                          📍 View Route
                        </a>
                        {(() => {
                          const travel = calculateTravel(locLat, locLng, appointment.appointment_time);
                          return travel ? (
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginLeft: '10px' }}>
                              🚗 ~{travel.duration} mins | ⏰ Leave by: <strong>{travel.departure}</strong>
                            </span>
                          ) : null;
                        })()}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancel all */}
        <div className="appts-page__card appts-page__card--danger">
          <h2>Cancel All Appointments</h2>
          <p>This will remove every appointment linked to your account.</p>

          <Alert type="success" message={cancelMsg} onDismiss={() => setCancelMsg(null)} />
          <Alert type="error" message={cancelError} onDismiss={() => setCancelError(null)} />

          {!showCancelAll ? (
            <Button variant="danger" size="sm" onClick={() => setShowCancelAll(true)}>
              Cancel All
            </Button>
          ) : (
            <div className="appts-page__confirm">
              <p>This action is irreversible. Are you sure?</p>
              <div className="appts-page__confirm-actions">
                <Button
                  variant="danger"
                  size="sm"
                  loading={cancelLoading}
                  onClick={() => handleCancel('*')}
                >
                  Yes, Cancel All
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowCancelAll(false)}>
                  Go Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report View Modal */}
      <ClinicalReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        appointmentData={selectedAppointment}
        reportData={selectedReport}
        loading={reportLoading}
        error={reportFetchError}
      />
    </div>
  );
};
export default AppointmentsPage;