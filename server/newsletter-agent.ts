import { Request, Response } from "express";
import { newsletterAnalytics, insertNewsletterAnalyticsSchema } from "@shared/schema";
import { db, pool } from "./db";
import { desc, eq } from "drizzle-orm";

// Get all newsletter analytics data with optional limit
export async function getNewsletterAnalytics(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    // Using SQL query directly instead of Drizzle ORM
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

// Get the latest newsletter analytics data
export async function getLatestNewsletterAnalytics(req: Request, res: Response) {
  try {
    const [data] = await db.select()
      .from(newsletterAnalytics)
      .orderBy(desc(newsletterAnalytics.campaignDate))
      .limit(1);
    
    return res.status(200).json(data || null);
  } catch (error) {
    console.error("Error getting latest newsletter analytics:", error);
    return res.status(500).json({ error: "Failed to fetch latest newsletter analytics data" });
  }
}

// Create new newsletter analytics data
export async function createNewsletterAnalytics(req: Request, res: Response) {
  try {
    // Validate the request body
    const parsedData = insertNewsletterAnalyticsSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: "Invalid data format", 
        details: parsedData.error.format() 
      });
    }
    
    // Calculate the rates based on the provided data
    const { totalRecipients, deliveredCount, openCount, clickCount } = parsedData.data;
    const bounceCount = parsedData.data.bounceCount || 0;
    const unsubscribeCount = parsedData.data.unsubscribeCount || 0;
    
    const openRate = (openCount / deliveredCount) * 100;
    const clickRate = (clickCount / deliveredCount) * 100;
    const clickToOpenRate = (clickCount / openCount) * 100;
    const bounceRate = (bounceCount / totalRecipients) * 100;
    const unsubscribeRate = (unsubscribeCount / deliveredCount) * 100;
    
    // Insert data with calculated rates
    const [result] = await db.insert(newsletterAnalytics)
      .values({
        ...parsedData.data,
        openRate,
        clickRate,
        clickToOpenRate,
        bounceRate,
        unsubscribeRate
      })
      .returning();
    
    // Create an activity log entry
    await createNewsletterActivity({
      type: "newsletter",
      message: `New newsletter campaign analytics added: ${result.campaignName}`,
      metadata: { 
        campaignId: result.id,
        campaignName: result.campaignName,
        subject: result.subject,
        openRate,
        clickRate
      }
    });
    
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating newsletter analytics:", error);
    return res.status(500).json({ error: "Failed to create newsletter analytics data" });
  }
}

// Get newsletter analytics by campaign name
export async function getNewsletterAnalyticsByCampaign(req: Request, res: Response) {
  try {
    const campaignName = req.params.campaignName;
    
    const data = await db.select()
      .from(newsletterAnalytics)
      .where(eq(newsletterAnalytics.campaignName, campaignName));
    
    if (data.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error getting newsletter analytics by campaign:", error);
    return res.status(500).json({ error: "Failed to fetch newsletter analytics data for campaign" });
  }
}

// Get newsletter analytics by date range
export async function getNewsletterAnalyticsByDateRange(req: Request, res: Response) {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required query parameters" });
    }
    
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    // Using native SQL query for date range filtering
    const query = `
      SELECT * FROM newsletter_analytics 
      WHERE campaign_date >= $1 AND campaign_date <= $2 
      ORDER BY campaign_date DESC
    `;
    
    const result = await pool.query(query, [startDateObj, endDateObj]);
    const data = result.rows;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error getting newsletter analytics by date range:", error);
    return res.status(500).json({ error: "Failed to fetch newsletter analytics data by date range" });
  }
}

