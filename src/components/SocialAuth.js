import React from 'react';
import SocialAuthButton from './SocialAuthButton';

const SocialAuth = ({ type = 'login' }) => {
  const [loadingProvider, setLoadingProvider] = React.useState(null);
  const socialProviders = [
    {
      name: 'Google',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      ),
      bgColor: '#fff',
      textColor: '#757575',
      borderColor: '#dadce0'
    },
    {
      name: 'Facebook',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M24 12C24 5.373 18.627 0 12 0S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.49 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill="#1877F2"/>
          <path d="M16.671 15.47L17.203 12h-3.328V9.749c0-.949.466-1.874 1.956-1.874h1.513V4.922s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669V12H7.078v3.47h3.047v8.385a12.134 12.134 0 003.75 0V15.47h2.796z" fill="#fff"/>
        </svg>
      ),
      bgColor: '#1877F2',
      textColor: '#fff',
      borderColor: '#1877F2'
    },
    {
      name: 'Microsoft',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#F25022"/>
          <path d="M24 11.4H12.6V0H24v11.4z" fill="#7FBA00"/>
          <path d="M11.4 24H0V12.6h11.4V24z" fill="#00A4EF"/>
          <path d="M24 24H12.6V12.6H24V24z" fill="#FFB900"/>
        </svg>
      ),
      bgColor: '#fff',
      textColor: '#5E5E5E',
      borderColor: '#8C8C8C'
    },
    {
      name: 'Apple',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000"/>
        </svg>
      ),
      bgColor: '#000',
      textColor: '#fff',
      borderColor: '#000'
    },
    {
      name: 'GitHub',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      bgColor: '#333',
      textColor: '#fff',
      borderColor: '#333'
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
        </svg>
      ),
      bgColor: '#0A66C2',
      textColor: '#fff',
      borderColor: '#0A66C2'
    }
  ];

  const handleSocialLogin = async (provider) => {
    setLoadingProvider(provider);
    
    try {
      // Redirect to backend OAuth endpoint
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const authUrl = `${backendUrl}/auth/${provider.toLowerCase()}`;
      
      // Redirect to OAuth provider
      window.location.href = authUrl;
      
    } catch (error) {
      console.error(`${type} with ${provider} failed:`, error);
      setLoadingProvider(null);
      // Handle error (show toast, etc.)
    }
  };

  const actionText = type === 'login' ? 'Sign in' : 'Sign up';

  return (
    <div className="social-auth">
      <div className="social-divider">
        <span className="divider-text">Or {actionText} with</span>
      </div>
      
      <div className="social-buttons" role="group" aria-label={`${actionText} with social providers`}>
        {socialProviders.map((provider) => (
          <SocialAuthButton
            key={provider.name}
            provider={provider}
            onClick={handleSocialLogin}
            actionText={actionText}
            isLoading={loadingProvider === provider.name}
            disabled={loadingProvider !== null}
          />
        ))}
      </div>
      
      <div className="social-note">
        <p>
          By continuing, you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default SocialAuth;