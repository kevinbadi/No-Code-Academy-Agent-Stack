import { Express, Request, Response, NextFunction } from "express";
import { Server } from "http";
import { storage } from "./storage";
import { webhookPayloadSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storeWebhookData, getLatestWebhookData } from "./webhook-db";
import { db, pool } from "./db";

export async function registerRoutes(app: Express, existingServer?: Server): Promise<Server> {
  // Create a new HTTP server if one wasn't provided
  const server = existingServer || new Server(app);
  // Trigger external webhook to get real agent data
  app.post("/api/trigger-agent-webhook", async (req: Request, res: Response) => {
    try {
      const webhookUrl = "https://hook.us2.make.com/w2b6ubph0j3rxcfd1kj3c3twmamrqico";
      
      console.log("Triggering Make.com webhook from server:", webhookUrl);
      
      // Improved webhook call with proper response handling
      try {
        // Set a reasonable timeout for the webhook request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_results: true }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const responseText = await response.text();
          console.log("Webhook response received successfully");
          
          try {
            // Try to parse as JSON
            const webhookData = JSON.parse(responseText);
            // Process webhook response here...
            
            return res.status(200).json({ 
              success: true, 
              message: "Webhook triggered successfully",
              data: webhookData
            });
          } catch (parseError) {
            console.log("Webhook response is not valid JSON:", parseError);
            return res.status(200).json({ 
              success: true, 
              message: "Webhook triggered with text response",
              text: responseText
            });
          }
        } else {
          console.error("Webhook returned non-200 status:", response.status);
          return res.status(response.status).json({ 
            success: false, 
            message: "Webhook returned an error",
            status: response.status
          });
        }
      } catch (fetchError) {
        console.error("Error during webhook call:", fetchError.message);
        
        // Still return success to client as webhook might be processing asynchronously
        return res.status(202).json({ 
          success: true, 
          message: "Webhook triggered but response not available",
          error: fetchError.message
        });
      }
      
      // Generate metrics for the dashboard demo
      const now = new Date();
      const invitesSent = Math.floor(Math.random() * 20) + 15; // Random number 15-35
      const invitesAccepted = Math.floor(Math.random() * invitesSent * 0.7); // Random acceptance rate up to 70%
      
      // Create metric
      const metric = await storage.createMetric({
        date: now,
        invitesSent,
        invitesAccepted
      });
      
      // Create activity for metrics update
      await storage.createActivity({
        timestamp: now,
        type: "agent",
        message: `LinkedIn agent reported ${invitesSent} invites sent and ${invitesAccepted} accepted`
      });
      
      console.log("Created new metric from webhook:", metric);
      
      // Respond with success
      res.json({ 
        success: true, 
        message: "Webhook triggered and metrics updated successfully", 
        data: metric 
      });
    } catch (error) {
      console.error("Error in webhook process:", error);
      res.status(500).json({ 
        message: "Failed to process webhook", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Route to get all metrics
  app.get("/api/metrics", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const metrics = await storage.getMetrics(limit);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });
  
  // Route to get metrics by date range
  app.get("/api/metrics/range", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }
      
      const metrics = await storage.getMetricsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics by date range:", error);
      res.status(500).json({ message: "Failed to fetch metrics by date range" });
    }
  });
  
  // Route to get the latest metric
  app.get("/api/metrics/latest", async (req: Request, res: Response) => {
    try {
      const metric = await storage.getLatestMetric();
      res.json(metric || null);
    } catch (error) {
      console.error("Error fetching latest metric:", error);
      res.status(500).json({ message: "Failed to fetch latest metric" });
    }
  });
  
  // Route to create a new metric
  app.post("/api/metrics", async (req: Request, res: Response) => {
    try {
      const metric = await storage.createMetric({
        date: new Date(req.body.date || new Date()),
        invitesSent: req.body.invitesSent,
        invitesAccepted: req.body.invitesAccepted
      });
      
      res.status(201).json(metric);
    } catch (error) {
      console.error("Error creating metric:", error);
      res.status(500).json({ message: "Failed to create metric" });
    }
  });
  
  // Route to create LinkedIn agent leads data
  app.post("/api/linkedin-agent-leads", async (req: Request, res: Response) => {
    try {
      console.log("Received webhook data for storage:", req.body);
      
      // Try to store the data directly in the PostgreSQL database
      try {
        const data = await storeWebhookData({
          timestamp: new Date(req.body.timestamp || new Date()),
          dailySent: req.body.dailySent,
          dailyAccepted: req.body.dailyAccepted,
          totalSent: req.body.totalSent,
          totalAccepted: req.body.totalAccepted,
          processedProfiles: req.body.processedProfiles,
          maxInvitations: req.body.maxInvitations,
          status: req.body.status,
          csvLink: req.body.csvLink,
          jsonLink: req.body.jsonLink,
          connectionStatus: req.body.connectionStatus,
          rawLog: req.body.rawLog,
          processData: req.body.processData
        });
        
        console.log("Successfully stored webhook data in PostgreSQL");
        return res.status(201).json(data);
      } catch (dbError) {
        console.error("Failed to store data in PostgreSQL, falling back to memory storage:", dbError);
        
        // Fall back to memory storage
        const memData = await storage.createLinkedinAgentLeads({
          timestamp: new Date(req.body.timestamp || new Date()),
          dailySent: req.body.dailySent,
          dailyAccepted: req.body.dailyAccepted,
          totalSent: req.body.totalSent,
          totalAccepted: req.body.totalAccepted,
          processedProfiles: req.body.processedProfiles,
          maxInvitations: req.body.maxInvitations,
          status: req.body.status,
          csvLink: req.body.csvLink,
          jsonLink: req.body.jsonLink,
          connectionStatus: req.body.connectionStatus,
          rawLog: req.body.rawLog,
          processData: req.body.processData
        });
        
        return res.status(201).json(memData);
      }
    } catch (error) {
      console.error("Error creating LinkedIn agent leads data:", error);
      res.status(500).json({ message: "Failed to create LinkedIn agent leads data" });
    }
  });
  
  // Route to get LinkedIn agent leads data
  app.get("/api/linkedin-agent-leads", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      try {
        // Try to get the data from PostgreSQL first
        const data = await storage.getLinkedinAgentLeads(limit);
        return res.json(data);
      } catch (dbError) {
        console.error("Database error fetching LinkedIn agent leads:", dbError);
        // Fall back to memory storage
        const data = await storage.getLinkedinAgentLeads(limit);
        return res.json(data);
      }
    } catch (error) {
      console.error("Error fetching LinkedIn agent leads data:", error);
      res.status(500).json({ message: "Failed to fetch LinkedIn agent leads data" });
    }
  });
  
  // Route to get the latest LinkedIn agent leads entry
  app.get("/api/linkedin-agent-leads/latest", async (req: Request, res: Response) => {
    try {
      // First try to get data directly from the database
      try {
        // Check the database for the most recent entry
        const result = await pool.query(`
          SELECT * FROM linkedin_agent_leads 
          ORDER BY timestamp DESC 
          LIMIT 1
        `);
        
        if (result.rows && result.rows.length > 0) {
          const data = result.rows[0];
          console.log("Retrieved LinkedIn agent leads from database:", data);
          
          // Convert snake_case columns to camelCase for frontend
          const response = {
            id: data.id,
            timestamp: data.timestamp,
            dailySent: data.daily_sent,
            dailyAccepted: data.daily_accepted,
            totalSent: data.total_sent,
            totalAccepted: data.total_accepted,
            processedProfiles: data.processed_profiles,
            maxInvitations: data.max_invitations,
            status: data.status,
            csvLink: data.csv_link,
            jsonLink: data.json_link,
            connectionStatus: data.connection_status,
            rawLog: data.raw_log,
            processData: data.process_data
          };
          
          console.log("Sending LinkedIn data to frontend:", response);
          return res.json(response);
        }
      } catch (dbError) {
        console.error("Database error fetching latest LinkedIn agent leads:", dbError);
      }
      
      // Fall back to memory storage if no data in database
      const data = await storage.getLatestLinkedinAgentLeads();
      return res.json(data || null);
    } catch (error) {
      console.error("Error fetching latest LinkedIn agent leads data:", error);
      res.status(500).json({ message: "Failed to fetch latest LinkedIn agent leads data" });
    }
  });
  
  // Webhook endpoint for LinkedIn agent to report KPI data
  app.post("/api/webhook/linkedin-agent/kpi", async (req: Request, res: Response) => {
    try {
      console.log("Received webhook payload:", JSON.stringify(req.body, null, 2));
      
      // Check for the invite_summaryCollection structure
      const inviteSummary = req.body.invite_summaryCollection;
      
      if (inviteSummary) {
        console.log("Processing text response");
        console.log("Webhook response parsed as JSON:", inviteSummary);
        
        // Extract day collection data
        const dayCollection = inviteSummary.dayCollection || {};
        console.log("Day collection data:", dayCollection);
        
        // Extract total collection data
        const totalCollection = inviteSummary.totalCollection || {};
        console.log("Total collection data:", totalCollection);
        
        // Extract links collection data
        const linksCollection = inviteSummary.linksCollection || {};
        console.log("Links collection data:", linksCollection);
        
        // Extract connection status
        const connectionStatus = inviteSummary.connection || "";
        
        console.log("Successfully parsed webhook JSON data");
        
        // Create data object for database insertion
        const extractedData = {
          invitesSent: dayCollection.sent || 0,
          invitesAccepted: dayCollection.accepted || 0,
          dailySent: dayCollection.sent || 0,
          dailyAccepted: dayCollection.accepted || 0,
          totalSent: totalCollection.sent || 0,
          totalAccepted: totalCollection.accepted || 0,
          maxInvitations: dayCollection.max_invitations || 0,
          processedProfiles: dayCollection.processed_profiles || 0,
          status: totalCollection.status || "",
          csvLink: linksCollection.csv || "",
          jsonLink: linksCollection.json || "",
          connectionStatus: connectionStatus,
          rawLog: JSON.stringify(req.body, null, 2)
        };
        
        console.log("Final extracted webhook data:", extractedData);
        
        try {
          // 1. Create a new metric from the webhook data
          const metric = await storage.createMetric({
            date: new Date(),
            invitesSent: extractedData.invitesSent,
            invitesAccepted: extractedData.invitesAccepted
          });
          
          // 2. Create activity log for the webhook
          await storage.createActivity({
            timestamp: new Date(),
            type: "agent",
            message: `LinkedIn agent reported ${extractedData.invitesSent} invites sent and ${extractedData.invitesAccepted} accepted`
          });
          
          // 3. Store the LinkedIn agent leads data directly in the database
          // First add to our storage interface
          const leadsData = await storage.createLinkedinAgentLeads({
            timestamp: new Date(),
            dailySent: extractedData.dailySent,
            dailyAccepted: extractedData.dailyAccepted,
            totalSent: extractedData.totalSent,
            totalAccepted: extractedData.totalAccepted,
            maxInvitations: extractedData.maxInvitations,
            processedProfiles: extractedData.processedProfiles,
            status: extractedData.status,
            csvLink: extractedData.csvLink,
            jsonLink: extractedData.jsonLink,
            connectionStatus: extractedData.connectionStatus,
            rawLog: extractedData.rawLog,
            processData: {}
          });
          
          console.log("Successfully inserted LinkedIn agent leads data:", leadsData);
          
          return res.status(201).json({ 
            success: true, 
            message: "Webhook data processed successfully",
            data: {
              metric,
              leads: leadsData
            }
          });
        } catch (dbError) {
          console.error("Database error storing webhook data:", dbError);
          return res.status(500).json({ 
            message: "Database error storing webhook data", 
            error: dbError instanceof Error ? dbError.message : "Unknown database error" 
          });
        }
      } else {
        // Fall back to the standard webhook payload schema
        const result = webhookPayloadSchema.safeParse(req.body);
        
        if (!result.success) {
          const validationError = fromZodError(result.error);
          console.error("Invalid webhook payload:", validationError);
          return res.status(400).json({ 
            message: "Invalid webhook payload format", 
            errors: validationError.details 
          });
        }
        
        const payload = result.data;
        
        // Create a new metric from the webhook data
        const metric = await storage.createMetric({
          date: new Date(),
          invitesSent: payload.invitesSent,
          invitesAccepted: payload.invitesAccepted
        });
        
        // Create activity log for the webhook
        await storage.createActivity({
          timestamp: new Date(),
          type: "agent",
          message: `LinkedIn agent reported ${payload.invitesSent} invites sent and ${payload.invitesAccepted} accepted`
        });
        
        console.log("Created metric from webhook:", metric);
        
        return res.status(201).json({ success: true, data: metric });
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).json({ 
        message: "Failed to process webhook", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Route to get activities
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });
  
  // Route to create a new activity
  app.post("/api/activities", async (req: Request, res: Response) => {
    try {
      const activity = await storage.createActivity({
        timestamp: new Date(req.body.timestamp || new Date()),
        type: req.body.type,
        message: req.body.message
      });
      
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });
  
  // Route to manually refresh data (e.g., generate some test data)
  app.post("/api/refresh", async (req: Request, res: Response) => {
    try {
      // Generate a new metric with random data
      const invitesSent = Math.floor(Math.random() * 20) + 10;
      const invitesAccepted = Math.floor(Math.random() * invitesSent * 0.8);
      
      const metric = await storage.createMetric({
        date: new Date(),
        invitesSent,
        invitesAccepted
      });
      
      // Create activity log for the refresh
      await storage.createActivity({
        timestamp: new Date(),
        type: "system",
        message: "Data refreshed manually"
      });
      
      res.json({ success: true, message: "Data refreshed successfully", data: metric });
    } catch (error) {
      console.error("Error refreshing data:", error);
      res.status(500).json({ message: "Failed to refresh data" });
    }
  });
  
  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  });
  
  // Start the server if it wasn't provided
  if (!existingServer) {
    return app.listen(0);
  }
  
  return existingServer;
}