import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  };

  return (
    <header role="banner">
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="nav-container">
          <div className="logo">
            <Link 
              to="/" 
              onClick={closeMenu}
              aria-label="DysLexia Support - Go to homepage"
            >
              <h1>DysLexia Support</h1>
            </Link>
          </div>
          
          <button
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            onKeyDown={handleKeyDown}
            aria-expanded={isMenuOpen}
            aria-controls="nav-menu"
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <div 
            id="nav-menu"
            className={`nav-links ${isMenuOpen ? 'open' : ''}`}
            role="menu"
          >
            <Link 
              to="/database" 
              className="btn btn-admin"
              onClick={closeMenu}
              role="menuitem"
              aria-label="Admin Database Viewer"
              title="Admin access required"
            >
              🔐 Admin
            </Link>
            {location.pathname !== '/login' && (
              <Link 
                to="/login" 
                className="btn btn-outline"
                onClick={closeMenu}
                role="menuitem"
                aria-label="Sign in to your account"
              >
                Login
              </Link>
            )}
            {location.pathname !== '/register' && (
              <Link 
                to="/register" 
                className="btn btn-primary"
                onClick={closeMenu}
                role="menuitem"
                aria-label="Create a new account"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;