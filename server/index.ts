
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import * as process from "process";
import { createServer } from "http";
import { initializeScheduler } from "./scheduler";

// Create Express application
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware for logging API calls
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Start the server directly without using workflows
import http from 'http';
import { storage } from "./storage";
import { webhookPayloadSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const PORT = 8888; // Try a completely different port

// Create HTTP server
const server = http.createServer(app);

// API Routes
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await storage.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

app.get('/api/activities', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const activities = await storage.getActivities(limit);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

app.post('/api/linkedin-agent-leads', async (req, res) => {
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

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Setup Vite
if (app.get("env") === "development") {
  setupVite(app, server).then(() => {
    console.log("Vite setup complete");
  }).catch(err => {
    console.error("Vite setup error:", err);
  });
} else {
  serveStatic(app);
}

// Start server on PORT
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize the scheduler to automatically trigger the LinkedIn agent webhook
  initializeScheduler();
  console.log("Webhook scheduler started - LinkedIn agent will be triggered automatically");
});
