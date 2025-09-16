const fallbackDB = require('../routes/fallback-db');

const adminAuth = async (req, res, next) => {
  try {
    // For demo purposes, we'll use a simple admin check
    // In production, you'd verify JWT token and check admin status
    const adminEmail = req.headers['admin-email'];
    
    if (!adminEmail) {
      return res.status(401).json({ 
        message: 'Admin authentication required',
        error: 'Missing admin credentials'
      });
    }
    
    // Check if user is admin
    const user = await fallbackDB.findUser({ email: adminEmail, isAdmin: true });
    
    if (!user) {
      return res.status(403).json({ 
        message: 'Access denied',
        error: 'Admin privileges required'
      });
    }
    
    req.admin = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      error: error.message 
    });
  }
};

module.exports = adminAuth;