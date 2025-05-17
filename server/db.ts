import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Essential for Neon database connection in serverless environments
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a pool for database connections
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

// Export both the pool for direct queries and drizzle for ORM operations
export const db = drizzle({ client: pool, schema });
