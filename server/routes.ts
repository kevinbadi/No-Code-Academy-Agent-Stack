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
      const webhookUrl = "https://hook.us2.make.com/8j6hpulng3f8obvebciva6kzpg6kyydx";
      
      console.log("Triggering external webhook:", webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: "dashboard",
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Webhook response error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Webhook response:", data);
      
      // Create activity log for the webhook call
      await storage.createActivity({
        timestamp: new Date(),
        type: "agent",
        message: "External LinkedIn agent webhook triggered"
      });
      
      res.json({ success: true, data });
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
