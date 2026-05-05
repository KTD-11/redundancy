// ═══════════════════════════════════════════
//  SYNCARE — components/ui/Navbar.jsx
// ═══════════════════════════════════════════

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from './Button';
import './Navbar.css';

const Navbar = ({ theme, onToggleTheme }) => {
  const { isLoggedIn, isDoctor, user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDrawerOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = isLoggedIn
    ? [
        { to: '/dashboard', label: t('dashboard') },
        { to: '/about', label: 'About Us' },
        { to: '/map', label: '3D Map' },
        { to: '/appointments/book', label: t('bookAppointment') },
        { to: '/appointments', label: t('myAppointments') },
      ]
    : [
        { to: '/', label: t('home') || 'Home' },
        { to: '/about', label: 'About Us' },
        { to: '/map', label: '3D Map' },
        { to: '/login', label: t('signIn') },
        { to: '/signup', label: t('register') },
      ];

  return (
    <>
      <nav className="sc-nav">
        <Link to="/" className="sc-nav__brand" onClick={() => setDrawerOpen(false)}>
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="SynCare Logo" className="sc-nav__logo-img" style={{ height: '40px', width: 'auto', marginRight: '10px' }} />
          <span className="sc-nav__logo-text">
            Syn<span>Care</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="sc-nav__links">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`sc-nav__link ${isActive(to) ? 'sc-nav__link--active' : ''}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="sc-nav__controls">
          {isLoggedIn && (
            <span className="sc-nav__user">
              👤 {isDoctor ? `Dr. ${user?.doctor_name}` : (user?.patient_name || t('patient'))}
            </span>
          )}

          <button
            className="sc-nav__lang-toggle"
            onClick={toggleLanguage}
            aria-label="Toggle language"
            title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 8px', color: 'var(--text)' }}
          >
            {lang === 'en' ? 'ع' : 'EN'}
          </button>

          <button
            className="sc-nav__theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          />

          {isLoggedIn ? (
            <Button variant="danger" size="sm" onClick={handleLogout} className="sc-nav__cta-desktop">
              {t('signOut')}
            </Button>
          ) : (
            <Link to="/signup" className="sc-nav__cta-desktop">
              <Button variant="primary" size="sm" className="sc-nav__cta">
                {t('getStarted')}
              </Button>
            </Link>
          )}

          {/* Hamburger */}
          <button
            className={`sc-nav__hamburger ${drawerOpen ? 'sc-nav__hamburger--open' : ''}`}
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={drawerOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="sc-nav__drawer">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="sc-nav__drawer-link"
              onClick={() => setDrawerOpen(false)}
            >
              {label}
            </Link>
          ))}
          {isLoggedIn && (
            <button className="sc-nav__drawer-link sc-nav__drawer-signout" onClick={handleLogout}>
              {t('signOut')}
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
