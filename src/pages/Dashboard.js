import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import apiService from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getUserStats();
        setStats(response.stats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner">⟳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        <header className="dashboard-header">
          <h1>Welcome back, {user?.firstName}!</h1>
          <p>Here's your dyslexia support dashboard</p>
        </header>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Profile Information</h2>
            <div className="profile-info">
              <p><strong>Name:</strong> {user?.fullName || `${user?.firstName} ${user?.lastName}`}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>User Type:</strong> {user?.userType}</p>
              <p><strong>Email Verified:</strong> {user?.isEmailVerified ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>Account Statistics</h2>
            {stats && (
              <div className="stats-info">
                <p><strong>Member Since:</strong> {new Date(stats.accountCreated).toLocaleDateString()}</p>
                <p><strong>Last Login:</strong> {stats.lastLogin ? new Date(stats.lastLogin).toLocaleDateString() : 'Never'}</p>
                <p><strong>Social Accounts:</strong> {stats.socialAccounts}</p>
              </div>
            )}
          </div>

          <div className="dashboard-card">
            <h2>Accessibility Settings</h2>
            {user?.accessibilitySettings && (
              <div className="accessibility-info">
                <p><strong>Font Size:</strong> {user.accessibilitySettings.fontSize}</p>
                <p><strong>High Contrast:</strong> {user.accessibilitySettings.highContrast ? 'On' : 'Off'}</p>
                <p><strong>Reduced Motion:</strong> {user.accessibilitySettings.reducedMotion ? 'On' : 'Off'}</p>
                <p><strong>Dyslexia Font:</strong> {user.accessibilitySettings.dyslexiaFont ? 'On' : 'Off'}</p>
              </div>
            )}
          </div>

          <div className="dashboard-card">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <Button variant="primary" size="medium">
                Update Profile
              </Button>
              <Button variant="secondary" size="medium">
                Accessibility Settings
              </Button>
              <Button variant="outline" size="medium" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;