const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireEmailVerification } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to get user profile'
    });
  }
});

// Update user profile
router.put('/profile', [
  authenticateToken,
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('userType')
    .optional()
    .isIn(['individual', 'parent', 'educator', 'professional', 'researcher'])
    .withMessage('Please select a valid user type'),
  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('profile.location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('profile.website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = [
      'firstName', 'lastName', 'userType', 'newsletterSubscribed',
      'communicationPreferences', 'profile', 'accessibilitySettings'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update accessibility settings
router.put('/accessibility', [
  authenticateToken,
  body('fontSize')
    .optional()
    .isIn(['small', 'medium', 'large', 'extra-large'])
    .withMessage('Invalid font size'),
  body('highContrast')
    .optional()
    .isBoolean()
    .withMessage('High contrast must be a boolean'),
  body('reducedMotion')
    .optional()
    .isBoolean()
    .withMessage('Reduced motion must be a boolean'),
  body('screenReader')
    .optional()
    .isBoolean()
    .withMessage('Screen reader must be a boolean'),
  body('dyslexiaFont')
    .optional()
    .isBoolean()
    .withMessage('Dyslexia font must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { accessibilitySettings: req.body } },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Accessibility settings updated successfully',
      accessibilitySettings: user.accessibilitySettings
    });

  } catch (error) {
    console.error('Update accessibility error:', error);
    res.status(500).json({
      message: 'Failed to update accessibility settings'
    });
  }
});

// Change password
router.put('/password', [
  authenticateToken,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('New password must contain both letters and numbers')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Current password is incorrect'
      });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Failed to change password'
    });
  }
});

// Delete account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      message: 'Failed to delete account'
    });
  }
});

// Get user statistics (for dashboard)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    const stats = {
      accountCreated: user.createdAt,
      lastLogin: user.lastLogin,
      emailVerified: user.isEmailVerified,
      socialAccounts: user.socialAccounts.length,
      userType: user.userType,
      accessibilitySettings: user.accessibilitySettings
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Failed to get user statistics'
    });
  }
});

module.exports = router;