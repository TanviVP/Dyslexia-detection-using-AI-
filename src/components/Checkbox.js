import React from 'react';

const Checkbox = ({
  id,
  label,
  checked,
  onChange,
  required = false,
  error,
  children,
  ...props
}) => {
  const fieldId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;

  return (
    <div className="checkbox-group">
      <label htmlFor={fieldId} className="checkbox-label">
        <input
          type="checkbox"
          id={fieldId}
          checked={checked}
          onChange={onChange}
          required={required}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        <span className="checkmark" aria-hidden="true"></span>
        <span className="checkbox-text">
          {label || children}
          {required && <span className="required-indicator" aria-label="required">*</span>}
        </span>
      </label>
      
      {error && (
        <div id={errorId} className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
};

export default Checkbox;