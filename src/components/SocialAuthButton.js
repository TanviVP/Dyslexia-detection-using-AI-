import React from 'react';

const SocialAuthButton = ({ provider, onClick, actionText, isLoading = false, disabled = false }) => {
  const handleClick = () => {
    if (!disabled && !isLoading) {
      onClick(provider.name);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      className={`social-btn ${isLoading ? 'loading' : ''}`}
      style={{
        backgroundColor: provider.bgColor,
        color: provider.textColor,
        borderColor: provider.borderColor,
        opacity: disabled && !isLoading ? 0.6 : 1
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={isLoading ? `Signing in with ${provider.name}...` : `${actionText} with ${provider.name}`}
    >
      {isLoading ? (
        <>
          <span className="loading-spinner" aria-hidden="true">⟳</span>
          <span className="social-text">Connecting...</span>
        </>
      ) : (
        <>
          <span className="social-icon" aria-hidden="true">
            {provider.icon}
          </span>
          <span className="social-text">
            {provider.name}
          </span>
        </>
      )}
    </button>
  );
};

export default SocialAuthButton;