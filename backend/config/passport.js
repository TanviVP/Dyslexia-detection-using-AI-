const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google account
      let user = await User.findBySocialAccount('google', profile.id);
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user exists with same email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email: email });
        if (user) {
          // Add Google account to existing user
          await user.addSocialAccount('google', profile);
          return done(null, user);
        }
      }
      
      // Create new user
      const newUser = new User({
        firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
        lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
        email: email,
        userType: 'individual', // Default type
        isEmailVerified: true, // Google emails are verified
        socialAccounts: [{
          provider: 'google',
          providerId: profile.id,
          email: email,
          displayName: profile.displayName,
          profilePicture: profile.photos?.[0]?.value
        }]
      });
      
      await newUser.save();
      done(null, newUser);
    } catch (error) {
      done(error, null);
    }
  }));
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'name', 'emails', 'photos']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findBySocialAccount('facebook', profile.id);
      
      if (user) {
        return done(null, user);
      }
      
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email: email });
        if (user) {
          await user.addSocialAccount('facebook', profile);
          return done(null, user);
        }
      }
      
      const newUser = new User({
        firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
        lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
        email: email,
        userType: 'individual',
        isEmailVerified: !!email,
        socialAccounts: [{
          provider: 'facebook',
          providerId: profile.id,
          email: email,
          displayName: profile.displayName,
          profilePicture: profile.photos?.[0]?.value
        }]
      });
      
      await newUser.save();
      done(null, newUser);
    } catch (error) {
      done(error, null);
    }
  }));
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findBySocialAccount('github', profile.id);
      
      if (user) {
        return done(null, user);
      }
      
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email: email });
        if (user) {
          await user.addSocialAccount('github', profile);
          return done(null, user);
        }
      }
      
      const newUser = new User({
        firstName: profile.displayName?.split(' ')[0] || profile.username || 'User',
        lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
        email: email,
        userType: 'individual',
        isEmailVerified: !!email,
        socialAccounts: [{
          provider: 'github',
          providerId: profile.id,
          email: email,
          displayName: profile.displayName || profile.username,
          profilePicture: profile.photos?.[0]?.value
        }]
      });
      
      await newUser.save();
      done(null, newUser);
    } catch (error) {
      done(error, null);
    }
  }));
}

// LinkedIn OAuth Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "/api/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_liteprofile']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findBySocialAccount('linkedin', profile.id);
      
      if (user) {
        return done(null, user);
      }
      
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email: email });
        if (user) {
          await user.addSocialAccount('linkedin', profile);
          return done(null, user);
        }
      }
      
      const newUser = new User({
        firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
        lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
        email: email,
        userType: 'professional', // LinkedIn users are likely professionals
        isEmailVerified: !!email,
        socialAccounts: [{
          provider: 'linkedin',
          providerId: profile.id,
          email: email,
          displayName: profile.displayName,
          profilePicture: profile.photos?.[0]?.value
        }]
      });
      
      await newUser.save();
      done(null, newUser);
    } catch (error) {
      done(error, null);
    }
  }));
}

module.exports = passport;