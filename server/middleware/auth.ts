import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../services/firebase-admin';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Only use demo user if explicitly enabled in development
    // NEVER bypass auth in production, even if DEV_AUTH_BYPASS is accidentally set
    if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true') {
      console.log('⚠️  DEV_AUTH_BYPASS is active - using demo user for authentication');
      req.user = {
        uid: 'a2282785-e9d5-4a1b-9e3e-21d53d3a413e',
        email: 'demo@sehatify.com',
        name: 'Demo User'
      };
      return next();
    }
    
    // Strict production authentication required
    if (process.env.NODE_ENV === 'production') {
      console.log('Production mode: Requiring valid Firebase authentication');
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization header missing or invalid'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({
        error: 'ID token missing'
      });
    }

    // Verify the token with Firebase
    const decodedToken = await verifyIdToken(idToken);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  if (!idToken) {
    return next();
  }

  // Try to verify token, but don't fail if invalid
  verifyIdToken(idToken)
    .then(decodedToken => {
      if (decodedToken) {
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email
        };
      }
      next();
    })
    .catch(() => {
      next();
    });
}
