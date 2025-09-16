const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic user information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.socialAccounts || this.socialAccounts.length === 0;
    },
    minlength: 8
  },
  
  // User type and preferences
  userType: {
    type: String,
    required: true,
    enum: ['individual', 'parent', 'educator', 'professional', 'researcher']
  },
  
  // Account settings
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Newsletter and communication preferences
  newsletterSubscribed: {
    type: Boolean,
    default: false
  },
  communicationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  
  // Social authentication
  socialAccounts: [{
    provider: {
      type: String,
      enum: ['google', 'facebook', 'github', 'linkedin', 'microsoft', 'apple']
    },
    providerId: String,
    email: String,
    displayName: String,
    profilePicture: String
  }],
  
  // Profile information
  profile: {
    bio: { type: String, maxlength: 500 },
    location: { type: String, maxlength: 100 },
    website: { type: String, maxlength: 200 },
    profilePicture: String,
    dateOfBirth: Date,
    phoneNumber: String
  },
  
  // Accessibility preferences
  accessibilitySettings: {
    fontSize: { type: String, enum: ['small', 'medium', 'large', 'extra-large'], default: 'medium' },
    highContrast: { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false },
    screenReader: { type: Boolean, default: false },
    dyslexiaFont: { type: Boolean, default: true }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Indexes for performance (email index is handled by unique: true)
userSchema.index({ 'socialAccounts.provider': 1, 'socialAccounts.providerId': 1 });
userSchema.index({ createdAt: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to add social account
userSchema.methods.addSocialAccount = function(provider, profile) {
  const existingAccount = this.socialAccounts.find(acc => 
    acc.provider === provider && acc.providerId === profile.id
  );
  
  if (!existingAccount) {
    this.socialAccounts.push({
      provider: provider,
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      displayName: profile.displayName,
      profilePicture: profile.photos?.[0]?.value
    });
  }
  
  return this.save();
};

// Static method to find user by social account
userSchema.statics.findBySocialAccount = function(provider, providerId) {
  return this.findOne({
    'socialAccounts.provider': provider,
    'socialAccounts.providerId': providerId
  });
};

// Transform output (remove sensitive data)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);