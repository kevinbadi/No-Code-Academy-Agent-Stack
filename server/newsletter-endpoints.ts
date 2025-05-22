import { Request, Response } from "express";
import { pool } from "./db";

// Process newsletter webhook data in the exact format provided
export async function handleNewsletterWebhook(req: Request, res: Response) {
  try {
    const webhookData = req.body;
    console.log("Received newsletter webhook data:", webhookData);
    
    // Validate the data
    if (!webhookData) {
      return res.status(400).json({ error: "Invalid newsletter webhook data" });
    }
    
    // Parse the data from the exact format provided
    const campaignId = webhookData['Campaign ID'] || '';
    const campaignTitle = webhookData['Campaign Title'] || '';
    const campaignType = webhookData['Type'] || 'regular';
    const listId = webhookData['List ID'] || '';
    const listIsActive = webhookData['List Is Active'] === 'true';
    const listName = webhookData['List Name'] || '';
    const subjectLine = webhookData['Subject Line'] || '';
    const previewText = webhookData['Preview Text'] || '';
    const emailsSent = parseInt(webhookData['Emails Sent'] || '0');
    const abuseReports = parseInt(webhookData['Abuse Reports'] || '0');
    const unsubscribed = parseInt(webhookData['Unsubscribed'] || '0');
    
    // Parse send time
    const sendTimeStr = webhookData['Send Time'] || '';
    const sendTime = sendTimeStr ? new Date(sendTimeStr) : new Date();
    const dayOfWeek = sendTime.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Parse bounce data
    const hardBounces = parseInt(webhookData['Hard Bounces'] || '0');
    const softBounces = parseInt(webhookData['Soft Bounces'] || '0');
    const syntaxErrors = parseInt(webhookData['Syntax Errors'] || '0');
    const totalBounces = hardBounces + softBounces + syntaxErrors;
    
    // Parse opens data
    const opensTotal = parseInt(webhookData['Opens Total'] || '0');
    const proxyExcludedOpens = parseInt(webhookData['proxy_excluded_opens'] || '0');
    const uniqueOpens = parseInt(webhookData['Unique Opens'] || '0');
    const proxyExcludedUniqueOpens = parseInt(webhookData['proxy_excluded_unique_opens'] || '0');
    const openRate = parseFloat(webhookData['Open Rate'] || '0');
    const proxyExcludedOpenRate = parseFloat(webhookData['proxy_excluded_open_rate'] || '0');
    
    // Parse last open time
    const lastOpenStr = webhookData['Last Open'] || '';
    const lastOpenTime = lastOpenStr ? new Date(lastOpenStr) : null;
    
    // Parse clicks data
    const clicksTotal = parseInt(webhookData['Clicks Total'] || '0');
    const uniqueClicks = parseInt(webhookData['Unique Clicks'] || '0');
    const uniqueSubscriberClicks = parseInt(webhookData['Unique Subscriber Clicks'] || '0');
    const clickRate = parseFloat(webhookData['Click Rate'] || '0');
    
    // Calculate click to open rate
    const clickToOpenRate = uniqueOpens > 0 ? uniqueClicks / uniqueOpens : 0;
    
    // Parse last click time
    const lastClickStr = webhookData['Last Click'] || '';
    const lastClickTime = lastClickStr ? new Date(lastClickStr) : null;
    
    // Parse delivery status
    const deliveryEnabled = webhookData['Enabled'] === 'true';
    const canCancel = webhookData['can_cancel'] === 'true';
    const deliveryStatus = webhookData['status'] || 'delivered';
    const emailsCanceled = parseInt(webhookData['emails_canceled'] || '0');
    
    // Calculate rates 
    const bounceRate = emailsSent > 0 ? totalBounces / emailsSent : 0;
    const unsubscribeRate = emailsSent > 0 ? unsubscribed / emailsSent : 0;
    
    // Store in the database using raw SQL
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
    
    const result = await pool.query(query, [
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
      JSON.stringify(webhookData) // Store the original data
    ]);
    
    // Log the activity
    await createActivity({
      type: "webhook",
      message: `Received newsletter data for campaign "${campaignTitle}"`,
      metadata: {
        campaignId,
        campaignName: campaignTitle,
        openRate,
        clickRate
      }
    });
    
    return res.status(200).json({
      success: true,
      message: "Newsletter webhook data processed successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error handling newsletter webhook:", error);
    return res.status(500).json({ error: "Failed to process newsletter webhook data" });
  }
}

// Get all newsletter analytics
export async function getNewsletterAnalytics(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    const query = `
      SELECT * FROM newsletter_analytics
      ORDER BY campaign_date DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting newsletter analytics:", error);
    return res.status(500).json({ error: "Failed to fetch newsletter analytics data" });
  }
}

// Get latest newsletter analytics entry
export async function getLatestNewsletterAnalytics(req: Request, res: Response) {
  try {
    const query = `
      SELECT * FROM newsletter_analytics
      ORDER BY send_time DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No newsletter analytics found" });
    }
    
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error getting latest newsletter analytics:", error);
    return res.status(500).json({ error: "Failed to fetch latest newsletter analytics data" });
  }
}

// Create sample newsletter analytics entries for testing
export async function createNewsletterSample(req: Request, res: Response) {
  try {
    // Sample data matching the exact format provided
    const sampleData = {
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
    
    // Use the webhook handler to process the sample data
    req.body = sampleData;
    
    // Forward to webhook handler
    return await handleNewsletterWebhook(req, res);
  } catch (error) {
    console.error("Error creating newsletter sample:", error);
    return res.status(500).json({ error: "Failed to create newsletter sample" });
  }
}

// Helper to create activity logs
async function createActivity(activity: { 
  type: string; 
  message: string; 
  metadata?: Record<string, any>;
}) {
  try {
    const query = `
      INSERT INTO activities (type, message, source, timestamp, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    await pool.query(query, [
      activity.type,
      activity.message,
      'newsletter-agent',
      new Date(),
      JSON.stringify(activity.metadata || {})
    ]);
    
    return true;
  } catch (error) {
    console.error("Error creating activity:", error);
    return false;
  }
}