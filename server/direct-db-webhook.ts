import { Pool } from '@neondatabase/serverless';

// Create PostgreSQL connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Function to directly insert webhook data into the database
export async function storeWebhookData(data: any) {
  const client = await pool.connect();
  
  try {
    // Insert the data into the database using direct SQL
    const result = await client.query(`
      INSERT INTO linkedin_agent_leads (
        timestamp, daily_sent, daily_accepted, processed_profiles, 
        max_invitations, total_sent, total_accepted, status, 
        csv_link, json_link, connection_status, raw_log, process_data
      ) VALUES (
        NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING *
    `, [
      data.dailySent || 0, 
      data.dailyAccepted || 0,
      data.processedProfiles || null,
      data.maxInvitations || null,
      data.totalSent || 0,
      data.totalAccepted || 0,
      data.status || null,
      data.csvLink || null,
      data.jsonLink || null,
      data.connectionStatus || null,
      data.rawLog || null,
      '{}'
    ]);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Function to get the latest webhook data
export async function getLatestWebhookData() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM linkedin_agent_leads 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Export as module
export default {
  storeWebhookData,
  getLatestWebhookData
};
