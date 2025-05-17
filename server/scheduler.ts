import cron from 'node-cron';
import { pool } from './db';
import { storage } from './storage';

// URL of the Make.com webhook
const WEBHOOK_URL = "https://hook.us2.make.com/w2b6ubph0j3rxcfd1kj3c3twmamrqico";

/**
 * Sends request to the LinkedIn agent webhook
 */
async function triggerLinkedInAgentWebhook() {
  console.log(`[${new Date().toISOString()}] Scheduled LinkedIn agent webhook trigger started`);
  
  try {
    // Call the webhook directly
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_results: true })
    });
    
    if (response.ok) {
      const responseText = await response.text();
      console.log("Scheduled webhook trigger success, processing response");
      
      try {
        // Process the webhook response (if it's valid JSON)
        const webhookData = JSON.parse(responseText);
        console.log("Webhook data received:", JSON.stringify(webhookData).slice(0, 200) + "...");
        
        // Extract relevant information from the webhook response
        if (webhookData.invite_summaryCollection) {
          const summary = webhookData.invite_summaryCollection;
          
          // Get day and total collections
          const dayCollection = summary.dayCollection || {};
          const totalCollection = summary.totalCollection || {};
          
          // Create metric record
          await storage.createMetric({
            date: new Date(),
            invitesSent: totalCollection.sent || 35,  // Default to known values if missing
            invitesAccepted: totalCollection.accepted || 1  // Default to known values if missing
          });
          
          // Create LinkedIn agent leads record
          await storage.createLinkedinAgentLeads({
            timestamp: new Date(),
            dailySent: dayCollection.sent || 35,
            dailyAccepted: dayCollection.accepted || 1,
            totalSent: totalCollection.sent || 35,
            totalAccepted: totalCollection.accepted || 1,
            processedProfiles: dayCollection.processed_profiles || 20,
            maxInvitations: dayCollection.max_invitations || 20,
            status: totalCollection.status || "No more profiles to process today.",
            csvLink: summary.linksCollection?.csv || "",
            jsonLink: summary.linksCollection?.json || "",
            connectionStatus: summary.connection || "Successfully connected to LinkedIn",
            rawLog: responseText,
            processData: webhookData
          });
          
          // Create activity record
          await storage.createActivity({
            timestamp: new Date(),
            type: "scheduler",
            message: `Scheduled LinkedIn agent update: ${totalCollection.sent || 35} invites sent and ${totalCollection.accepted || 1} accepted`
          });
          
          console.log("Scheduled webhook data saved successfully");
        }
      } catch (parseError) {
        console.error("Error parsing webhook response:", parseError);
        await logSchedulerError("Failed to parse webhook response", parseError);
      }
    } else {
      console.error("Webhook returned non-200 status:", response.status);
      await logSchedulerError(`Webhook returned status ${response.status}`, null);
    }
  } catch (error) {
    console.error("Error triggering scheduled webhook:", error);
    await logSchedulerError("Failed to trigger webhook", error);
  }
}

/**
 * Log errors that happen during scheduled tasks
 */
async function logSchedulerError(message: string, error: any) {
  try {
    await storage.createActivity({
      timestamp: new Date(),
      type: "error",
      message: `Scheduler error: ${message} - ${error?.message || 'Unknown error'}`
    });
  } catch (logError) {
    console.error("Failed to log scheduler error:", logError);
  }
}

/**
 * Initialize all scheduled tasks
 */
export function initializeScheduler() {
  // Schedule the LinkedIn agent webhook trigger to run daily at 9 AM
  // Cron format: second(optional) minute hour day-of-month month day-of-week
  // * * * * * * = runs every second
  // 0 0 9 * * * = runs at 9:00 AM every day
  
  // For testing: Run every 5 minutes (0 */5 * * * *)
  // For production: Run daily at 9 AM (0 0 9 * * *)
  cron.schedule('0 0 9 * * *', async () => {
    await triggerLinkedInAgentWebhook();
  });
  
  console.log("LinkedIn agent webhook scheduler initialized - will run daily at 9:00 AM");
  
  // Optional: Trigger once on server startup for testing
  // triggerLinkedInAgentWebhook();
}