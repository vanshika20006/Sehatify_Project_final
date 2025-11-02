import { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, InsertUserProfile } from '@shared/schema';
import { useLocation } from 'wouter';
import { auth, isFirebaseAvailable } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  medicalHistory?: string;
  abhaId?: string;
  language: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profileData: Omit<InsertUserProfile, 'email'>) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Firebase Auth API helper functions
const authApi = {
  async login(email: string, password: string) {
    // In development, try dev auth first for demo users, then Firebase
    if (import.meta.env.DEV) {
      console.log('Development mode: trying dev auth first...');
      try {
        const response = await fetch('/api/auth/dev/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Development login successful');
          return {
            success: true,
            user: result.user,
            token: result.token
          };
        } else {
          const error = await response.json();
          console.log('Development login failed, trying Firebase...', error.message);
        }
      } catch (devError) {
        console.log('Development login error, trying Firebase...', devError);
      }
    }

    // Try Firebase authentication (available or fallback in development)
    if (isFirebaseAvailable && auth) {
      console.log('Attempting login with Firebase...');
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        
        // Verify token with server
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Login verification failed');
        }

        const result = await response.json();
        console.log('Firebase login successful');
        return {
          success: true,
          user: result.user,
          token: idToken
        };
      } catch (firebaseError: any) {
        console.error('Firebase login error:', firebaseError);
        
        // Firebase authentication failed 
        console.log('Firebase authentication failed:', firebaseError.message);
        throw new Error(firebaseError.message || 'Firebase login failed');
      }
    } else {
      // Production mode - require Firebase configuration
      if (import.meta.env.PROD) {
        throw new Error('Firebase authentication is required in production. Please contact support if this persists.');
      } else {
        throw new Error('Authentication not available. Please check your Firebase configuration.');
      }
    }
  },

  async register(email: string, password: string, profileData: any) {
    // In development, try dev auth first for demo users, then Firebase
    if (import.meta.env.DEV) {
      console.log('Development mode: trying dev registration first...');
      try {
        const response = await fetch('/api/auth/dev/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, ...profileData })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Development registration successful');
          return {
            success: true,
            user: result.user,
            profile: result.user,
            token: result.token
          };
        } else {
          const error = await response.json();
          console.log('Development registration failed, trying Firebase...', error.message);
        }
      } catch (devError) {
        console.log('Development registration error, trying Firebase...', devError);
      }
    }

    // Try Firebase authentication (available or fallback in development)
    if (isFirebaseAvailable && auth) {
      console.log('Attempting registration with Firebase...');
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        
        // Create user profile on server
        const response = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profileData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Profile creation failed');
        }

        const result = await response.json();
        return {
          success: true,
          user: userCredential.user,
          profile: result.profile,
          token: idToken
        };
      } catch (firebaseError: any) {
        console.error('Firebase registration error:', firebaseError);
        throw new Error(firebaseError.message || 'Firebase registration failed');
      }
    } else {
      // Fallback to dev auth if Firebase is not available (development mode)
      if (import.meta.env.DEV) {
        console.log('Firebase not available, attempting registration with development API...');
        try {
          const response = await fetch('/api/auth/dev/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, ...profileData })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Development registration successful');
            return {
              success: true,
              user: result.user,
              profile: result.user,
              token: result.token
            };
          } else {
            const error = await response.json();
            console.log('Development registration failed:', error.message);
            throw new Error(error.message || 'Registration failed');
          }
        } catch (devError) {
          console.log('Development registration error:', devError);
          throw devError;
        }
      } else {
        // Production mode - require Firebase configuration
        if (import.meta.env.PROD) {
          throw new Error('Firebase registration is required in production. Please ensure Firebase is properly configured or contact support.');
        } else {
          throw new Error('Registration not available. Please check your Firebase configuration.');
        }
      }
    }
  },

  async getMe(token: string) {
    const response = await fetch('/api/auth/me', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  },

  async updateProfile(token: string, data: any) {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  },

  async logout() {
    if (isFirebaseAvailable && auth) {
      await signOut(auth);
    }
    return true;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedToken) {
        try {
          const response = await authApi.getMe(storedToken);
          if (response.success) {
            // Normalize to AuthUser format
            const authUser: AuthUser = {
              id: response.user.uid || response.user.id,
              email: response.user.email || '',
              name: response.user.displayName || response.user.name || '',
              age: response.user.profile?.age || response.user.age || 0,
              gender: response.user.profile?.gender || response.user.gender || 'other',
              phone: response.user.profile?.phone || response.user.phone || '',
              medicalHistory: response.user.profile?.medicalHistory || response.user.medicalHistory,
              abhaId: response.user.profile?.abhaId || response.user.abhaId,
              language: response.user.profile?.language || response.user.language || 'en',
              country: response.user.profile?.country || response.user.country || 'IN',
              createdAt: new Date(response.user.createdAt || Date.now()),
              updatedAt: new Date(response.user.updatedAt || Date.now())
            };
            
            setUser(authUser);
            setUserProfile(response.user.profile || response.user);
            setToken(storedToken);
          } else {
            // Invalid token, clear it
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Failed to validate stored token:', error);
          localStorage.removeItem('auth_token');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.success) {
        // Normalize to AuthUser format for consistency
        const authUser: AuthUser = {
          id: response.user.uid || response.user.id,
          email: response.user.email || '',
          name: response.user.displayName || response.user.name || '',
          age: response.user.profile?.age || response.user.age || 0,
          gender: response.user.profile?.gender || response.user.gender || 'other',
          phone: response.user.profile?.phone || response.user.phone || '',
          medicalHistory: response.user.profile?.medicalHistory || response.user.medicalHistory,
          abhaId: response.user.profile?.abhaId || response.user.abhaId,
          language: response.user.profile?.language || response.user.language || 'en',
          country: response.user.profile?.country || response.user.country || 'IN',
          createdAt: new Date(response.user.createdAt || Date.now()),
          updatedAt: new Date(response.user.updatedAt || Date.now())
        };
        
        setUser(authUser);
        setUserProfile(response.user.profile || response.user);
        setToken(response.token);
        
        // Store token in localStorage
        localStorage.setItem('auth_token', response.token);
        
        // Redirect to dashboard
        setLocation('/dashboard');
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, profileData: Omit<InsertUserProfile, 'email'>) => {
    try {
      const response = await authApi.register(email, password, profileData);
      
      if (response.success) {
        // Convert to AuthUser format for both Firebase and dev-auth
        const authUser: AuthUser = {
          id: response.user.uid || response.user.id,
          email: response.user.email || '',
          name: response.user.displayName || response.user.name || response.profile?.name || '',
          age: response.profile?.age || response.user.age || 0,
          gender: response.profile?.gender || response.user.gender || 'other',
          phone: response.profile?.phone || response.user.phone || '',
          medicalHistory: response.profile?.medicalHistory || response.user.medicalHistory,
          abhaId: response.profile?.abhaId || response.user.abhaId,
          language: response.profile?.language || response.user.language || 'en',
          country: response.profile?.country || response.user.country || 'IN',
          createdAt: new Date(response.user.createdAt || Date.now()),
          updatedAt: new Date(response.user.updatedAt || Date.now())
        };
        setUser(authUser);
        setUserProfile(response.profile);
        setToken(response.token);
        
        // Store token in localStorage
        localStorage.setItem('auth_token', response.token);
        
        // Redirect to dashboard
        setLocation('/dashboard');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      
      // Clear local state and localStorage
      setUser(null);
      setUserProfile(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      
      // Redirect to home
      setLocation('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setUserProfile(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      setLocation('/');
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !token) throw new Error('No user logged in');

    try {
      const response = await authApi.updateProfile(token, data);
      
      if (response.success) {
        // Merge updated profile into existing user
        const updatedUser: AuthUser = {
          ...user!,
          ...data,
          updatedAt: new Date()
        };
        
        setUser(updatedUser);
        setUserProfile(response.profile || response.user || updatedUser);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  // Provide getAuthHeaders utility for API calls
  const getAuthHeaders = (): Record<string, string> => {
    if (!token) return {};
    return { 'Authorization': `Bearer ${token}` };
  };

  const value = {
    user,
    userProfile,
    loading,
    token,
    login,
    register,
    logout,
    updateUserProfile,
    getAuthHeaders
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export the getAuthHeaders function for use in API calls
export function useAuthHeaders() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthHeaders must be used within AuthProvider');
  return context.getAuthHeaders?.() || {};
}