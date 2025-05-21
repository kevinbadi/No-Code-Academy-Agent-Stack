import { Request, Response } from "express";
import { InstagramAgentLeads, insertInstagramAgentLeadsSchema } from "@shared/schema";
import { db } from "./db";
import { desc } from "drizzle-orm";
import { instagramAgentLeads } from "@shared/schema";

// Get all Instagram agent leads, with optional limit
export async function getInstagramAgentLeads(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const query = db.select().from(instagramAgentLeads).orderBy(desc(instagramAgentLeads.timestamp));
    
    if (limit) {
      query.limit(limit);
    }
    
    const results = await query;
    
    res.json(results);
  } catch (error) {
    console.error("Error fetching Instagram agent leads:", error);
    res.status(500).json({ error: "Failed to fetch Instagram agent leads" });
  }
}

// Get the latest Instagram agent lead
export async function getLatestInstagramAgentLead(req: Request, res: Response) {
  try {
    const [result] = await db
      .select()
      .from(instagramAgentLeads)
      .orderBy(desc(instagramAgentLeads.timestamp))
      .limit(1);
    
    res.json(result || null);
  } catch (error) {
    console.error("Error fetching latest Instagram agent lead:", error);
    res.status(500).json({ error: "Failed to fetch latest Instagram agent lead" });
  }
}

// Create a new Instagram agent lead
export async function createInstagramAgentLead(req: Request, res: Response) {
  try {
    const data = req.body;
    
    // Validate the data using Zod schema
    const validatedData = insertInstagramAgentLeadsSchema.parse(data);
    
    // Insert the data into the database
    const [result] = await db
      .insert(instagramAgentLeads)
      .values(validatedData)
      .returning();
    
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating Instagram agent lead:", error);
    res.status(500).json({ error: "Failed to create Instagram agent lead" });
  }
}

// Handle webhook from Instagram API
export async function handleInstagramWebhook(req: Request, res: Response) {
  try {
    const data = req.body;
    
    // Process and transform the webhook data
    const transformedData = {
      dailyProfilesScanned: data.dailyProfilesScanned || 0,
      dailyLeadsFound: data.dailyLeadsFound || 0,
      dailyMessagesInitiated: data.dailyMessagesInitiated || 0,
      dailyResponsesReceived: data.dailyResponsesReceived || 0,
      
      totalProfilesScanned: data.totalProfilesScanned || 0,
      totalLeadsFound: data.totalLeadsFound || 0,
      totalMessagesInitiated: data.totalMessagesInitiated || 0,
      totalResponsesReceived: data.totalResponsesReceived || 0,
      
      status: data.status || "Webhook received",
      targetAudience: data.targetAudience || "Not specified",
      conversionRate: data.conversionRate || 0,
      responseRate: data.responseRate || 0,
      
      dataExportLink: data.dataExportLink || "",
      connectionStatus: data.connectionStatus || "Connected via webhook",
      
      rawLog: data.rawLog || "",
      processData: data.processData || {}
    };
    
    // Insert the data into the database
    const [result] = await db
      .insert(instagramAgentLeads)
      .values(transformedData)
      .returning();
    
    // Log activity
    console.log("Instagram webhook data received and stored:", result.id);
    
    res.status(201).json({ success: true, id: result.id });
  } catch (error) {
    console.error("Error processing Instagram webhook:", error);
    res.status(500).json({ error: "Failed to process Instagram webhook" });
  }
}