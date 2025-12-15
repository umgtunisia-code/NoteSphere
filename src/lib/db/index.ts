import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

let dbInstance: any = null;

// Only initialize database if DATABASE_URL is available to prevent build errors
if (typeof process !== 'undefined' && process.env?.DATABASE_URL) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    dbInstance = drizzle(sql);
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    // This might happen during build time, which is okay for dynamic pages
  }
} else {
  // During build time or if DATABASE_URL is not set, we'll have dbInstance as null
  // The actual database calls will handle this error when executed in runtime
  // if the environment variable is still missing
}

// Export db - it will be available at runtime when DATABASE_URL is set
export const db = dbInstance;