import { Request, Response } from "express";
import { linkedinAgent2Storage } from "./linkedin-agent-2-storage";
import { insertLinkedinAgent2Schema } from "@shared/schema";
import { ZodError } from "zod";

/**
 * Get all LinkedIn Agent 2 data
 */
export async function getLinkedinAgent2Data(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const data = await linkedinAgent2Storage.getLinkedinAgent2Data(limit);
    res.json(data);
  } catch (error) {
    console.error("Error fetching LinkedIn Agent 2 data:", error);
    res.status(500).json({ error: "Failed to fetch LinkedIn Agent 2 data" });
  }
}

/**
 * Get the latest LinkedIn Agent 2 data entry
 */
export async function getLatestLinkedinAgent2Data(req: Request, res: Response) {
  try {
    const data = await linkedinAgent2Storage.getLatestLinkedinAgent2Data();
    res.json(data);
  } catch (error) {
    console.error("Error fetching latest LinkedIn Agent 2 data:", error);
    res.status(500).json({ error: "Failed to fetch latest LinkedIn Agent 2 data" });
  }
}

/**
 * Create new LinkedIn Agent 2 data entry
 */
export async function createLinkedinAgent2Data(req: Request, res: Response) {
  try {
    const validatedData = insertLinkedinAgent2Schema.parse(req.body);
    const result = await linkedinAgent2Storage.createLinkedinAgent2Data(validatedData);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Invalid data format", details: error.errors });
    } else {
      console.error("Error creating LinkedIn Agent 2 data:", error);
      res.status(500).json({ error: "Failed to create LinkedIn Agent 2 data" });
    }
  }
}

/**
 * Handle webhook for LinkedIn Agent 2
 */
export async function handleLinkedinAgent2Webhook(req: Request, res: Response) {
  try {
    console.log("LinkedIn Agent 2 webhook received:", req.body);
    
    // Map the webhook data to our schema structure
    const webhookData = req.body;
    
    const linkedinAgent2Data = {
      daySent: webhookData.invite_summary?.day?.sent || 0,
      dayAccepted: webhookData.invite_summary?.day?.accepted || 0,
      processedProfiles: webhookData.invite_summary?.day?.processed_profiles || 0,
      maxInvitations: webhookData.invite_summary?.day?.max_invitations || 0,
      totalSent: webhookData.invite_summary?.total?.sent || 0,
      totalAccepted: webhookData.invite_summary?.total?.accepted || 0,
      status: webhookData.status || "Unknown status",
      csvLink: webhookData.links?.csv || null,
      jsonLink: webhookData.links?.json || null,
      connectionStatus: webhookData.connection || "Unknown connection status",
      processData: webhookData.process || {}
    };

    const result = await linkedinAgent2Storage.createLinkedinAgent2Data(linkedinAgent2Data);
    
    res.status(201).json({ 
      success: true, 
      message: "LinkedIn Agent 2 webhook data processed successfully",
      data: result 
    });
  } catch (error) {
    console.error("Error processing LinkedIn Agent 2 webhook:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to process LinkedIn Agent 2 webhook data" 
    });
  }
}

/**
 * Create sample LinkedIn Agent 2 data for testing
 */
export async function createSampleLinkedinAgent2Data(req: Request, res: Response) {
  try {
    const sampleData = {
      daySent: 278,
      dayAccepted: 65,
      processedProfiles: 6,
      maxInvitations: 278,
      totalSent: 278,
      totalAccepted: 65,
      status: "All invitations have been sent.",
      csvLink: "https://phantombuster.s3.amazonaws.com/wbVTFjBiDG4/rIF1I9eW7mkNj2HI2k2FHQ/result.csv",
      jsonLink: "https://phantombuster.s3.amazonaws.com/wbVTFjBiDG4/rIF1I9eW7mkNj2HI2k2FHQ/result.json",
      connectionStatus: "Successfully connected to LinkedIn as Kevin Badi",
      processData: {
        timestamp: new Date().toISOString(),
        executionTime: "45 minutes",
        profilesProcessed: 6,
        invitationsSent: 278
      }
    };

    const result = await linkedinAgent2Storage.createLinkedinAgent2Data(sampleData);
    
    res.status(201).json({
      success: true,
      message: "Sample LinkedIn Agent 2 data created successfully",
      data: result
    });
  } catch (error) {
    console.error("Error creating sample LinkedIn Agent 2 data:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to create sample LinkedIn Agent 2 data" 
    });
  }
}