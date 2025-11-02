import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { UserProfile } from '@shared/schema';

// In-memory storage for development (use database in production)
const users = new Map<string, UserProfile & { password: string }>();
const sessions = new Map<string, { userId: string; expiresAt: number }>();

// Helper to hash passwords securely with bcrypt
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export interface DevAuthUser {
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

export async function register(
  email: string,
  password: string,
  profileData: Omit<UserProfile, 'id' | 'email' | 'createdAt' | 'updatedAt'>
): Promise<{ user: DevAuthUser; token: string }> {
  // Check if user already exists
  for (const user of Array.from(users.values())) {
    if (user.email === email) {
      throw new Error('User already exists with this email');
    }
  }

  // Create new user
  const userId = randomBytes(16).toString('hex');
  const hashedPassword = await hashPassword(password);
  const now = new Date();

  const user: UserProfile & { password: string } = {
    id: userId,
    email,
    password: hashedPassword,
    name: profileData.name,
    age: profileData.age,
    gender: profileData.gender,
    phone: profileData.phone,
    medicalHistory: profileData.medicalHistory,
    abhaId: profileData.abhaId,
    language: profileData.language || 'en',
    country: profileData.country || 'IN',
    createdAt: now,
    updatedAt: now
  };

  users.set(userId, user);

  // Generate token
  const token = generateToken();
  sessions.set(token, {
    userId,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

export async function login(email: string, password: string): Promise<{ user: DevAuthUser; token: string }> {
  // Find user by email
  let foundUser: (UserProfile & { password: string }) | null = null;
  for (const user of Array.from(users.values())) {
    if (user.email === email) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser || !(await verifyPassword(password, foundUser.password))) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken();
  sessions.set(token, {
    userId: foundUser.id,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  });

  // Update last login
  foundUser.updatedAt = new Date();

  // Return user without password
  const { password: _, ...userWithoutPassword } = foundUser;
  return { user: userWithoutPassword, token };
}

export async function verifyToken(token: string): Promise<DevAuthUser | null> {
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    // Clean up expired session
    if (session) {
      sessions.delete(token);
    }
    return null;
  }

  const user = users.get(session.userId);
  if (!user) {
    sessions.delete(token);
    return null;
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function logout(token: string): Promise<void> {
  sessions.delete(token);
}

export async function getUserById(userId: string): Promise<DevAuthUser | null> {
  const user = users.get(userId);
  if (!user) {
    return null;
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<DevAuthUser> {
  const user = users.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Update user data
  Object.assign(user, data, { updatedAt: new Date() });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Add some demo users for testing
export async function initializeDemoUsers() {
  // Check if demo user already exists
  const existingUser = Array.from(users.values()).find(u => u.email === 'demo@sehatify.com');
  if (existingUser) {
    console.log('Demo user already exists in database: demo@sehatify.com');
    return;
  }

  const demoUser = {
    id: 'demo-user-1',
    email: 'demo@sehatify.com',
    password: await hashPassword('demo123'),
    name: 'Demo User',
    age: 30,
    gender: 'male' as const,
    phone: '+91-9876543210',
    medicalHistory: 'No major medical history',
    abhaId: 'AB123456789',
    language: 'en',
    country: 'IN',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  users.set(demoUser.id, demoUser);
  console.log('Demo user initialized: demo@sehatify.com / demo123');
}