const { pool } = require('./db');

/**
 * Get all newsletter analytics data
 */
async function getNewsletterAnalytics(req, res) {
  try {
    // Using direct SQL query for simplicity
    const result = await pool.query(`
      SELECT * FROM newsletter_analytics 
      ORDER BY campaign_date DESC
      LIMIT 50
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting newsletter analytics:", error);
    return res.status(500).json({ error: "Failed to fetch newsletter analytics data" });
  }
}

/**
 * Get the latest newsletter analytics data
 */
async function getLatestNewsletterAnalytics(req, res) {
  try {
    const result = await pool.query(`
      SELECT * FROM newsletter_analytics 
      ORDER BY campaign_date DESC
      LIMIT 1
    `);
    
    return res.status(200).json(result.rows[0] || null);
  } catch (error) {
    console.error("Error getting latest newsletter analytics:", error);
    return res.status(500).json({ error: "Failed to fetch latest newsletter analytics data" });
  }
}

/**
 * Create a sample newsletter entry for testing
 */
async function createNewsletterSample(req, res) {
  try {
    // Sample data
    const sampleData = {
      campaign_name: "Weekly Newsletter - May 22",
      campaign_date: new Date(),
      subject: "This Week's Newsletter: The Latest Updates",
      total_recipients: 500,
      emails_sent: 485,
      total_bounces: 15,
      opens_total: 210,
      clicks_total: 85,
      unsubscribes: 3,
      open_rate: 0.43,
      click_rate: 0.18,
      send_time: new Date(),
      day_of_week: "Thursday"
    };
    
    // Insert using SQL
    const query = `
      INSERT INTO newsletter_analytics 
      (campaign_name, campaign_date, subject, total_recipients, emails_sent, 
       total_bounces, opens_total, clicks_total, unsubscribes, open_rate, 
       click_rate, send_time, day_of_week)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const values = [
      sampleData.campaign_name,
      sampleData.campaign_date,
      sampleData.subject,
      sampleData.total_recipients,
      sampleData.emails_sent,
      sampleData.total_bounces,
      sampleData.opens_total,
      sampleData.clicks_total,
      sampleData.unsubscribes,
      sampleData.open_rate,
      sampleData.click_rate,
      sampleData.send_time,
      sampleData.day_of_week
    ];
    
    const result = await pool.query(query, values);
    
    return res.status(201).json({
      success: true,
      message: "Sample newsletter analytics created",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating newsletter sample:", error);
    return res.status(500).json({ error: "Failed to create newsletter sample data" });
  }
}

module.exports = {
  getNewsletterAnalytics,
  getLatestNewsletterAnalytics,
  createNewsletterSample
};