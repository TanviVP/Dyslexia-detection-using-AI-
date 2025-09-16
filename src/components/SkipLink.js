import React from 'react';

const SkipLink = () => {
  const handleSkipToMain = (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };

  return (
    <a 
      href="#main-content" 
      className="skip-link"
      onClick={handleSkipToMain}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSkipToMain(e);
        }
      }}
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;