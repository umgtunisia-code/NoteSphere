import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

let dbInstance: any = null;

// Function to initialize the database connection when first needed
function getDb() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured. Please set the database connection string in your environment variables.');
    }
    const sql = neon(process.env.DATABASE_URL);
    dbInstance = drizzle(sql);
  }
  return dbInstance;
}

// Export methods that will initialize the db when first called
export const db = {
  select: (...args: any[]) => getDb().select(...args),
  selectDistinct: (...args: any[]) => getDb().selectDistinct(...args),
  insert: (...args: any[]) => getDb().insert(...args),
  update: (table: any) => getDb().update(table),
  del: (table: any) => getDb().delete(table), // drizzle uses 'delete' but it's reserved in JS, so 'del' is typically used
  delete: (table: any) => getDb().delete(table),
  from: (table: any) => getDb().from(table),
  query: (tableName: any) => getDb().query[tableName],
  $with: (alias: any) => getDb().with(alias),
  transaction: (...args: any[]) => getDb().transaction(...args),
};