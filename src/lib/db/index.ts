import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Create db connection instance when first accessed
let dbInstance: any = null;

function getDb() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      // During build time, process.env.DATABASE_URL might not be available
      // but since we've set pages as dynamic, this should only run in server runtime
      throw new Error('DATABASE_URL is not set. Ensure it is configured in your environment.');
    }
    const sql = neon(process.env.DATABASE_URL);
    dbInstance = drizzle(sql);
  }
  return dbInstance;
}

// Since we can't use a getter directly to export db as a constant,
// let's export a function that wraps db operations or use the instance
// But we want to maintain the same API, so we'll create a custom module

// Actually, let's use a different approach - create a module that exports functions
function createDbModule() {
  if (!process.env.DATABASE_URL) {
    // During build, we'll create a minimal object to satisfy TypeScript during compilation
    // but actual calls will fail at runtime if DATABASE_URL is not available.
    // Since our pages are dynamic, runtime will have DATABASE_URL
    console.warn('DATABASE_URL not set - this should only happen during build with no runtime access');
    // Return a mock that will throw an error when called, to catch any unexpected usage during build
    return {
      select: () => { throw new Error('DB connection not available'); },
      from: () => { throw new Error('DB connection not available'); },
      update: () => { throw new Error('DB connection not available'); },
      insert: () => { throw new Error('DB connection not available'); },
    };
  }

  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql);
}

export const db = createDbModule();