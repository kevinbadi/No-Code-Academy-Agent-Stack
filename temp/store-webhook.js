// Direct PostgreSQL webhook data storage script
const { Pool } = require('@neondatabase/serverless');

// Configure connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Function to store data
async function storeWebhook() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to PostgreSQL database');
    
    // Test webhook data
    const testData = {
      dailySent: 35,
      dailyAccepted: 1,
      totalSent: 35,
      totalAccepted: 1,
      maxInvitations: 20,
      processedProfiles: 20,
      status: "No more profiles to process today.",
      csvLink: "https://phantombuster.s3.amazonaws.com/test.csv",
      jsonLink: "https://phantombuster.s3.amazonaws.com/test.json",
      connectionStatus: "Successfully connected to LinkedIn",
      rawLog: JSON.stringify({test: "webhook test"})
    };
    
    // Insert data
    const result = await client.query(
      `INSERT INTO linkedin_agent_leads (
        timestamp, daily_sent, daily_accepted, processed_profiles, 
        max_invitations, total_sent, total_accepted, status, 
        csv_link, json_link, connection_status, raw_log, process_data
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *`,
      [
        new Date(),
        testData.dailySent,
        testData.dailyAccepted,
        testData.processedProfiles,
        testData.maxInvitations,
        testData.totalSent,
        testData.totalAccepted,
        testData.status,
        testData.csvLink,
        testData.jsonLink,
        testData.connectionStatus,
        testData.rawLog,
        '{}'
      ]
    );
    
    console.log('Successfully stored webhook data:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    client.release();
  }
}

// Execute
storeWebhook().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
