
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
import { viralVideoStorage } from "./viral-video-storage";

const PORT = process.env.PORT || 5000;

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
    
    // Get total messages sent and last reset date from dedicated stats table
    const statsResult = await pool.query(`
      SELECT stat_value, last_updated, last_reset, daily_messages_sent 
      FROM instagram_stats 
      WHERE stat_name = 'total_messages_sent'
    `);
    
    let totalMessagesSent = 0;
    let dailyMessagesSent = 0;
    
    if (statsResult.rows.length > 0) {
      totalMessagesSent = parseInt(statsResult.rows[0].stat_value);
      const lastResetDate = statsResult.rows[0].last_reset;
      const today = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
      
      if (!lastResetDate || new Date(lastResetDate).toISOString().split('T')[0] !== today) {
        // It's a new day, reset the daily counter
        console.log("Resetting daily message count for a new day");
        await pool.query(`
          UPDATE instagram_stats 
          SET daily_messages_sent = 0,
              last_reset = CURRENT_DATE
          WHERE stat_name = 'total_messages_sent'
        `);
        dailyMessagesSent = 0;
      } else {
        // Same day, use the existing daily count
        dailyMessagesSent = parseInt(statsResult.rows[0].daily_messages_sent || '0');
      }
    } else {
      // If no record exists, create one with daily counter set to 0
      await pool.query(`
        INSERT INTO instagram_stats (stat_name, stat_value, daily_messages_sent, last_reset, last_updated)
        VALUES ('total_messages_sent', 0, 0, CURRENT_DATE, NOW())
      `);
    }
    
    console.log("Total messages sent from stats table:", totalMessagesSent);
    console.log("Daily messages sent:", dailyMessagesSent);
    
    if (result.rows && result.rows.length > 0) {
      res.json({
        warmLeadCount: parseInt(result.rows[0].warm_lead_count) || 0,
        messageSentCount: parseInt(result.rows[0].message_sent_count) || 0,
        saleClosedCount: parseInt(result.rows[0].sale_closed_count) || 0,
        totalCount: parseInt(result.rows[0].total_count) || 0,
        totalMessagesSent: totalMessagesSent,
        dailyMessagesSent: dailyMessagesSent // Add daily messages sent
      });
    } else {
      res.json({
        warmLeadCount: 0,
        messageSentCount: 0,
        saleClosedCount: 0,
        totalCount: 0,
        totalMessagesSent: totalMessagesSent,
        dailyMessagesSent: dailyMessagesSent // Add daily messages sent
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
    
    // Get the current status of the lead to check if it's changing to 'message_sent'
    const currentStatusResult = await pool.query(
      'SELECT status FROM instagram_agent_leads WHERE id = $1',
      [id]
    );
    
    const isChangingToMessageSent = 
      currentStatusResult.rows.length > 0 && 
      currentStatusResult.rows[0].status === 'warm_lead' && 
      status === 'message_sent';
    
    // Update the lead status
    const result = await pool.query(`
      UPDATE instagram_agent_leads
      SET 
        status = $1,
        timestamp = CURRENT_TIMESTAMP,
        rawlog = COALESCE($2, rawlog),
        total_messages_sent = CASE WHEN $1 = 'message_sent' AND status = 'warm_lead' THEN 1 ELSE total_messages_sent END
      WHERE id = $3
      RETURNING *
    `, [status, notes, id]);
    
    // If status changed to message_sent, increment both total and daily message counters
    if (isChangingToMessageSent) {
      await pool.query(`
        UPDATE instagram_stats 
        SET stat_value = stat_value + 1,
            daily_messages_sent = daily_messages_sent + 1,
            last_updated = NOW()
        WHERE stat_name = 'total_messages_sent'
      `);
      console.log("Incremented total and daily messages counters");
    }
    
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

// Perplexity Chat API route
app.post('/api/perplexity-chat', async (req, res) => {
  console.log("=== PERPLEXITY CHAT API CALL START ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  
  const { message } = req.body;
  
  if (!message) {
    console.log("No message provided");
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    console.log("Making Perplexity API call for message:", message);
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "Be precise and concise."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    console.log("Perplexity response status:", response.status);
    console.log("Perplexity response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Perplexity API error:", errorText);
      return res.status(500).json({ error: "API call failed", details: errorText });
    }

    const data = await response.json();
    console.log("Perplexity API success:", JSON.stringify(data, null, 2));

    return res.json({
      content: data.choices?.[0]?.message?.content || "No response generated",
      citations: data.citations || [],
      usage: data.usage || {}
    });

  } catch (error) {
    console.error("=== PERPLEXITY CHAT ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ error: "Internal error", details: error.message });
  }
});

// Viral Video Agent API endpoints
app.get('/api/viral-videos', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const videos = await viralVideoStorage.getViralVideos(limit);
    res.json(videos);
  } catch (error) {
    console.error("Error fetching viral videos:", error);
    res.status(500).json({ error: "Failed to fetch viral videos" });
  }
});

app.get('/api/viral-videos/stats', async (req, res) => {
  try {
    const stats = await viralVideoStorage.getVideoStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching viral video stats:", error);
    res.status(500).json({ error: "Failed to fetch viral video stats" });
  }
});

app.post('/api/viral-videos', async (req, res) => {
  try {
    const video = await viralVideoStorage.createViralVideo(req.body);
    res.status(201).json(video);
  } catch (error) {
    console.error("Error creating viral video:", error);
    res.status(500).json({ error: "Failed to create viral video" });
  }
});

app.put('/api/viral-videos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const video = await viralVideoStorage.updateViralVideo(id, req.body);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    console.error("Error updating viral video:", error);
    res.status(500).json({ error: "Failed to update viral video" });
  }
});

app.delete('/api/viral-videos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await viralVideoStorage.deleteViralVideo(id);
    if (!success) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting viral video:", error);
    res.status(500).json({ error: "Failed to delete viral video" });
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
