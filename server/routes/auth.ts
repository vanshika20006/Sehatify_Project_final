import express from 'express';
import { verifyIdToken, getUserProfile, saveUserProfile } from '../services/firebase-admin';
import { insertUserProfileSchema } from '@shared/schema';
import { z } from 'zod';
import * as devAuth from '../services/dev-auth';

const router = express.Router();

// Firebase auth verification endpoint
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }

    const decodedToken = await verifyIdToken(idToken);
    
    // Try to get user profile from Firestore
    let userProfile;
    try {
      userProfile = await getUserProfile(decodedToken.uid);
    } catch (error) {
      // User profile doesn't exist yet, that's okay
      userProfile = null;
    }

    res.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || (userProfile as any)?.name,
        profile: userProfile
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  // In development mode, always return demo user and bypass Firebase
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: returning demo user');
    return res.json({
      success: true,
      user: {
        id: 'demo-user-id',
        uid: 'demo-user-id',
        email: 'demo@sehatify.com',
        name: 'Demo User',
        age: 30,
        gender: 'other',
        phone: '+1234567890',
        language: 'en',
        country: 'IN',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: null
      }
    });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decodedToken = await verifyIdToken(token);
    const userProfile = await getUserProfile(decodedToken.uid);

    res.json({
      success: true,
      user: {
        id: decodedToken.uid,
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || (userProfile as any)?.name,
        profile: userProfile
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// Create or update user profile
router.post('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decodedToken = await verifyIdToken(token);
    
    // Validate profile data
    const profileData = {
      email: decodedToken.email,
      ...req.body
    };

    const validatedProfileData = insertUserProfileSchema.parse(profileData);
    
    const userProfile = await saveUserProfile(decodedToken.uid, validatedProfileData);

    res.json({
      success: true,
      profile: userProfile
    });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save profile'
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decodedToken = await verifyIdToken(token);
    const userProfile = await saveUserProfile(decodedToken.uid, req.body);

    res.json({
      success: true,
      profile: userProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// In production, explicitly handle dev endpoints with JSON error
if (process.env.NODE_ENV === 'production') {
  router.use('/dev/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Development endpoints not available in production. Please use Firebase authentication.'
    });
  });
}

// Development mode login endpoints
if (process.env.NODE_ENV === 'development') {
  router.post('/dev/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await devAuth.login(email, password);
      
      res.json({
        success: true,
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Dev login error:', error);
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      });
    }
  });

  router.post('/dev/register', async (req, res) => {
    try {
      const { email, password, ...profileData } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await devAuth.register(email, password, profileData);
      
      res.json({
        success: true,
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Dev register error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  });
}

export { router as authRoutes };