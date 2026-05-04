// ═══════════════════════════════════════════
//  SYNCARE — components/forms/LoginForm.jsx
// ═══════════════════════════════════════════

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signin } from '../../api/auth';
import useForm from '../../hooks/useForm';
import { validateGovId, validatePassword, required } from '../../utils/validators';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import './AuthForm.css';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [isDoctor, setIsDoctor] = useState(false);

  // Dynamic schema based on isDoctor
  const schema = {
    auth_id: isDoctor ? required : validateGovId,
    password: validatePassword,
  };

  const {
    values, errors, touched,
    submitting, serverError, serverSuccess,
    handleChange, handleBlur, handleSubmit,
    setServerError, reset
  } = useForm(
    { auth_id: '', password: '' },
    schema,
    async (vals, { setServerError, setServerSuccess }) => {
      try {
        const payload = {
          auth_id: vals.auth_id,
          password: vals.password,
          staff: isDoctor,
        };
        const res = await signin(payload);
        login(res.data, res.token);
        setServerSuccess('Signed in successfully! Redirecting…');
        setTimeout(() => navigate(from, { replace: true }), 800);
      } catch (err) {
        setServerError(err.message || 'Invalid credentials. Please try again.');
      }
    }
  );

  const toggleRole = () => {
    setIsDoctor(!isDoctor);
    reset();
    setServerError(null);
  };

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <h2>Welcome back</h2>
        <p>Sign in to manage your appointments</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
        <Button 
          type="button" 
          variant={!isDoctor ? 'primary' : 'outline'} 
          size="sm" 
          onClick={() => { if(isDoctor) toggleRole() }}
        >
          Patient
        </Button>
        <Button 
          type="button" 
          variant={isDoctor ? 'primary' : 'outline'} 
          size="sm" 
          onClick={() => { if(!isDoctor) toggleRole() }}
        >
          Doctor
        </Button>
      </div>

      <Alert type="error"   message={serverError}   onDismiss={() => setServerError(null)} />
      <Alert type="success" message={serverSuccess} />

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label={isDoctor ? "Doctor ID" : "National ID"}
          name="auth_id"
          type="text"
          placeholder={isDoctor ? "e.g. 12345" : "e.g. 29801012345678"}
          value={values.auth_id}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.auth_id}
          touched={touched.auth_id}
          required
          maxLength={isDoctor ? undefined : 14}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Min 10 characters"
          value={values.password}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/[\u0600-\u06FF\u0750-\u077F]/g, '');
            handleChange(e);
          }}
          onBlur={handleBlur}
          error={errors.password}
          touched={touched.password}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={submitting}
          className="auth-card__submit"
        >
          Sign In
        </Button>
      </form>

      {!isDoctor && (
        <p className="auth-card__footer">
          Don't have an account?{' '}
          <Link to="/signup">Create one</Link>
        </p>
      )}
    </div>
  );
};

export default LoginForm;
