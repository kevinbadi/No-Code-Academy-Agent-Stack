
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";

// Create a new Express application
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create HTTP server explicitly
const httpServer = createServer(app);

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

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// IIFE to start the server
(async () => {
  try {
    // Register routes passing the HTTP server for websockets
    await registerRoutes(app, httpServer);
    
    // Setup Vite or static files
    if (app.get("env") === "development") {
      await setupVite(app, httpServer);
    } else {
      serveStatic(app);
    }

    // Try port 4444 instead of 5000/3333
    const port = 4444;
    
    // Start the HTTP server
    httpServer.listen(port, "0.0.0.0", () => {
      log(`Server running on port ${port}`);
    });
    
  } catch (error) {
    console.error("Server initialization error:", error);
    process.exit(1);
  }
})();
