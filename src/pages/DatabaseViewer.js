import React, { useState } from 'react';
import api from '../services/api';

const DatabaseViewer = () => {
  const [users, setUsers] = useState([]);
  const [usersByType, setUsersByType] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('parent');
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const userTypes = [
    { key: 'parent', label: 'Parents', icon: '👨‍👩‍👧‍👦' },
    { key: 'individual_with_dyslexia', label: 'Individuals with Dyslexia', icon: '🧠' },
    { key: 'educator_teacher', label: 'Educators & Teachers', icon: '👩‍🏫' },
    { key: 'healthcare_professional', label: 'Healthcare Professionals', icon: '👩‍⚕️' },
    { key: 'researcher', label: 'Researchers', icon: '🔬' },
    { key: 'admin', label: 'Administrators', icon: '⚙️' }
  ];

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    
    // Simple admin credentials check
    if (adminEmail === 'admin@dyslexia-support.com' && adminPassword === 'admin123') {
      setIsAdmin(true);
      await fetchData();
    } else {
      setLoginError('Invalid admin credentials. Use: admin@dyslexia-support.com / admin123');
      setLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminEmail('');
    setAdminPassword('');
    setError(null);
    setUsers([]);
    setUsersByType({});
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Set admin header for authentication
      const adminHeaders = {
        'admin-email': 'admin@dyslexia-support.com'
      };
      
      console.log('Making API request to /admin/users with headers:', adminHeaders);
      
      // Direct fetch to test connectivity
      const directResponse = await fetch('http://localhost:5000/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'admin-email': 'admin@dyslexia-support.com'
        }
      });
      
      if (!directResponse.ok) {
        throw new Error(`HTTP error! status: ${directResponse.status}`);
      }
      
      const usersResponse = await directResponse.json();
      console.log('API Response:', usersResponse);
      
      const allUsers = usersResponse.users || [];
      console.log('Extracted users:', allUsers);
      
      setUsers(allUsers);
      
      // Group users by type
      const usersByTypeData = {};
      userTypes.forEach(type => {
        usersByTypeData[type.key] = allUsers.filter(user => user.userType === type.key);
      });
      setUsersByType(usersByTypeData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      setError(`Failed to load database: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderUserCard = (user) => (
    <div key={user._id} className="user-card">
      <div className="user-header">
        <h3>{user.firstName} {user.lastName}</h3>
        <div className="user-badges">
          <span className={`status ${user.isEmailVerified ? 'verified' : 'unverified'}`}>
            {user.isEmailVerified ? 'Verified' : 'Unverified'}
          </span>
          {user.isAdmin && <span className="status admin">Admin</span>}
        </div>
      </div>
      <div className="user-details">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User Type:</strong> {user.userType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
        <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        
        {user.socialAccounts && user.socialAccounts.length > 0 && (
          <div className="social-accounts">
            <strong>Social Accounts:</strong>
            <div className="social-list">
              {user.socialAccounts.map((account, index) => (
                <span key={index} className="social-badge">
                  {account.provider}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {user.accessibilitySettings && (
          <div className="accessibility-settings">
            <strong>Accessibility Settings:</strong>
            <ul>
              <li>Font Size: {user.accessibilitySettings.fontSize}</li>
              <li>Font Family: {user.accessibilitySettings.fontFamily}</li>
              <li>High Contrast: {user.accessibilitySettings.highContrast ? 'Yes' : 'No'}</li>
              <li>Reduced Motion: {user.accessibilitySettings.reducedMotion ? 'Yes' : 'No'}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  // Show login form if not admin
  if (!isAdmin) {
    return (
      <div className="database-viewer">
        <div className="container">
          <div className="admin-login-container">
            <div className="admin-login-card">
              <div className="admin-login-header">
                <h1>🔐 Admin Access Required</h1>
                <p>Please login with admin credentials to view the database</p>
              </div>
              
              <form onSubmit={handleAdminLogin} className="admin-login-form">
                <div className="form-group">
                  <label htmlFor="adminEmail" className="form-label">Admin Email</label>
                  <input
                    type="email"
                    id="adminEmail"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@dyslexia-support.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="adminPassword" className="form-label">Admin Password</label>
                  <input
                    type="password"
                    id="adminPassword"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                </div>
                
                {loginError && (
                  <div className="login-error">
                    <p>{loginError}</p>
                  </div>
                )}
                
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login as Admin'}
                </button>
              </form>
              
              <div className="demo-credentials">
                <h3>Demo Credentials:</h3>
                <p><strong>Email:</strong> admin@dyslexia-support.com</p>
                <p><strong>Password:</strong> admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="database-viewer">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner">⏳</div>
            <p>Loading database information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="database-viewer">
        <div className="container">
          <div className="db-header">
            <h1>Database Viewer</h1>
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchData} className="btn btn-primary">
                Try Again
              </button>
              <button onClick={handleAdminLogout} className="btn btn-secondary">
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeUserType = userTypes.find(type => type.key === activeTab);
  const activeUsers = usersByType[activeTab] || [];

  return (
    <div className="database-viewer">
      <div className="container">
        <div className="db-header">
          <div className="admin-header-content">
            <div className="admin-title">
              <h1>🔐 Admin Database Viewer</h1>
              <p>Manage and view user database entries by category</p>
            </div>
            <div className="admin-controls">
              <div className="admin-badge">
                <span>👤 Admin Access</span>
              </div>
              <button onClick={handleAdminLogout} className="btn btn-secondary admin-logout">
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="db-tabs">
          {userTypes.map((type) => (
            <button 
              key={type.key}
              className={`tab-btn ${activeTab === type.key ? 'active' : ''}`}
              onClick={() => setActiveTab(type.key)}
            >
              <span className="tab-icon">{type.icon}</span>
              <span className="tab-label">{type.label}</span>
              <span className="tab-count">({usersByType[type.key]?.length || 0})</span>
            </button>
          ))}
        </div>

        <div className="users-section">
          <div className="section-header">
            <h2>
              {activeUserType?.icon} {activeUserType?.label}
              <span className="user-count">({activeUsers.length} users)</span>
            </h2>
          </div>
          
          {activeUsers.length === 0 ? (
            <div className="no-data">
              <p>No {activeUserType?.label.toLowerCase()} found in the database.</p>
            </div>
          ) : (
            <div className="users-grid">
              {activeUsers.map(renderUserCard)}
            </div>
          )}
        </div>

        <div className="stats-summary">
          <h3>📊 Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Users</h4>
              <div className="stat-number">{users.length}</div>
            </div>
            <div className="stat-card">
              <h4>Verified Users</h4>
              <div className="stat-number">{users.filter(u => u.isEmailVerified).length}</div>
            </div>
            <div className="stat-card">
              <h4>With Social Auth</h4>
              <div className="stat-number">{users.filter(u => u.socialAccounts?.length > 0).length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseViewer;