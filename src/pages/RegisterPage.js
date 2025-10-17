import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FormField from '../components/FormField';
import Checkbox from '../components/Checkbox';
import Button from '../components/Button';
import SocialAuth from '../components/SocialAuth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, error: authError, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    terms: false,
    newsletter: false
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

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const userTypeOptions = [
    { value: 'individual', label: 'Individual with dyslexia' },
    { value: 'parent', label: 'Parent/Guardian' },
    { value: 'educator', label: 'Educator/Teacher' },
    { value: 'professional', label: 'Healthcare Professional' },
    { value: 'researcher', label: 'Researcher' }
  ];

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
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain both letters and numbers';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.userType) {
      newErrors.userType = 'Please select your role';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'You must agree to the terms of service';
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
      // Prepare data for backend (exclude confirmPassword)
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (error) {
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-main">
      <div className="auth-container">
        <div className="auth-card">
          <header className="auth-header">
            <h1>Join Our Community</h1>
            <p className="auth-subtitle">Create your account to get started</p>
          </header>

          <SocialAuth type="register" />
          
          <form 
            className="auth-form" 
            onSubmit={handleSubmit}
            noValidate
            aria-label="Registration form"
          >
            {(errors.submit || authError) && (
              <div className="form-error" role="alert" aria-live="assertive">
                {errors.submit || authError}
              </div>
            )}
            
            <div className="form-row">
              <FormField
                id="firstName"
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                error={errors.firstName}
                autoComplete="given-name"
                placeholder="Enter your first name"
              />
              
              <FormField
                id="lastName"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                error={errors.lastName}
                autoComplete="family-name"
                placeholder="Enter your last name"
              />
            </div>
            
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
              autoComplete="new-password"
              helpText="At least 8 characters with letters and numbers"
              placeholder="Create a password"
            />
            
            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={errors.confirmPassword}
              autoComplete="new-password"
              placeholder="Confirm your password"
            />
            
            <FormField
              id="userType"
              label="I am a:"
              type="select"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
              error={errors.userType}
              options={userTypeOptions}
            />
            
            <Checkbox
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              required
              error={errors.terms}
            >
              I agree to the{' '}
              <Link to="/terms" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </Link>
            </Checkbox>
            
            <Checkbox
              id="newsletter"
              name="newsletter"
              checked={formData.newsletter}
              onChange={handleChange}
              label="Send me updates and resources via email"
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              size="large"
              className="btn-full"
              disabled={isSubmitting}
              ariaLabel={isSubmitting ? 'Creating account...' : 'Create your account'}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <footer className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" aria-label="Go to login page">
                Sign in here
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;