import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ 
  children, 
  to, 
  href, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  ariaLabel,
  className = '',
  ...props 
}) => {
  const baseClasses = `btn btn-${variant} btn-${size}`;
  const classes = `${baseClasses} ${className}`.trim();

  const commonProps = {
    className: classes,
    'aria-label': ariaLabel,
    disabled,
    ...props
  };

  if (to) {
    return (
      <Link to={to} {...commonProps}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} {...commonProps}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} {...commonProps}>
      {children}
    </button>
  );
};

export default Button;