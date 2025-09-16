import React, { useState } from 'react';

const FormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  error,
  helpText,
  options = [],
  placeholder,
  autoComplete,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderField = () => {
    const commonProps = {
      id: fieldId,
      value,
      onChange,
      required,
      placeholder,
      autoComplete,
      'aria-describedby': `${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined,
      'aria-invalid': error ? 'true' : 'false',
      ...props
    };

    if (type === 'select') {
      return (
        <select {...commonProps}>
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'password') {
      return (
        <div className="password-field">
          <input
            {...commonProps}
            type={showPassword ? 'text' : 'password'}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex="0"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      );
    }

    return <input {...commonProps} type={type} />;
  };

  return (
    <div className="form-group">
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span className="required-indicator" aria-label="required">*</span>}
      </label>
      
      {renderField()}
      
      {helpText && (
        <div id={helpId} className="form-help" role="note">
          {helpText}
        </div>
      )}
      
      {error && (
        <div id={errorId} className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
};

export default FormField;