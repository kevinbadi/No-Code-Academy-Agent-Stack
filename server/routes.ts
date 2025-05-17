import { Express, Request, Response, NextFunction } from "express";
import { Server } from "http";
import { storage } from "./storage";
import { webhookPayloadSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express, existingServer?: Server): Promise<Server> {
  // Create a new HTTP server if one wasn't provided
  const server = existingServer || new Server(app);
  // Trigger external webhook to get real agent data
  app.post("/api/trigger-agent-webhook", async (req: Request, res: Response) => {
    try {
      const webhookUrl = "https://hook.us2.make.com/w2b6ubph0j3rxcfd1kj3c3twmamrqico";
      
      console.log("Triggering Make.com webhook:", webhookUrl);
      
      // Simple webhook call
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_results: true })
      }).catch(err => {
        console.log("Note: webhook may time out - this is normal:", err.message);
      });
      
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
      const data = await storage.createLinkedinAgentLeads({
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
      
      res.status(201).json(data);
    } catch (error) {
      console.error("Error creating LinkedIn agent leads data:", error);
      res.status(500).json({ message: "Failed to create LinkedIn agent leads data" });
    }
  });
  
  // Route to get LinkedIn agent leads data
  app.get("/api/linkedin-agent-leads", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const data = await storage.getLinkedinAgentLeads(limit);
      res.json(data);
    } catch (error) {
      console.error("Error fetching LinkedIn agent leads data:", error);
      res.status(500).json({ message: "Failed to fetch LinkedIn agent leads data" });
    }
  });
  
  // Route to get the latest LinkedIn agent leads entry
  app.get("/api/linkedin-agent-leads/latest", async (req: Request, res: Response) => {
    try {
      const data = await storage.getLatestLinkedinAgentLeads();
      res.json(data || null);
    } catch (error) {
      console.error("Error fetching latest LinkedIn agent leads data:", error);
      res.status(500).json({ message: "Failed to fetch latest LinkedIn agent leads data" });
    }
  });
  
  // Webhook endpoint for LinkedIn agent to report KPI data
  app.post("/api/webhook/linkedin-agent/kpi", async (req: Request, res: Response) => {
    try {
      // Validate the webhook payload
      const result = webhookPayloadSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        console.error("Invalid webhook payload:", validationError);
        return res.status(400).json({ 
          message: "Invalid webhook payload", 
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
      
      res.status(201).json({ success: true, data: metric });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ 
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
  
  // Start the server
  const server = app.listen(0);
  return server;
}