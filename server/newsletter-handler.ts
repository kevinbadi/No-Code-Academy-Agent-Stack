import { Request, Response } from "express";
import { pool } from "./db";
import { activities } from "@shared/schema";
import { formatNewsletterWebhookData, createNewsletterInsertQuery } from "./newsletter-formatter";

/**
 * Handle webhook data from newsletter service
 */
export async function handleNewsletterWebhook(req: Request, res: Response) {
  try {
    const webhookData = req.body;
    console.log("Received newsletter webhook data:", webhookData);
    
    // Validate the webhook data
    if (!webhookData || Object.keys(webhookData).length === 0) {
      return res.status(400).json({ error: "Invalid newsletter webhook data" });
    }
    
    // Format the data
    const formattedData = formatNewsletterWebhookData(webhookData);
    
    // Get the SQL query and parameters
    const { query, getParams } = createNewsletterInsertQuery();
    const params = getParams(formattedData);
    
    // Insert the data into the database
    const result = await pool.query(query, params);
    
    // Log the activity
    await createActivity({
      type: "webhook",
      message: `Received newsletter data for campaign "${formattedData.campaignName}"`,
      metadata: {
        campaignId: formattedData.campaignId,
        campaignName: formattedData.campaignName,
        openRate: formattedData.openRate,
        clickRate: formattedData.clickRate
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

/**
 * Create sample newsletter data for testing
 */
export async function createNewsletterSample(req: Request, res: Response) {
  try {
    // Sample data for three campaigns
    const samples = [
      {
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
      },
      {
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
      },
      {
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
      }
    ];
    
    const results = [];
    
    // Process each sample
    for (const sample of samples) {
      const formattedData = formatNewsletterWebhookData(sample);
      const { query, getParams } = createNewsletterInsertQuery();
      const params = getParams(formattedData);
      
      const result = await pool.query(query, params);
      results.push(result.rows[0]);
      
      // Log activity
      await createActivity({
        type: "sample",
        message: `Created sample newsletter data for campaign "${formattedData.campaignName}"`,
        metadata: {
          campaignId: formattedData.campaignId,
          campaignName: formattedData.campaignName
        }
      });
    }
    
    return res.status(201).json({
      success: true,
      message: `Created ${samples.length} newsletter data samples`,
      data: results
    });
  } catch (error) {
    console.error("Error creating newsletter samples:", error);
    return res.status(500).json({ error: "Failed to create newsletter samples" });
  }
}

/**
 * Create activity log for newsletter actions
 */
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