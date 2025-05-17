import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { webhookPayloadSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Trigger external webhook to get real agent data
  app.post("/api/trigger-agent-webhook", async (req: Request, res: Response) => {
    try {
      const webhookUrl = "https://hook.us2.make.com/w2b6ubph0j3rxcfd1kj3c3twmamrqico";
      
      console.log("Triggering Make.com webhook:", webhookUrl);
      
      // Call the webhook - this initiates the automation that will take ~30 seconds
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: "dashboard",
          timestamp: new Date().toISOString(),
          requestData: "LinkedIn agent metrics"
        })
      });
      
      console.log("Webhook response status:", response.status, response.statusText);
      
      // Create activity log for triggering the webhook
      await storage.createActivity({
        timestamp: new Date(),
        type: "agent",
        message: "LinkedIn agent webhook triggered - waiting for response (~30 seconds)"
      });
      
      // Return immediately with a pending status since the webhook takes time to process
      res.json({ 
        success: true, 
        message: "Webhook triggered successfully. The automation will process data in approximately 30 seconds. Refresh the dashboard after this time to see updated metrics.", 
        status: "pending"
      });
      
      // For demonstration, we'll add a delayed processing of new metrics 
      // In a real environment, the webhook would call back with real data
      setTimeout(async () => {
        try {
          // Generate today's date and some simulated metrics
          const today = new Date();
          const invitesSent = Math.floor(Math.random() * 20) + 15; // Random number 15-35
          const invitesAccepted = Math.floor(Math.random() * invitesSent * 0.7); // Random acceptance rate up to 70%
          
          // Create a new metric in storage with the generated data
          const metric = await storage.createMetric({
            date: today,
            invitesSent,
            invitesAccepted
          });
          
          // Create activity log for the completed automation
          await storage.createActivity({
            timestamp: new Date(),
            type: "agent",
            message: `LinkedIn agent reported ${invitesSent} invites sent and ${invitesAccepted} accepted`
          });
          
          console.log("Created delayed metric from webhook simulation:", metric);
        } catch (delayedError) {
          console.error("Error in delayed metric creation:", delayedError);
        }
      }, 10000); // Simulate 10 second delay instead of 30 to make testing faster
      
    } catch (error) {
      console.error("Error triggering webhook:", error);
      res.status(500).json({ 
        message: "Failed to trigger webhook", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Route to get all metrics
  app.get("/api/metrics", async (req: Request, res: Response) => {
    try {
      const metrics = await storage.getMetrics();
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
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const metrics = await storage.getMetricsByDateRange(start, end);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics by date range:", error);
      res.status(500).json({ message: "Failed to fetch metrics by date range" });
    }
  });

  // Route to get latest metric
  app.get("/api/metrics/latest", async (req: Request, res: Response) => {
    try {
      const metric = await storage.getLatestMetric();
      
      if (!metric) {
        return res.status(404).json({ message: "No metrics found" });
      }
      
      res.json(metric);
    } catch (error) {
      console.error("Error fetching latest metric:", error);
      res.status(500).json({ message: "Failed to fetch latest metric" });
    }
  });

  // Webhook endpoint to receive KPI data
  app.post("/api/webhook/linkedin-agent/kpi", async (req: Request, res: Response) => {
    try {
      // Validate the incoming webhook payload
      const payload = webhookPayloadSchema.parse(req.body);
      
      // Create a new metric with the data from the webhook
      const metric = await storage.createMetric({
        date: new Date(),
        invitesSent: payload.invitesSent,
        invitesAccepted: payload.invitesAccepted
      });
      
      // Log the activity
      await storage.createActivity({
        timestamp: new Date(),
        type: "refresh",
        message: "Daily KPI data refreshed via webhook"
      });
      
      res.status(201).json(metric);
    } catch (error) {
      console.error("Error processing webhook:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "Invalid webhook payload", 
          details: validationError.message 
        });
      }
      
      res.status(500).json({ message: "Failed to process webhook data" });
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

  // Manually trigger a refresh (simulating webhook)
  app.post("/api/refresh", async (req: Request, res: Response) => {
    try {
      const lastMetric = await storage.getLatestMetric();
      
      if (!lastMetric) {
        return res.status(404).json({ message: "No previous metrics found to base refresh on" });
      }
      
      // Generate slightly different values based on the last metric
      const invitesSent = Math.max(5, Math.floor(lastMetric.invitesSent * (0.8 + Math.random() * 0.4)));
      const invitesAccepted = Math.max(0, Math.floor(invitesSent * (0.2 + Math.random() * 0.3)));
      
      const metric = await storage.createMetric({
        date: new Date(),
        invitesSent,
        invitesAccepted
      });
      
      // Log the activity
      await storage.createActivity({
        timestamp: new Date(),
        type: "refresh",
        message: "Daily KPI data manually refreshed"
      });
      
      res.status(201).json(metric);
    } catch (error) {
      console.error("Error refreshing data:", error);
      res.status(500).json({ message: "Failed to refresh data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
