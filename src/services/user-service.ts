import { db } from '@/lib/db';
import { users, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const ensureUserExists = async (userId: string, email: string | null = null) => {
  // Check if user exists in our database
  const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (existingUser.length === 0) {
    // User doesn't exist, create them
    await db.insert(users).values({ id: userId });
    
    // Create a default "Personal" project for the new user
    await db.insert(projects).values({
      id: uuidv4(),
      userId: userId,
      name: 'Personal',
      color: '#3B82F6'
    });
  }
};