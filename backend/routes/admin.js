const express = require('express');
const User = require('../models/User');
const fallbackDB = require('./fallback-db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(adminAuth);

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    let users;
    try {
      // Try MongoDB first
      users = await User.find({})
        .select('-password -emailVerificationToken -passwordResetToken')
        .sort({ createdAt: -1 });
    } catch (mongoError) {
      console.log('MongoDB not available, using fallback database');
      // Use fallback database
      users = await fallbackDB.getAllUsers();
    }
    
    res.json({
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get users by type (admin only)
router.get('/users/by-type/:userType', async (req, res) => {
  try {
    const { userType } = req.params;
    let users;
    
    try {
      // Try MongoDB first
      users = await User.find({ userType })
        .select('-password -emailVerificationToken -passwordResetToken')
        .sort({ createdAt: -1 });
    } catch (mongoError) {
      console.log('MongoDB not available, using fallback database');
      // Use fallback database
      const allUsers = await fallbackDB.getAllUsers();
      users = allUsers.filter(user => user.userType === userType);
    }
    
    res.json({
      userType,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Get users by type error:', error);
    res.status(500).json({
      message: 'Failed to fetch users by type',
      error: error.message
    });
  }
});

// Get user types summary (admin only)
router.get('/user-types', async (req, res) => {
  try {
    let userTypes;
    
    try {
      // Try MongoDB first
      userTypes = await User.aggregate([
        {
          $group: {
            _id: '$userType',
            count: { $sum: 1 },
            verified: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
            unverified: { $sum: { $cond: ['$isEmailVerified', 0, 1] } }
          }
        },
        { $sort: { count: -1 } }
      ]);
    } catch (mongoError) {
      console.log('MongoDB not available, using fallback database');
      // Use fallback database
      const allUsers = await fallbackDB.getAllUsers();
      const typeMap = {};
      
      allUsers.forEach(user => {
        if (!typeMap[user.userType]) {
          typeMap[user.userType] = { count: 0, verified: 0, unverified: 0 };
        }
        typeMap[user.userType].count++;
        if (user.isEmailVerified) {
          typeMap[user.userType].verified++;
        } else {
          typeMap[user.userType].unverified++;
        }
      });
      
      userTypes = Object.entries(typeMap).map(([type, data]) => ({
        _id: type,
        ...data
      })).sort((a, b) => b.count - a.count);
    }
    
    res.json({
      userTypes
    });
  } catch (error) {
    console.error('Get user types error:', error);
    res.status(500).json({
      message: 'Failed to fetch user types',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -emailVerificationToken -passwordResetToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Get database statistics
router.get('/stats', async (req, res) => {
  try {
    let stats;
    try {
      // Try MongoDB first
      const totalUsers = await User.countDocuments();
      const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
      const usersByType = await User.aggregate([
        {
          $group: {
            _id: '$userType',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const socialAccounts = await User.aggregate([
        { $unwind: '$socialAccounts' },
        {
          $group: {
            _id: '$socialAccounts.provider',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const recentUsers = await User.find({})
        .select('firstName lastName email createdAt userType')
        .sort({ createdAt: -1 })
        .limit(5);
      
      stats = {
        totalUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        usersByType,
        socialAccounts,
        recentUsers
      };
    } catch (mongoError) {
      console.log('MongoDB not available, using fallback database');
      // Use fallback database
      const fallbackStats = await fallbackDB.getUserStats();
      const users = await fallbackDB.getAllUsers();
      
      stats = {
        ...fallbackStats,
        usersByType: [],
        socialAccounts: [],
        recentUsers: users.slice(0, 5)
      };
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const { q, type, verified } = req.query;
    let query = {};
    
    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (type) {
      query.userType = type;
    }
    
    if (verified !== undefined) {
      query.isEmailVerified = verified === 'true';
    }
    
    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      message: 'Failed to search users',
      error: error.message
    });
  }
});

module.exports = router;