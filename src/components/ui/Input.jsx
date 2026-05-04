// ═══════════════════════════════════════════
//  SYNCARE — components/ui/Input.jsx
// ═══════════════════════════════════════════

import React, { useState } from 'react';
import './Input.css';

/**
 * Reusable Input / Select / Textarea
 * Props:
 *   label, name, error, touched, type, as ('input'|'select'|'textarea'), ...rest
 */
const Input = ({
  label,
  name,
  error,
  touched,
  as: Tag = 'input',
  type,
  children,
  required: isRequired,
  className = '',
  ...rest
}) => {
  const hasError = touched && error;
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`sc-field ${hasError ? 'sc-field--error' : ''} ${className}`} style={{ position: 'relative' }}>
      {label && (
        <label htmlFor={name} className="sc-field__label">
          {label}
          {isRequired && <span className="sc-field__req" aria-hidden="true"> *</span>}
        </label>
      )}
      <Tag
        id={name}
        name={name}
        type={inputType}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={hasError ? `${name}-err` : undefined}
        className="sc-field__control"
        style={type === 'password' ? { paddingRight: '60px' } : {}}
        {...rest}
      >
        {children}
      </Tag>
      
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(p => !p)}
          tabIndex="-1"
          style={{
            position: 'absolute',
            right: '12px',
            top: label ? '36px' : '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: 'var(--color-primary, #007bff)',
            fontWeight: '600'
          }}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      )}

      {hasError && (
        <p id={`${name}-err`} className="sc-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
