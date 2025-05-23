
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
import { pool } from "./db"; // Import the database pool for Instagram leads

const PORT = 8888; // Try a completely different port

// Create HTTP server
const server = http.createServer(app);

// API Routes
// Instagram Leads Pipeline API endpoints
app.get('/api/instagram-leads', async (req, res) => {
  try {
    const status = req.query.status as 'warm_lead' | 'message_sent' | 'sale_closed' | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    // Query for Instagram leads with optional status filter
    let query = `
      SELECT * FROM instagram_agent_leads 
      ${status ? `WHERE status = '${status}'` : ''} 
      ORDER BY timestamp DESC
      ${limit ? `LIMIT ${limit}` : ''}
    `;
    
    const results = await pool.query(query);
    
    // Map database fields to frontend expected format
    const leads = results.rows.map(row => ({
      id: row.id,
      username: row.username,
      fullName: row.fullname,
      profileUrl: row.profileurl,
      profilePictureUrl: row.profilepictureurl,
      instagramID: row.instagramid,
      isVerified: row.isverified,
      bio: row.rawlog,
      status: row.status,
      dateAdded: row.timestamp,
      lastUpdated: row.timestamp,
      notes: row.rawlog,
      tags: []
    }));
    
    res.json(leads);
  } catch (error) {
    console.error("Error fetching Instagram leads:", error);
    res.status(500).json({ error: "Failed to fetch Instagram leads" });
  }
});

app.get('/api/instagram-leads/next-warm', async (req, res) => {
  try {
    // Get the next warm lead for processing
    const result = await pool.query(`
      SELECT * FROM instagram_agent_leads 
      WHERE status = 'warm_lead' 
      ORDER BY timestamp ASC
      LIMIT 1
    `);
    
    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      const lead = {
        id: row.id,
        username: row.username,
        fullName: row.fullname,
        profileUrl: row.profileurl,
        profilePictureUrl: row.profilepictureurl,
        instagramID: row.instagramid,
        isVerified: row.isverified,
        bio: row.rawlog,
        status: row.status,
        dateAdded: row.timestamp,
        lastUpdated: row.timestamp,
        notes: row.rawlog,
        tags: []
      };
      
      res.json(lead);
    } else {
      res.status(404).json({ message: "No warm leads available" });
    }
  } catch (error) {
    console.error("Error fetching next warm lead:", error);
    res.status(500).json({ error: "Failed to fetch next warm lead" });
  }
});

app.get('/api/instagram-leads/counts', async (req, res) => {
  try {
    // Get count of leads for each status
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'warm_lead') AS warm_lead_count,
        COUNT(*) FILTER (WHERE status = 'message_sent') AS message_sent_count,
        COUNT(*) FILTER (WHERE status = 'sale_closed') AS sale_closed_count,
        COUNT(*) AS total_count
      FROM instagram_agent_leads
    `);
    
    if (result.rows && result.rows.length > 0) {
      res.json({
        warmLeadCount: parseInt(result.rows[0].warm_lead_count) || 0,
        messageSentCount: parseInt(result.rows[0].message_sent_count) || 0,
        saleClosedCount: parseInt(result.rows[0].sale_closed_count) || 0,
        totalCount: parseInt(result.rows[0].total_count) || 0
      });
    } else {
      res.json({
        warmLeadCount: 0,
        messageSentCount: 0,
        saleClosedCount: 0,
        totalCount: 0
      });
    }
  } catch (error) {
    console.error("Error fetching lead counts:", error);
    res.status(500).json({ error: "Failed to fetch lead counts" });
  }
});

app.put('/api/instagram-leads/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    if (!['warm_lead', 'message_sent', 'sale_closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // Update the lead status
    const result = await pool.query(`
      UPDATE instagram_agent_leads
      SET 
        status = $1,
        timestamp = CURRENT_TIMESTAMP,
        rawlog = COALESCE($2, rawlog)
      WHERE id = $3
      RETURNING *
    `, [status, notes, id]);
    
    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      res.json({
        id: row.id,
        username: row.username,
        fullName: row.fullname,
        profileUrl: row.profileurl,
        profilePictureUrl: row.profilepictureurl,
        instagramID: row.instagramid,
        isVerified: row.isverified,
        bio: row.rawlog,
        status: row.status,
        dateAdded: row.timestamp,
        lastUpdated: row.timestamp,
        notes: row.rawlog,
        tags: []
      });
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    console.error("Error updating lead status:", error);
    res.status(500).json({ error: "Failed to update lead status" });
  }
});

app.post('/api/instagram-leads/sample', async (req, res) => {
  try {
    // Import the setup function and run it
    const { setupInstagramLeadsTable } = await import('./db-setup');
    await setupInstagramLeadsTable();
    
    res.json({ message: "Sample Instagram leads created successfully" });
  } catch (error) {
    console.error("Error creating sample Instagram leads:", error);
    res.status(500).json({ error: "Failed to create sample Instagram leads" });
  }
});

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
  
  // We'll run the Instagram leads setup as a separate process
});
