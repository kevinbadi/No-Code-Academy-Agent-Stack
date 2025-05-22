import { Request, Response } from "express";
import { pool } from "./db";
import { activities } from "@shared/schema";

/**
 * Handle a webhook from a newsletter service with the exact format provided
 */
export async function handleNewsletterWebhook(req: Request, res: Response) {
  try {
    const webhookData = req.body;
    console.log("Received newsletter webhook:", webhookData);
    
    // Validate the data
    if (!webhookData) {
      return res.status(400).json({ error: "Invalid newsletter webhook data" });
    }
    
    // Extract data from the webhook payload
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
    const campaignDate = sendTime; // Use send time as campaign date
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
    
    // Parse last click time
    const lastClickStr = webhookData['Last Click'] || '';
    const lastClickTime = lastClickStr ? new Date(lastClickStr) : null;
    
    // Calculate additional metrics
    const clickToOpenRate = uniqueOpens > 0 ? uniqueClicks / uniqueOpens : 0;
    const bounceRate = emailsSent > 0 ? totalBounces / emailsSent : 0;
    const unsubscribeRate = emailsSent > 0 ? unsubscribed / emailsSent : 0;
    
    // Delivery status information
    const deliveryEnabled = webhookData['Enabled'] === 'true';
    const canCancel = webhookData['can_cancel'] === 'true';
    const deliveryStatus = webhookData['status'] || 'delivered';
    const emailsCanceled = parseInt(webhookData['emails_canceled'] || '0');
    
    // Store the data using SQL query
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
      campaignDate,
      campaignType,
      subjectLine,
      previewText,
      listId,
      listIsActive,
      listName,
      emailsSent, // total_recipients
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
      0, // forwardsCount - not provided in data
      0, // forwardsOpens - not provided in data
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
      JSON.stringify(webhookData)
    ]);
    
    // Create activity log
    await createNewsletterActivity({
      type: "webhook",
      message: `Received newsletter data for campaign "${campaignTitle}"`,
      metadata: {
        campaignId: campaignId,
        campaignName: campaignTitle,
        openRate: openRate,
        clickRate: clickRate
      }
    });
    
    return res.status(200).json({ 
      success: true, 
      message: "Newsletter webhook processed successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error handling newsletter webhook:", error);
    return res.status(500).json({ error: "Failed to process newsletter webhook" });
  }
}

// Helper function to create activity log entries
async function createNewsletterActivity(activity: { 
  type: string; 
  message: string; 
  metadata?: Record<string, any>; 
}) {
  try {
    // Use SQL directly to avoid ORM issues
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
    console.error("Error creating newsletter activity:", error);
    return false;
  }
}

/**
 * Create sample newsletter data for testing
 */
export async function createNewsletterSample(req: Request, res: Response) {
  try {
    // Sample data exactly matching the webhook format
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
    
    // Monday newsletter data sample
    const mondayData = {
      "Campaign ID": "388025b231",
      "Campaign Title": "Monday Weekly Roundup",
      "Type": "regular",
      "List ID": "ab6c0d6df6",
      "List Is Active": "true",
      "List Name": "Kev´s No Code Academy",
      "Subject Line": "Weekly Industry Roundup - Top Stories This Week",
      "Preview Text": "The biggest updates and resources for your business",
      "Emails Sent": "498",
      "Abuse Reports": "0",
      "Unsubscribed": "2",
      "Send Time": "May 20, 2025 05:00 PM",
      "Hard Bounces": "18",
      "Soft Bounces": "7",
      "Syntax Errors": "0",
      "Opens Total": "143",
      "Unique Opens": "112",
      "proxy_excluded_opens": "92",
      "proxy_excluded_unique_opens": "78",
      "Open Rate": "0.224899598393574",
      "proxy_excluded_open_rate": "0.156626506024096",
      "Last Open": "May 21, 2025 09:25 AM",
      "Clicks Total": "45",
      "Unique Clicks": "38",
      "Unique Subscriber Clicks": "32",
      "Click Rate": "0.0763052208835341",
      "Last Click": "May 21, 2025 08:45 AM",
      "Enabled": "true",
      "can_cancel": "false",
      "status": "delivered",
      "emails_sent": "498",
      "emails_canceled": "0"
    };
    
    // Wednesday newsletter data sample
    const wednesdayData = {
      "Campaign ID": "388025b230",
      "Campaign Title": "Wednesday Industry Insights",
      "Type": "regular",
      "List ID": "ab6c0d6df6",
      "List Is Active": "true",
      "List Name": "Kev´s No Code Academy",
      "Subject Line": "5 Industry Trends You Need to Know About",
      "Preview Text": "Expert analysis and actionable insights",
      "Emails Sent": "495",
      "Abuse Reports": "0",
      "Unsubscribed": "1",
      "Send Time": "May 15, 2025 05:00 PM",
      "Hard Bounces": "17",
      "Soft Bounces": "9",
      "Syntax Errors": "0",
      "Opens Total": "186",
      "Unique Opens": "147",
      "proxy_excluded_opens": "124",
      "proxy_excluded_unique_opens": "98",
      "Open Rate": "0.296969696969697",
      "proxy_excluded_open_rate": "0.197979797979798",
      "Last Open": "May 17, 2025 02:22 PM",
      "Clicks Total": "78",
      "Unique Clicks": "62",
      "Unique Subscriber Clicks": "54",
      "Click Rate": "0.125252525252525",
      "Last Click": "May 17, 2025 11:40 AM",
      "Enabled": "true",
      "can_cancel": "false",
      "status": "delivered",
      "emails_sent": "495",
      "emails_canceled": "0"
    };
    
    const samples = [sampleData, mondayData, wednesdayData];
    const results = [];
    
    // Insert each sample
    for (const data of samples) {
      // Forward to webhook handler
      const fakeReq = { body: data } as Request;
      const fakeRes = {
        status: (code: number) => ({
          json: (data: any) => {
            results.push(data);
            return data;
          }
        })
      } as unknown as Response;
      
      await handleNewsletterWebhook(fakeReq, fakeRes);
    }
    
    return res.status(201).json({ 
      success: true, 
      message: `Created ${samples.length} newsletter data samples`,
      results
    });
  } catch (error) {
    console.error("Error creating newsletter samples:", error);
    return res.status(500).json({ error: "Failed to create newsletter samples" });
  }
}

/**
 * Get all newsletter analytics
 */
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

/**
 * Get latest newsletter analytics
 */
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