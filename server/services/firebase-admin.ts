import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;
let adminStorage: Storage;

// Initialize Firebase Admin with service account credentials
try {
  if (!getApps().length) {
    // Parse the service account JSON from environment variable
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccount) {
      console.warn('Firebase service account not found. Falling back to development mode.');
      throw new Error('Firebase credentials not found');
    }

    let credentials;
    try {
      // Clean and parse the service account JSON with better error handling
      let cleanedServiceAccount = serviceAccount.trim();
      
      // Remove any BOM (Byte Order Mark) characters that might be present
      cleanedServiceAccount = cleanedServiceAccount.replace(/^\uFEFF/, '');
      
      // Remove any extra whitespace, newlines, or invisible characters at the start/end
      cleanedServiceAccount = cleanedServiceAccount.replace(/^[\s\x00-\x1f\x7f]+|[\s\x00-\x1f\x7f]+$/g, '');
      
      // Decode any URL-encoded characters with multiple attempts
      let originalServiceAccount = cleanedServiceAccount;
      let decodeAttempts = 0;
      const maxDecodeAttempts = 3;
      
      // Try decoding multiple times to handle double/triple encoding
      while (decodeAttempts < maxDecodeAttempts) {
        try {
          let decodedAttempt = decodeURIComponent(cleanedServiceAccount);
          
          // If no change occurred, we're done decoding
          if (decodedAttempt === cleanedServiceAccount) {
            break;
          }
          
          cleanedServiceAccount = decodedAttempt;
          decodeAttempts++;
          console.log(`URL decode attempt ${decodeAttempts} successful`);
        } catch (decodeError) {
          console.log(`URL decode attempt ${decodeAttempts + 1} failed, proceeding with current value`);
          break;
        }
      }
      
      // Manual replacement for common URL-encoded characters if decodeURIComponent fails
      if (cleanedServiceAccount.includes('%')) {
        console.log('Manual URL decoding fallback for remaining encoded characters');
        cleanedServiceAccount = cleanedServiceAccount
          .replace(/%40/g, '@')        // @ symbol
          .replace(/%22/g, '"')        // Quote marks
          .replace(/%2C/g, ',')        // Comma
          .replace(/%3A/g, ':')        // Colon
          .replace(/%7B/g, '{')        // Left brace
          .replace(/%7D/g, '}')        // Right brace
          .replace(/%5C/g, '\\')       // Backslash
          .replace(/%2F/g, '/')        // Forward slash
          .replace(/%20/g, ' ')        // Space
          .replace(/%0A/g, '\n')       // Newline
          .replace(/%0D/g, '\r');      // Carriage return
      }
      
      // Check if it starts and ends with proper JSON braces
      if (!cleanedServiceAccount.startsWith('{') || !cleanedServiceAccount.endsWith('}')) {
        throw new Error('Service account JSON must start with { and end with }');
      }
      
      console.log('Attempting to parse service account JSON...');
      credentials = JSON.parse(cleanedServiceAccount);
      
      // Validate required fields
      if (!credentials.project_id || !credentials.private_key || !credentials.client_email) {
        throw new Error('Missing required fields in service account: project_id, private_key, or client_email');
      }

      // Normalize newlines in private key for better portability
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      
      console.log(`Successfully parsed Firebase service account for project: ${credentials.project_id}`);
    } catch (parseError: any) {
      console.error('Error parsing Firebase service account JSON:', parseError?.message || 'Unknown parsing error');
      console.error('Service account content length:', serviceAccount.length, 'characters');
      console.error('Parse error details: Invalid JSON format or encoding issue');
      throw new Error(`Invalid Firebase service account JSON: ${parseError?.message || 'Unknown parsing error'}`);
    }

    adminApp = initializeApp({
      credential: cert({
        projectId: credentials.project_id,
        privateKey: credentials.private_key,
        clientEmail: credentials.client_email,
      }),
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    });
    
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);

    console.log('Firebase Admin initialized successfully');
  } else {
    adminApp = getApps()[0];
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);
  }
} catch (error) {
  console.warn('Warning: Firebase Admin initialization failed. Using stub implementation.', error);
  
  // In production, fail fast rather than using stub to avoid runtime issues
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: Firebase Admin failed to initialize in production. Stopping server.');
    process.exit(1);
  }
  
  // Fall back to stub implementation in development only
  adminAuth = null as any;
  adminDb = null as any;
  adminStorage = null as any;
}

export { adminAuth, adminDb, adminStorage };

// Firebase Admin service functions
export async function verifyIdToken(idToken: string) {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid ID token');
  }
}

export async function getUserProfile(userId: string) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const doc = await adminDb.collection('users').doc(userId).get();
    if (!doc.exists) {
      throw new Error('User profile not found');
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function saveUserProfile(userId: string, profileData: any) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const profileWithTimestamp = {
      ...profileData,
      updatedAt: new Date(),
      createdAt: profileData.createdAt || new Date()
    };
    
    await adminDb.collection('users').doc(userId).set(profileWithTimestamp, { merge: true });
    return { id: userId, ...profileWithTimestamp };
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}

export async function saveVitalSigns(vitalSigns: any) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const vitalWithTimestamp = {
      ...vitalSigns,
      timestamp: vitalSigns.timestamp || new Date(),
      createdAt: new Date()
    };
    
    const docRef = await adminDb.collection('vitalSigns').add(vitalWithTimestamp);
    return { id: docRef.id, ...vitalWithTimestamp };
  } catch (error) {
    console.error('Error saving vital signs:', error);
    throw error;
  }
}

export async function getVitalSigns(userId: string, limit: number = 50) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const query = adminDb
      .collection('vitalSigns')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit);
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting vital signs:', error);
    throw error;
  }
}

export async function saveHealthAnalysis(analysis: any) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const analysisWithTimestamp = {
      ...analysis,
      createdAt: new Date()
    };
    
    const docRef = await adminDb.collection('healthAnalyses').add(analysisWithTimestamp);
    return { id: docRef.id, ...analysisWithTimestamp };
  } catch (error) {
    console.error('Error saving health analysis:', error);
    throw error;
  }
}

export async function saveEmergencyAlert(alert: any) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const alertWithTimestamp = {
      ...alert,
      createdAt: new Date(),
      resolved: false
    };
    
    const docRef = await adminDb.collection('emergencyAlerts').add(alertWithTimestamp);
    return { id: docRef.id, ...alertWithTimestamp };
  } catch (error) {
    console.error('Error saving emergency alert:', error);
    throw error;
  }
}

export async function saveDonation(donation: any) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const donationWithTimestamp = {
      ...donation,
      createdAt: new Date(),
      status: 'pending'
    };
    
    const docRef = await adminDb.collection('donations').add(donationWithTimestamp);
    return { id: docRef.id, ...donationWithTimestamp };
  } catch (error) {
    console.error('Error saving donation:', error);
    throw error;
  }
}

export async function getDonations(userId: string) {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const query = adminDb
      .collection('donations')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting donations:', error);
    throw error;
  }
}
