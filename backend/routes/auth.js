const express = require('express');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const fallbackDB = require('./fallback-db');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password must contain both letters and numbers'),
  body('userType')
    .isIn(['individual', 'parent', 'educator', 'professional', 'researcher', 'admin'])
    .withMessage('Please select a valid user type')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register endpoint
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, userType, newsletter } = req.body;

    // Map frontend user types to database user types
    const userTypeMapping = {
      'individual': 'individual_with_dyslexia',
      'parent': 'parent',
      'educator': 'educator_teacher',
      'professional': 'healthcare_professional',
      'researcher': 'researcher',
      'admin': 'admin'
    };
    
    const mappedUserType = userTypeMapping[userType] || userType;

    // Use fallback database directly since MongoDB is not available
    console.log('Using fallback database for registration');
    
    // Check if user already exists
    const existingUser = await fallbackDB.findUser({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists with this email'
      });
    }

    // Hash password for fallback database
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user data for fallback database
    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userType: mappedUserType,
      newsletterSubscribed: newsletter || false,
      isEmailVerified: false,
      isAdmin: false,
      accessibilitySettings: {
        fontSize: 'medium',
        fontFamily: 'Arial',
        highContrast: false,
        reducedMotion: false
      },
      socialAccounts: [],
      lastLogin: new Date()
    };

    const newUser = await fallbackDB.addUser(userData);
    const token = generateToken(newUser._id);
    
    // Remove password from response
    delete newUser.password;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, remember } = req.body;

    // Use fallback database directly since MongoDB is not available
    console.log('Using fallback database for login');
    
    const user = await fallbackDB.findUser({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Update last login in fallback database
    const users = await fallbackDB.readUsers();
    const userIndex = users.findIndex(u => u._id === user._id);
    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date();
      await fallbackDB.writeUsers(users);
    }

    // Generate token (longer expiry if remember me is checked)
    const tokenExpiry = remember ? '30d' : '7d';
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: tokenExpiry }
    );

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Remove password from response
    const userResponse = { ...req.user };
    delete userResponse.password;
    
    res.json({
      user: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Failed to get user information'
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more complex setup, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Logout failed'
    });
  }
});

// Social authentication routes

// Google OAuth
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed` }),
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);
      
      // Update last login
      req.user.lastLogin = new Date();
      await req.user.save();
      
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_callback_failed`);
    }
  }
);

// Facebook OAuth
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=facebook_auth_failed` }),
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);
      req.user.lastLogin = new Date();
      await req.user.save();
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Facebook auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_callback_failed`);
    }
  }
);

// GitHub OAuth
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_auth_failed` }),
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);
      req.user.lastLogin = new Date();
      await req.user.save();
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('GitHub auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_callback_failed`);
    }
  }
);

// LinkedIn OAuth
router.get('/linkedin',
  passport.authenticate('linkedin')
);

router.get('/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=linkedin_auth_failed` }),
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);
      req.user.lastLogin = new Date();
      await req.user.save();
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('LinkedIn auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_callback_failed`);
    }
  }
);

module.exports = router;