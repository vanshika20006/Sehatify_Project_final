import { db } from './db-storage';
import { userProfilesTable } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function createDemoUser() {
  try {
    console.log('Checking for existing demo user...');
    
    // Check if demo user exists
    const existingUsers = await db.select().from(userProfilesTable).where(eq(userProfilesTable.email, 'demo@sehatify.com'));
    
    if (existingUsers.length > 0) {
      console.log('Demo user already exists:', existingUsers[0].id);
      return existingUsers[0];
    }

    console.log('Creating new demo user...');
    
    // Create demo user
    const demoUser = await db.insert(userProfilesTable).values({
      email: 'demo@sehatify.com',
      name: 'Demo User',
      age: 30,
      gender: 'male',
      phone: '+91-9876543210',
      medicalHistory: 'No major medical history',
      abhaId: 'AB123456789',
      language: 'en',
      country: 'IN'
    }).returning();

    console.log('Demo user created successfully:', demoUser[0].id);
    return demoUser[0];
  } catch (error: any) {
    console.error('Error with demo user:', error.message);
    throw error;
  }
}

// Run if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  createDemoUser().then(() => {
    console.log('Demo user setup completed.');
    process.exit(0);
  }).catch(error => {
    console.error('Failed to create demo user:', error);
    process.exit(1);
  });
}

export { createDemoUser };