// Handle a webhook from the newsletter service (e.g., Mailchimp, SendGrid, etc.)
export async function handleNewsletterWebhook(req: Request, res: Response) {
  try {
    // Here we'd parse the webhook data from the email service
    // This would be specific to the email service being used
    console.log("Received newsletter webhook:", req.body);
    
    // For demo purposes, we'll create a sample newsletter analytics entry
    const currentDate = new Date();
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()];
    
    // Determine which template this would be based on day of week
    let campaignType = "Regular Update";
    if (dayOfWeek === 'Monday') {
      campaignType = "Weekly Roundup";
    } else if (dayOfWeek === 'Wednesday') {
      campaignType = "Industry Insights";
    } else if (dayOfWeek === 'Friday') {
      campaignType = "Weekend Special";
    }
    
    // Sample data that would be extracted from the webhook payload
    const sampleData = {
      campaignName: `${campaignType} - ${currentDate.toLocaleDateString()}`,
      campaignDate: currentDate,
      subject: `${campaignType}: Latest Updates for Our Subscribers`,
      senderName: "Newsletter Team",
      senderEmail: "newsletter@example.com",
      totalRecipients: 4568,
      deliveredCount: 4532,
      openCount: 1598,
      clickCount: 417,
      bounceCount: 18,
      unsubscribeCount: 5,
      complaintCount: 0,
      contentCategory: campaignType,
      hasAttachment: false,
      templateId: `template-${campaignType.toLowerCase().replace(/\s+/g, '-')}`,
      campaignUrl: "https://example.com/campaign/123",
      reportUrl: "https://example.com/reports/123",
      sendTime: currentDate,
      dayOfWeek: dayOfWeek,
      scheduleType: "regular",
      isAbTest: false,
      deviceBreakdown: {
        desktop: 65,
        mobile: 30,
        tablet: 5
      },
      locationData: {
        "US": 62,
        "UK": 15,
        "Canada": 10,
        "Other": 13
      }
    };
    
    // Calculate rates
    const openRate = (sampleData.openCount / sampleData.deliveredCount) * 100;
    const clickRate = (sampleData.clickCount / sampleData.deliveredCount) * 100;
    const clickToOpenRate = (sampleData.clickCount / sampleData.openCount) * 100;
    const bounceRate = (sampleData.bounceCount / sampleData.totalRecipients) * 100;
    const unsubscribeRate = (sampleData.unsubscribeCount / sampleData.deliveredCount) * 100;
    
    // Insert the data
    const [result] = await db.insert(newsletterAnalytics)
      .values({
        ...sampleData,
        openRate,
        clickRate,
        clickToOpenRate,
        bounceRate,
        unsubscribeRate,
        rawData: req.body
      })
      .returning();
    
    // Create activity log
    await createNewsletterActivity({
      type: "webhook",
      message: `Newsletter webhook received for campaign: ${sampleData.campaignName}`,
      metadata: { 
        campaignId: result.id,
        campaignName: result.campaignName,
        subject: result.subject,
        openRate,
        clickRate
      }
    });
    
    return res.status(200).json({ 
      success: true, 
      message: "Newsletter webhook processed successfully",
      data: result
    });
  } catch (error) {
    console.error("Error handling newsletter webhook:", error);
    return res.status(500).json({ error: "Failed to process newsletter webhook" });
  }
}

