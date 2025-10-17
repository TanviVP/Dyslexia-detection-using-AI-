import React, { useState } from 'react';

const AdminLogin = ({ onAdminLogin, onClose }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Authorized admin users (only 4 people)
  const authorizedAdmins = [
    { email: 'admin@dyslexia-support.com', password: 'admin123', name: 'System Admin' },
    { email: 'john.admin@dyslexia-support.com', password: 'john123', name: 'John Admin' },
    { email: 'jane.admin@dyslexia-support.com', password: 'jane123', name: 'Jane Admin' },
    { email: 'mike.admin@dyslexia-support.com', password: 'mike123', name: 'Mike Admin' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if credentials match any authorized admin
      const admin = authorizedAdmins.find(
        admin => admin.email === credentials.email && admin.password === credentials.password
      );

      if (admin) {
        // Store admin session
        localStorage.setItem('adminSession', JSON.stringify({
          email: admin.email,
          name: admin.name,
          loginTime: new Date().toISOString()
        }));
        
        onAdminLogin(admin);
      } else {
        setError('Invalid admin credentials. Access denied.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-modal">
        <div className="admin-login-header">
          <h2>🔐 Admin Access Required</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="admin-login-content">
          <p>Only authorized administrators can access the database viewer.</p>
          
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                required
                placeholder="Enter admin email"
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Admin Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
            </div>
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            <div className="admin-login-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Login as Admin'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
          
          <div className="admin-info">
            <h4>Demo Admin Credentials:</h4>
            <ul>
              <li><strong>Email:</strong> admin@dyslexia-support.com</li>
              <li><strong>Password:</strong> admin123</li>
            </ul>
            <p><small>Note: Only 4 authorized admin accounts can access this system.</small></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;