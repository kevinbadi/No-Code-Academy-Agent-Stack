import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { linkedinAgentLeads } from '@shared/schema';
import { InsertLinkedinAgentLeads } from '@shared/schema';
import { LinkedinAgentLeads } from '@shared/schema';

// Configure Neon to use websockets
neonConfig.webSocketConstructor = ws;

// Create a connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Function to store webhook data directly in the database
export async function storeWebhookData(data: InsertLinkedinAgentLeads): Promise<LinkedinAgentLeads> {
  const client = await pool.connect();
  
  try {
    console.log('Storing webhook data directly in PostgreSQL:', data);
    
    // Insert data using direct SQL
    const query = `
      INSERT INTO linkedin_agent_leads (
        timestamp, daily_sent, daily_accepted, processed_profiles, 
        max_invitations, total_sent, total_accepted, status, 
        csv_link, json_link, connection_status, raw_log, process_data
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *
    `;
    
    const values = [
      data.timestamp || new Date(),
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
      JSON.stringify(data.processData || {})
    ];
    
    const result = await client.query(query, values);
    const insertedData = result.rows[0];
    
    console.log('Successfully stored webhook data:', insertedData);
    
    return {
      id: insertedData.id,
      timestamp: insertedData.timestamp,
      dailySent: insertedData.daily_sent,
      dailyAccepted: insertedData.daily_accepted,
      processedProfiles: insertedData.processed_profiles,
      maxInvitations: insertedData.max_invitations,
      totalSent: insertedData.total_sent,
      totalAccepted: insertedData.total_accepted,
      status: insertedData.status,
      csvLink: insertedData.csv_link,
      jsonLink: insertedData.json_link,
      connectionStatus: insertedData.connection_status,
      rawLog: insertedData.raw_log,
      processData: insertedData.process_data
    };
  } catch (error) {
    console.error('Error storing webhook data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to get the latest webhook data
export async function getLatestWebhookData(): Promise<LinkedinAgentLeads | null> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM linkedin_agent_leads 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const data = result.rows[0];
    
    return {
      id: data.id,
      timestamp: data.timestamp,
      dailySent: data.daily_sent,
      dailyAccepted: data.daily_accepted,
      processedProfiles: data.processed_profiles,
      maxInvitations: data.max_invitations,
      totalSent: data.total_sent,
      totalAccepted: data.total_accepted,
      status: data.status,
      csvLink: data.csv_link,
      jsonLink: data.json_link,
      connectionStatus: data.connection_status,
      rawLog: data.raw_log,
      processData: data.process_data
    };
  } catch (error) {
    console.error('Error getting latest webhook data:', error);
    return null;
  } finally {
    client.release();
  }
}

// Test function to verify database connection
export async function testDatabaseConnection(): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    client.release();
  }
}