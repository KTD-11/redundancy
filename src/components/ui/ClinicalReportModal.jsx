import React, { useState } from 'react';
import Button from './Button';
import Alert from './Alert';
import Loader from './Loader';
import './ClinicalReportModal.css';

// SVG Icons for the components
const Icons = {
  Report: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Stethoscope: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21C5.477 21 1 16.523 1 11V7a4 4 0 0 1 8 0v4c0 1.105.895 2 2 2h2c1.105 0 2-.895 2-2V7a4 4 0 0 1 8 0v4c0 5.523-4.477 10-10 10Z"/><path d="M8 7v4"/><path d="M16 7v4"/><circle cx="12" cy="21" r="1"/></svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Clipboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
  ),
  Magnifier: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
  ),
  Brain: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4Z"/><path d="M12 12v10"/><path d="M12 22a7 7 0 0 1 0-14"/><path d="M12 22a7 7 0 0 0 0-14"/></svg>
  ),
  ClipboardPlus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
  ),
  ChevronDown: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
  ),
  Download: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  ),
  Printer: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
  )
};

const AccordionSection = ({ icon: Icon, title, content, color, preview, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!content || content.trim() === '') return null;

  return (
    <div className={`report-section ${isOpen ? 'expanded' : ''}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="section-header-left">
          <div className="section-icon-wrap" style={{ '--sec-color': color }}>
            <Icon />
          </div>
          <div>
            <div className="section-title">{title}</div>
            {!isOpen && <div className="section-preview">{preview || content.substring(0, 60) + '...'}</div>}
          </div>
        </div>
        <div className="section-chevron">
          <Icons.ChevronDown />
        </div>
      </div>
      <div className="section-content">
        {content}
      </div>
    </div>
  );
};

// Helper to extract sections from raw text
const extractSections = (text) => {
  if (!text) return null;
  const sections = {
    Findings: '',
    Diagnosis: '',
    Recommendations: '',
    Notes: ''
  };

  const lines = text.split('\n');
  let currentSection = null;

  for (let line of lines) {
    const lowerLine = line.toLowerCase().trim();
    if (lowerLine.startsWith('findings:') || lowerLine.startsWith('findings')) {
      currentSection = 'Findings';
    } else if (lowerLine.startsWith('diagnosis:') || lowerLine.startsWith('diagnosis')) {
      currentSection = 'Diagnosis';
    } else if (lowerLine.startsWith('recommendations:') || lowerLine.startsWith('recommendations')) {
      currentSection = 'Recommendations';
    } else if (lowerLine.startsWith('notes:') || lowerLine.startsWith('notes')) {
      currentSection = 'Notes';
    } else if (currentSection) {
      sections[currentSection] += line + '\n';
    } else {
      // If there's text before any section header, put it in Notes or Findings
      sections.Notes += line + '\n';
    }
  }

  // Clean up
  Object.keys(sections).forEach(k => {
    sections[k] = sections[k].trim();
  });

  // If no sections were found (everything in Notes), return null so we can show raw
  if (!sections.Findings && !sections.Diagnosis && !sections.Recommendations) {
    return null;
  }

  return sections;
};

const ClinicalReportModal = ({ isOpen, onClose, appointmentData, reportData, loading, error }) => {
  if (!isOpen) return null;

  // Fallbacks if data is missing
  const appt = appointmentData || {};
  const report = reportData || {};
  
  // Extract report body and type from clinical_results object or directly from report
  const clinicalResults = report.clinical_results || appt.clinical_results || {};
  
  // Sometimes the clinical_results is a string, sometimes an object
  let reportText = '';
  let reportType = 'General Report';
  
  if (typeof clinicalResults === 'object' && clinicalResults !== null) {
    reportText = clinicalResults.reportBody || report.reportBody || '';
    reportType = clinicalResults.reportType || report.reportType || appt.appointment_type || 'General Report';
  } else if (typeof clinicalResults === 'string') {
    reportText = clinicalResults;
  } else {
    reportText = report.reportBody || '';
  }
  
  if (!reportType && appt.appointment_type) {
    reportType = appt.appointment_type;
  }
  
  const parsedSections = extractSections(reportText);

  // Patient Info
  const patientName = report.patient_name || appt.patient_name || 'N/A';
  const patientAgeRaw = report.patient_age || appt.patient_age;
  const patientAge = patientAgeRaw ? `${patientAgeRaw} Years` : 'N/A';
  const patientGenderRaw = report.patient_gender || appt.patient_gender;
  const patientGender = patientGenderRaw === 'M' ? 'Male' : patientGenderRaw === 'F' ? 'Female' : 'N/A';
  const patientIdRaw = report.patient_id || appt.patient_id;
  const patientId = patientIdRaw ? `#PT-${String(patientIdRaw).padStart(4, '0')}` : 'N/A';

  // Doctor Info
  const doctorIdRaw = report.doctor_id || appt.doctor_id;
  const doctorName = report.doctor_name || appt.doctor_name || `Dr. (ID: #${doctorIdRaw || 'N/A'})`;
  const specialization = report.appointment_name || appt.appointment_name || 'Specialist';
  
  // Meta Info
  const apptDate = report.appointment_date || appt.appointment_date || 'N/A';
  const apptTime = report.appointment_time || appt.appointment_time || 'N/A';
  const apptId = report.appointment_id || appt.appointment_id;
  const reportIdStr = apptId ? `#RP-${String(apptId).padStart(5, '0')}` : 'N/A';

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="report-header">
          <div className="report-title-group">
            <div className="report-icon-box">
              <Icons.Report />
            </div>
            <div>
              <h2 className="report-title">Clinical Report</h2>
              <span className="report-badge">{reportType}</span>
            </div>
          </div>
          <div className="status-badge">
            <Icons.CheckCircle /> Reviewed
          </div>
        </div>

        {/* Patient and Doctor Cards */}
        <div className="report-info-grid">
          <div className="info-card" style={{ '--card-color': '#4d9aff' }}>
            <div className="info-card-header">
              <div className="info-card-icon">
                <Icons.User />
              </div>
              Patient Information
            </div>
            <div className="info-row">
              <span className="info-label">Name</span>
              <span className="info-value">{patientName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Age / Gender</span>
              <span className="info-value">{patientAge} / {patientGender}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Patient ID</span>
              <span className="info-value">{patientId}</span>
            </div>
          </div>

          <div className="info-card" style={{ '--card-color': '#a78bfa' }}>
            <div className="info-card-header">
              <div className="info-card-icon">
                <Icons.Stethoscope />
              </div>
              Doctor Information
            </div>
            <div className="info-row">
              <span className="info-label">Doctor Name</span>
              <span className="info-value">{doctorName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Doctor ID</span>
              <span className="info-value">#{doctorIdRaw || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Specialization</span>
              <span className="info-value">{specialization}</span>
            </div>
          </div>
        </div>

        {/* Meta Bar */}
        <div className="report-meta-bar">
          <div className="meta-item">
            <div className="meta-icon"><Icons.Calendar /></div>
            <div className="meta-details">
              <span className="meta-label">Date</span>
              <span className="meta-val">{apptDate}</span>
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-icon"><Icons.Clock /></div>
            <div className="meta-details">
              <span className="meta-label">Time</span>
              <span className="meta-val">{apptTime}</span>
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-icon" style={{ color: '#a78bfa' }}><Icons.Clipboard /></div>
            <div className="meta-details">
              <span className="meta-label">Report ID</span>
              <span className="meta-val">{reportIdStr}</span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        {loading && <div style={{ marginBottom: '24px' }}><Loader size="sm" label="Loading report details..." /></div>}
        {!loading && error && (
          <div style={{ marginBottom: '24px' }}>
            <Alert type={error === 'No report available yet.' ? 'info' : 'error'} message={error} />
          </div>
        )}
        {!loading && !error && (
          parsedSections ? (
          <>
            <AccordionSection 
              icon={Icons.Magnifier} 
              title="Findings" 
              color="#4d9aff" 
              content={parsedSections.Findings} 
              defaultOpen={true}
            />
            <AccordionSection 
              icon={Icons.Brain} 
              title="Diagnosis" 
              color="#a78bfa" 
              content={parsedSections.Diagnosis} 
              defaultOpen={true}
            />
            <AccordionSection 
              icon={Icons.ClipboardPlus} 
              title="Recommendations" 
              color="#1db87e" 
              content={parsedSections.Recommendations} 
              defaultOpen={true}
            />
            <AccordionSection 
              icon={Icons.Clipboard} 
              title="Notes (Private)" 
              color="#8aa0bc" 
              content={parsedSections.Notes} 
              defaultOpen={false}
            />
          </>
        ) : (
          <div className="raw-content">
            {reportText || "No detailed clinical results available."}
          </div>
        ))}

        {/* Actions */}
        <div className="report-actions">
          <div className="actions-left">
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <span className="btn-icon"><Icons.Download /> Download PDF</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <span className="btn-icon"><Icons.Printer /> Print</span>
            </Button>
          </div>
          <div className="actions-right">
            <Button variant="primary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClinicalReportModal;
