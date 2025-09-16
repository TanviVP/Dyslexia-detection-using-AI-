import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FormField from '../components/FormField';
import Checkbox from '../components/Checkbox';
import Button from '../components/Button';
import SocialAuth from '../components/SocialAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, error: authError, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Handle URL error parameters
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      let errorMessage = 'Authentication failed';
      switch (error) {
        case 'google_auth_failed':
          errorMessage = 'Google authentication failed';
          break;
        case 'facebook_auth_failed':
          errorMessage = 'Facebook authentication failed';
          break;
        case 'github_auth_failed':
          errorMessage = 'GitHub authentication failed';
          break;
        case 'linkedin_auth_failed':
          errorMessage = 'LinkedIn authentication failed';
          break;
        case 'auth_callback_failed':
          errorMessage = 'Authentication callback failed';
          break;
        case 'auth_failed':
          errorMessage = 'Authentication failed';
          break;
        case 'no_token':
          errorMessage = 'No authentication token received';
          break;
        default:
          errorMessage = 'Authentication failed';
      }
      setErrors({ submit: errorMessage });
    }
  }, [searchParams]);

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Focus on first error field
      const firstErrorField = Object.keys(newErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await login(formData);
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (error) {
      setErrors({ submit: error.message || 'Login failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-main">
      <div className="auth-container">
        <div className="auth-card">
          <header className="auth-header">
            <h1>Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account</p>
          </header>

          <SocialAuth type="login" />
          
          <form 
            className="auth-form" 
            onSubmit={handleSubmit}
            noValidate
            aria-label="Login form"
          >
            {(errors.submit || authError) && (
              <div className="form-error" role="alert" aria-live="assertive">
                {errors.submit || authError}
              </div>
            )}
            
            <FormField
              id="email"
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
              autoComplete="email"
              placeholder="Enter your email"
            />
            
            <FormField
              id="password"
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              error={errors.password}
              autoComplete="current-password"
              placeholder="Enter your password"
            />
            
            <div className="form-options">
              <Checkbox
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                label="Remember me"
              />
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              size="large"
              className="btn-full"
              disabled={isSubmitting}
              ariaLabel={isSubmitting ? 'Signing in...' : 'Sign in to your account'}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <footer className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" aria-label="Go to registration page">
                Sign up here
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;