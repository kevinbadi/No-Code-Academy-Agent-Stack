const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure Neon connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Function to store webhook data in database
async function storeWebhookData(data) {
  try {
    console.log('Storing webhook data in PostgreSQL database:', data);
    
    const query = `
      INSERT INTO linkedin_agent_leads (
        timestamp, daily_sent, daily_accepted, processed_profiles, 
        max_invitations, total_sent, total_accepted, status, 
        csv_link, json_link, connection_status, raw_log, process_data
      ) VALUES (
        , , , , , , , , , 0, 1, 2, 3
      ) RETURNING *
    `;
    
    const values = [
      new Date(),
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
      data.processData || '{}'
    ];
    
    const result = await pool.query(query, values);
    console.log('Successfully stored webhook data:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error storing webhook data:', error);
    throw error;
  }
}

module.exports = { storeWebhookData };
