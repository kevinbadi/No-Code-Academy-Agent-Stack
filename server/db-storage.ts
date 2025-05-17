import { 
  User, InsertUser, 
  Metric, InsertMetric, 
  Activity, InsertActivity,
  LinkedinAgentLeads, InsertLinkedinAgentLeads,
  users, metrics, activities, linkedinAgentLeads
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { IStorage } from "./storage";

// Database storage implementation specifically for LinkedIn agent leads
export class LinkedinAgentLeadsStorage {
  async getLinkedinAgentLeads(limit?: number): Promise<LinkedinAgentLeads[]> {
    try {
      const result = await db.select()
        .from(linkedinAgentLeads)
        .orderBy(sql`${linkedinAgentLeads.timestamp} DESC`)
        .limit(limit || 100);
      
      return result;
    } catch (error) {
      console.error("Error getting LinkedIn agent leads from database:", error);
      return [];
    }
  }
  
  async getLatestLinkedinAgentLeads(): Promise<LinkedinAgentLeads | undefined> {
    try {
      const [result] = await db.select()
        .from(linkedinAgentLeads)
        .orderBy(sql`${linkedinAgentLeads.timestamp} DESC`)
        .limit(1);
      
      return result;
    } catch (error) {
      console.error("Error getting latest LinkedIn agent leads from database:", error);
      return undefined;
    }
  }
  
  async createLinkedinAgentLeads(data: InsertLinkedinAgentLeads): Promise<LinkedinAgentLeads> {
    try {
      console.log("Inserting LinkedIn agent leads into PostgreSQL database");
      
      // Insert the data into the database using Drizzle
      const [result] = await db.insert(linkedinAgentLeads).values({
        timestamp: data.timestamp || new Date(),
        dailySent: data.dailySent,
        dailyAccepted: data.dailyAccepted,
        totalSent: data.totalSent,
        totalAccepted: data.totalAccepted,
        maxInvitations: data.maxInvitations,
        processedProfiles: data.processedProfiles,
        status: data.status,
        csvLink: data.csvLink,
        jsonLink: data.jsonLink,
        connectionStatus: data.connectionStatus,
        rawLog: data.rawLog,
        processData: data.processData || {}
      }).returning();
      
      console.log("Successfully inserted LinkedIn agent leads data:", result);
      return result;
    } catch (error) {
      console.error("Error inserting LinkedIn agent leads into database:", error);
      throw error;
    }
  }
}

export const dbStorage = new LinkedinAgentLeadsStorage();