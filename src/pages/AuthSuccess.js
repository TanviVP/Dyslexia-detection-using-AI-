import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const token = searchParams.get('token');
      
      if (token) {
        try {
          // Set the token
          apiService.setToken(token);
          
          // Get user data
          const response = await apiService.getCurrentUser();
          updateUser(response.user);
          
          // Redirect to dashboard
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error('Auth success error:', error);
          navigate('/login?error=auth_failed', { replace: true });
        }
      } else {
        navigate('/login?error=no_token', { replace: true });
      }
    };

    handleAuthSuccess();
  }, [searchParams, navigate, updateUser]);

  return (
    <div className="auth-success-container">
      <div className="loading-container">
        <div className="loading-spinner">⟳</div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;