// Create newsletter sample data for testing
export async function createNewsletterSample(req: Request, res: Response) {
  try {
    const sampleCampaigns = [
      {
        // Based on actual data provided
        campaignId: "388025b232",
        campaignName: "kevinbadi@nocodeacademy.com",
        campaignDate: new Date("2025-05-22"),
        campaignType: "regular",
        subject: "This Linkedin Sales Agent Sells Itself (Free CodeBase)",
        previewText: "",
        listId: "ab6c0d6df6",
        listIsActive: true,
        listName: "Kev´s No Code Academy",
        
        // Email metrics
        totalRecipients: 500,
        emailsSent: 500,
        emailsCanceled: 0,
        
        // Delivery status
        deliveryStatus: "delivered",
        canCancel: false,
        deliveryEnabled: true,
        
        // Bounce metrics
        hardBounces: 19,
        softBounces: 8,
        syntaxErrors: 0,
        totalBounces: 27,
        
        // Open metrics
        opensTotal: 26,
        uniqueOpens: 23,
        proxyExcludedOpens: 19,
        proxyExcludedUniqueOpens: 18,
        lastOpenTime: new Date("2025-05-22T13:04:00"),
        
        // Click metrics
        clicksTotal: 8,
        uniqueClicks: 8,
        uniqueSubscriberClicks: 4,
        lastClickTime: new Date("2025-05-22T13:01:00"),
        
        // Forward metrics
        forwardsCount: 0,
        forwardsOpens: 0,
        
        // Engagement metrics
        abuseReports: 0,
        unsubscribes: 0,
        
        // Calculated rates
        openRate: 0.048625792811839326,
        proxyExcludedOpenRate: 0.03805496828752643,
        clickRate: 0.008456659619450317,
        clickToOpenRate: 0.173913043478261,
        bounceRate: 0.054,
        unsubscribeRate: 0,
        
        // Timing info
        sendTime: new Date("2025-05-22T12:53:00"),
        dayOfWeek: "Thursday",
        
        // Additional info
        timeseriesData: {}
      },
      {
        // Monday newsletter data
        campaignId: "388025b231",
        campaignName: "Monday Weekly Roundup",
        campaignDate: new Date("2025-05-20"),
        campaignType: "regular",
        subject: "Weekly Industry Roundup - Top Stories This Week",
        previewText: "The biggest updates and resources for your business",
        listId: "ab6c0d6df6",
        listIsActive: true,
        listName: "Kev´s No Code Academy",
        
        // Email metrics
        totalRecipients: 498,
        emailsSent: 498,
        emailsCanceled: 0,
        
        // Delivery status
        deliveryStatus: "delivered",
        canCancel: false,
        deliveryEnabled: true,
        
        // Bounce metrics
        hardBounces: 18,
        softBounces: 7,
        syntaxErrors: 0,
        totalBounces: 25,
        
        // Open metrics
        opensTotal: 143,
        uniqueOpens: 112,
        proxyExcludedOpens: 92,
        proxyExcludedUniqueOpens: 78,
        lastOpenTime: new Date("2025-05-21T09:25:00"),
        
        // Click metrics
        clicksTotal: 45,
        uniqueClicks: 38,
        uniqueSubscriberClicks: 32,
        lastClickTime: new Date("2025-05-21T08:45:00"),
        
        // Forward metrics
        forwardsCount: 3,
        forwardsOpens: 2,
        
        // Engagement metrics
        abuseReports: 0,
        unsubscribes: 2,
        
        // Calculated rates
        openRate: 0.224899598393574,
        proxyExcludedOpenRate: 0.156626506024096,
        clickRate: 0.0763052208835341,
        clickToOpenRate: 0.339285714285714,
        bounceRate: 0.050201612903226,
        unsubscribeRate: 0.004016064257028,
        
        // Timing info
        sendTime: new Date("2025-05-20T17:00:00"),
        dayOfWeek: "Monday",
        
        // Additional info
        timeseriesData: {}
      },
      {
        // Wednesday newsletter data
        campaignId: "388025b230",
        campaignName: "Wednesday Industry Insights",
        campaignDate: new Date("2025-05-15"), 
        campaignType: "regular",
        subject: "5 Industry Trends You Need to Know About",
        previewText: "Expert analysis and actionable insights",
        listId: "ab6c0d6df6",
        listIsActive: true,
        listName: "Kev´s No Code Academy",
        
        // Email metrics
        totalRecipients: 495,
        emailsSent: 495,
        emailsCanceled: 0,
        
        // Delivery status
        deliveryStatus: "delivered",
        canCancel: false,
        deliveryEnabled: true,
        
        // Bounce metrics
        hardBounces: 17,
        softBounces: 9,
        syntaxErrors: 0,
        totalBounces: 26,
        
        // Open metrics
        opensTotal: 186,
        uniqueOpens: 147,
        proxyExcludedOpens: 124,
        proxyExcludedUniqueOpens: 98,
        lastOpenTime: new Date("2025-05-17T14:22:00"),
        
        // Click metrics
        clicksTotal: 78,
        uniqueClicks: 62,
        uniqueSubscriberClicks: 54,
        lastClickTime: new Date("2025-05-17T11:40:00"),
        
        // Forward metrics
        forwardsCount: 6,
        forwardsOpens: 5,
        
        // Engagement metrics
        abuseReports: 0,
        unsubscribes: 1,
        
        // Calculated rates
        openRate: 0.296969696969697,
        proxyExcludedOpenRate: 0.197979797979798,
        clickRate: 0.125252525252525,
        clickToOpenRate: 0.421768707482993,
        bounceRate: 0.052525252525253,
        unsubscribeRate: 0.002020202020202,
        
        // Timing info
        sendTime: new Date("2025-05-15T17:00:00"),
        dayOfWeek: "Wednesday",
        
        // Additional info
        timeseriesData: {}
      }
    ];
    
    const results = [];
    
    for (const campaignData of sampleCampaigns) {
      // Insert the data using SQL query instead of Drizzle ORM to avoid type issues
      const query = `
        INSERT INTO newsletter_analytics (
          campaign_id, campaign_name, campaign_date, campaign_type, subject, preview_text,
          list_id, list_is_active, list_name, total_recipients, emails_sent, emails_canceled,
          delivery_status, can_cancel, delivery_enabled, hard_bounces, soft_bounces, syntax_errors,
          total_bounces, opens_total, unique_opens, proxy_excluded_opens, proxy_excluded_unique_opens,
          last_open_time, clicks_total, unique_clicks, unique_subscriber_clicks, last_click_time,
          forwards_count, forwards_opens, abuse_reports, unsubscribes, open_rate, proxy_excluded_open_rate,
          click_rate, click_to_open_rate, bounce_rate, unsubscribe_rate, send_time, day_of_week,
          timeseries_data
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36,
          $37, $38, $39, $40, $41
        ) RETURNING *
      `;
      
      const result = await pool.query(query, [
        campaignData.campaignId,
        campaignData.campaignName,
        campaignData.campaignDate,
        campaignData.campaignType,
        campaignData.subject,
        campaignData.previewText,
        campaignData.listId,
        campaignData.listIsActive,
        campaignData.listName,
        campaignData.totalRecipients,
        campaignData.emailsSent,
        campaignData.emailsCanceled,
        campaignData.deliveryStatus,
        campaignData.canCancel,
        campaignData.deliveryEnabled,
        campaignData.hardBounces,
        campaignData.softBounces,
        campaignData.syntaxErrors,
        campaignData.totalBounces,
        campaignData.opensTotal,
        campaignData.uniqueOpens,
        campaignData.proxyExcludedOpens,
        campaignData.proxyExcludedUniqueOpens,
        campaignData.lastOpenTime,
        campaignData.clicksTotal,
        campaignData.uniqueClicks,
        campaignData.uniqueSubscriberClicks,
        campaignData.lastClickTime,
        campaignData.forwardsCount,
        campaignData.forwardsOpens,
        campaignData.abuseReports,
        campaignData.unsubscribes,
        campaignData.openRate,
        campaignData.proxyExcludedOpenRate,
        campaignData.clickRate,
        campaignData.clickToOpenRate,
        campaignData.bounceRate,
        campaignData.unsubscribeRate,
        campaignData.sendTime,
        campaignData.dayOfWeek,
        JSON.stringify(campaignData.timeseriesData || {})
      ]);
        
      results.push(result);
      
      // Create activity log
      await createNewsletterActivity({
        type: "sample",
        message: `Created sample newsletter data: ${campaignData.campaignName}`,
        metadata: { 
          campaignId: campaignData.campaignId,
          campaignName: campaignData.campaignName
        }
      });
    }
    
    return res.status(201).json({ 
      success: true, 
      message: "Sample newsletter data created",
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error("Error creating newsletter sample data:", error);
    return res.status(500).json({ error: "Failed to create newsletter sample data" });
  }
}

// Helper function to create activity logs for newsletter events
async function createNewsletterActivity(activity: { 
  type: string; 
  message: string; 
  metadata?: Record<string, any>;
}) {
  try {
    const { activities } = await import("@shared/schema");
    
    await db.insert(activities)
      .values({
        type: activity.type,
        message: activity.message,
        metadata: activity.metadata || {}
      });
  } catch (error) {
    console.error("Error creating newsletter activity:", error);
  }
}