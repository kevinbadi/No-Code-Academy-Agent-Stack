import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Essential for Neon database connection in serverless environments
neonConfig.webSocketConstructor = ws; 
// Increase timeout for potentially slow connections
neonConfig.connectionTimeoutMillis = 60_000;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use direct query-based functions for simpler operations
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Add connection parameters for better reliability
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection not established
});

// Export both the pool for direct queries and drizzle for ORM operations
export const db = drizzle({ client: pool, schema });
