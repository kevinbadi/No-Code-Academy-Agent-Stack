import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createNewsletterTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletter_analytics (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        
        -- Campaign details
        campaign_id TEXT,
        campaign_name TEXT NOT NULL,
        campaign_date TIMESTAMP NOT NULL,
        campaign_type TEXT DEFAULT 'regular',
        subject TEXT NOT NULL,
        preview_text TEXT,
        list_id TEXT,
        list_is_active BOOLEAN DEFAULT TRUE,
        list_name TEXT,
        
        -- Email metrics
        total_recipients INTEGER NOT NULL,
        emails_sent INTEGER NOT NULL,
        emails_canceled INTEGER DEFAULT 0,
        
        -- Delivery status
        delivery_status TEXT DEFAULT 'delivered',
        can_cancel BOOLEAN DEFAULT FALSE,
        delivery_enabled BOOLEAN DEFAULT TRUE,
        
        -- Bounce metrics
        hard_bounces INTEGER DEFAULT 0,
        soft_bounces INTEGER DEFAULT 0,
        syntax_errors INTEGER DEFAULT 0,
        total_bounces INTEGER DEFAULT 0,
        
        -- Open metrics
        opens_total INTEGER DEFAULT 0,
        unique_opens INTEGER DEFAULT 0,
        proxy_excluded_opens INTEGER DEFAULT 0,
        proxy_excluded_unique_opens INTEGER DEFAULT 0,
        last_open_time TIMESTAMP,
        
        -- Click metrics
        clicks_total INTEGER DEFAULT 0,
        unique_clicks INTEGER DEFAULT 0,
        unique_subscriber_clicks INTEGER DEFAULT 0,
        last_click_time TIMESTAMP,
        
        -- Forward metrics
        forwards_count INTEGER DEFAULT 0,
        forwards_opens INTEGER DEFAULT 0,
        
        -- Engagement metrics
        abuse_reports INTEGER DEFAULT 0,
        unsubscribes INTEGER DEFAULT 0,
        
        -- Calculated rates
        open_rate REAL NOT NULL,
        proxy_excluded_open_rate REAL,
        click_rate REAL NOT NULL,
        click_to_open_rate REAL NOT NULL,
        bounce_rate REAL NOT NULL DEFAULT 0,
        unsubscribe_rate REAL NOT NULL DEFAULT 0,
        
        -- Timing info
        send_time TIMESTAMP NOT NULL,
        day_of_week TEXT NOT NULL,
        
        -- Raw data for reference
        raw_data JSONB
      )
    `);
    
    console.log('Newsletter analytics table created successfully');
    
    // Insert test data
    const testData = {
      "Campaign ID": "388025b232",
      "Campaign Title": "kevinbadi@nocodeacademy.com",
      "Type": "regular",
      "List ID": "ab6c0d6df6",
      "List Is Active": "true",
      "List Name": "Kev´s No Code Academy",
      "Subject Line": "This Linkedin Sales Agent Sells Itself (Free CodeBase)",
      "Preview Text": "",
      "Emails Sent": "500",
      "Abuse Reports": "0",
      "Unsubscribed": "0",
      "Send Time": "May 22, 2025 12:53 PM",
      "Hard Bounces": "19",
      "Soft Bounces": "8",
      "Syntax Errors": "0",
      "Opens Total": "26",
      "Unique Opens": "23",
      "proxy_excluded_opens": "19",
      "proxy_excluded_unique_opens": "18",
      "Open Rate": "0.048625792811839326",
      "proxy_excluded_open_rate": "0.03805496828752643",
      "Last Open": "May 22, 2025 1:04 PM",
      "Clicks Total": "8",
      "Unique Clicks": "8",
      "Unique Subscriber Clicks": "4",
      "Click Rate": "0.008456659619450317",
      "Last Click": "May 22, 2025 1:01 PM",
      "Enabled": "true",
      "can_cancel": "false",
      "status": "delivered",
      "emails_sent": "500",
      "emails_canceled": "0"
    };
    
    // Parse the test data
    const campaignId = testData['Campaign ID'] || '';
    const campaignTitle = testData['Campaign Title'] || '';
    const campaignType = testData['Type'] || 'regular';
    const listId = testData['List ID'] || '';
    const listIsActive = testData['List Is Active'] === 'true';
    const listName = testData['List Name'] || '';
    const subjectLine = testData['Subject Line'] || '';
    const previewText = testData['Preview Text'] || '';
    const emailsSent = parseInt(testData['Emails Sent'] || '0');
    const abuseReports = parseInt(testData['Abuse Reports'] || '0');
    const unsubscribed = parseInt(testData['Unsubscribed'] || '0');
    
    // Parse send time
    const sendTimeStr = testData['Send Time'] || '';
    const sendTime = sendTimeStr ? new Date(sendTimeStr) : new Date();
    const dayOfWeek = sendTime.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Parse bounce data
    const hardBounces = parseInt(testData['Hard Bounces'] || '0');
    const softBounces = parseInt(testData['Soft Bounces'] || '0');
    const syntaxErrors = parseInt(testData['Syntax Errors'] || '0');
    const totalBounces = hardBounces + softBounces + syntaxErrors;
    
    // Parse opens data
    const opensTotal = parseInt(testData['Opens Total'] || '0');
    const proxyExcludedOpens = parseInt(testData['proxy_excluded_opens'] || '0');
    const uniqueOpens = parseInt(testData['Unique Opens'] || '0');
    const proxyExcludedUniqueOpens = parseInt(testData['proxy_excluded_unique_opens'] || '0');
    const openRate = parseFloat(testData['Open Rate'] || '0');
    const proxyExcludedOpenRate = parseFloat(testData['proxy_excluded_open_rate'] || '0');
    
    // Parse last open time
    const lastOpenStr = testData['Last Open'] || '';
    const lastOpenTime = lastOpenStr ? new Date(lastOpenStr) : null;
    
    // Parse clicks data
    const clicksTotal = parseInt(testData['Clicks Total'] || '0');
    const uniqueClicks = parseInt(testData['Unique Clicks'] || '0');
    const uniqueSubscriberClicks = parseInt(testData['Unique Subscriber Clicks'] || '0');
    const clickRate = parseFloat(testData['Click Rate'] || '0');
    
    // Calculate click to open rate
    const clickToOpenRate = uniqueOpens > 0 ? uniqueClicks / uniqueOpens : 0;
    
    // Parse last click time
    const lastClickStr = testData['Last Click'] || '';
    const lastClickTime = lastClickStr ? new Date(lastClickStr) : null;
    
    // Parse delivery status
    const deliveryEnabled = testData['Enabled'] === 'true';
    const canCancel = testData['can_cancel'] === 'true';
    const deliveryStatus = testData['status'] || 'delivered';
    const emailsCanceled = parseInt(testData['emails_canceled'] || '0');
    
    // Calculate rates 
    const bounceRate = emailsSent > 0 ? totalBounces / emailsSent : 0;
    const unsubscribeRate = emailsSent > 0 ? unsubscribed / emailsSent : 0;
    
    // Insert the data using a SQL query
    const query = `
      INSERT INTO newsletter_analytics (
        campaign_id, campaign_name, campaign_date, campaign_type, subject, preview_text,
        list_id, list_is_active, list_name, total_recipients, emails_sent, emails_canceled,
        delivery_status, can_cancel, delivery_enabled, hard_bounces, soft_bounces, syntax_errors,
        total_bounces, opens_total, unique_opens, proxy_excluded_opens, proxy_excluded_unique_opens,
        last_open_time, clicks_total, unique_clicks, unique_subscriber_clicks, last_click_time,
        forwards_count, forwards_opens, abuse_reports, unsubscribes, open_rate, proxy_excluded_open_rate,
        click_rate, click_to_open_rate, bounce_rate, unsubscribe_rate, send_time, day_of_week,
        raw_data
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36,
        $37, $38, $39, $40, $41
      ) RETURNING *
    `;
    
    const params = [
      campaignId,
      campaignTitle,
      sendTime, // Use send time as campaign date
      campaignType,
      subjectLine,
      previewText,
      listId,
      listIsActive,
      listName,
      emailsSent, // total recipients
      emailsSent,
      emailsCanceled,
      deliveryStatus,
      canCancel,
      deliveryEnabled,
      hardBounces,
      softBounces,
      syntaxErrors,
      totalBounces,
      opensTotal,
      uniqueOpens,
      proxyExcludedOpens,
      proxyExcludedUniqueOpens,
      lastOpenTime,
      clicksTotal,
      uniqueClicks,
      uniqueSubscriberClicks,
      lastClickTime,
      0, // Forwards count - not in the provided data
      0, // Forwards opens - not in the provided data
      abuseReports,
      unsubscribed,
      openRate,
      proxyExcludedOpenRate, 
      clickRate,
      clickToOpenRate,
      bounceRate,
      unsubscribeRate,
      sendTime,
      dayOfWeek,
      JSON.stringify(testData) // Store the original data
    ];
    
    const result = await pool.query(query, params);
    console.log('Test data inserted successfully:', result.rows[0]);
    
    // Query to test retrieval
    const allData = await pool.query('SELECT * FROM newsletter_analytics');
    console.log(`Retrieved ${allData.rows.length} newsletter records`);
    
    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

createNewsletterTable();
