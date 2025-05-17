import { 
  User, InsertUser, 
  Metric, InsertMetric, 
  Activity, InsertActivity,
  LinkedinAgentLeads, InsertLinkedinAgentLeads
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Metrics
  getMetrics(limit?: number): Promise<Metric[]>;
  getMetricsByDateRange(startDate: Date, endDate: Date): Promise<Metric[]>;
  getLatestMetric(): Promise<Metric | undefined>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  
  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // LinkedIn Agent Leads
  getLinkedinAgentLeads(limit?: number): Promise<LinkedinAgentLeads[]>;
  getLatestLinkedinAgentLeads(): Promise<LinkedinAgentLeads | undefined>;
  createLinkedinAgentLeads(data: InsertLinkedinAgentLeads): Promise<LinkedinAgentLeads>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private metrics: Map<number, Metric>;
  private activities: Map<number, Activity>;
  private linkedinAgentLeads: Map<number, LinkedinAgentLeads>;
  
  userCurrentId: number;
  metricCurrentId: number;
  activityCurrentId: number;
  linkedinAgentLeadsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.metrics = new Map();
    this.activities = new Map();
    this.linkedinAgentLeads = new Map();
    
    this.userCurrentId = 1;
    this.metricCurrentId = 1;
    this.activityCurrentId = 1;
    this.linkedinAgentLeadsCurrentId = 1;
    
    // Initialize with some sample metrics
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    this.createMetric({
      date: yesterday,
      invitesSent: 45,
      invitesAccepted: 18
    });
    
    this.createMetric({
      date: today,
      invitesSent: 38,
      invitesAccepted: 14
    });
    
    // Add some initial activities
    this.createActivity({
      timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: "invite_sent",
      message: "15 new connection requests sent"
    });
    
    this.createActivity({
      timestamp: new Date(today.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      type: "invite_accepted",
      message: "8 connection requests accepted"
    });
    
    this.createActivity({
      timestamp: new Date(today.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      type: "refresh",
      message: "Daily KPI data refreshed"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getMetrics(limit?: number): Promise<Metric[]> {
    const metrics = Array.from(this.metrics.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? metrics.slice(0, limit) : metrics;
  }
  
  async getMetricsByDateRange(startDate: Date, endDate: Date): Promise<Metric[]> {
    return Array.from(this.metrics.values())
      .filter(metric => {
        const metricDate = new Date(metric.date);
        return metricDate >= startDate && metricDate <= endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getLatestMetric(): Promise<Metric | undefined> {
    const metrics = await this.getMetrics(1);
    return metrics.length > 0 ? metrics[0] : undefined;
  }
  
  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const id = this.metricCurrentId++;
    // Calculate acceptance ratio
    const acceptanceRatio = insertMetric.invitesAccepted / insertMetric.invitesSent * 100;
    
    // Ensure date is set
    const date = insertMetric.date || new Date();
    
    const metric: Metric = { 
      ...insertMetric, 
      id,
      date,
      acceptanceRatio
    };
    
    this.metrics.set(id, metric);
    return metric;
  }
  
  async getActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    // Ensure timestamp is set
    const timestamp = insertActivity.timestamp || new Date();
    
    const activity: Activity = { 
      ...insertActivity, 
      id,
      timestamp 
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  // LinkedIn Agent Leads methods
  async getLinkedinAgentLeads(limit?: number): Promise<LinkedinAgentLeads[]> {
    const leads = Array.from(this.linkedinAgentLeads.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? leads.slice(0, limit) : leads;
  }
  
  async getLatestLinkedinAgentLeads(): Promise<LinkedinAgentLeads | undefined> {
    const leads = await this.getLinkedinAgentLeads(1);
    return leads.length > 0 ? leads[0] : undefined;
  }
  
  async createLinkedinAgentLeads(data: InsertLinkedinAgentLeads): Promise<LinkedinAgentLeads> {
    const id = this.linkedinAgentLeadsCurrentId++;
    // Ensure timestamp is set
    const timestamp = data.timestamp || new Date();
    
    const leads: LinkedinAgentLeads = {
      id,
      timestamp,
      dailySent: data.dailySent,
      dailyAccepted: data.dailyAccepted,
      totalSent: data.totalSent,
      totalAccepted: data.totalAccepted,
      maxInvitations: data.maxInvitations || null,
      processedProfiles: data.processedProfiles || null,
      status: data.status || null,
      csvLink: data.csvLink || null,
      jsonLink: data.jsonLink || null,
      connectionStatus: data.connectionStatus || null,
      rawLog: data.rawLog || null,
      processData: data.processData || {}
    };
    
    this.linkedinAgentLeads.set(id, leads);
    return leads;
  }
}

// We'll keep using MemStorage but modify it to work with Drizzle and PostgreSQL
// NOTE: For LinkedIn agent leads we'll specifically use the database

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private metrics: Map<number, Metric>;
  private activities: Map<number, Activity>;
  private linkedinAgentLeads: Map<number, LinkedinAgentLeads>;
  
  userCurrentId: number;
  metricCurrentId: number;
  activityCurrentId: number;
  linkedinAgentLeadsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.metrics = new Map();
    this.activities = new Map();
    this.linkedinAgentLeads = new Map();
    
    this.userCurrentId = 1;
    this.metricCurrentId = 1;
    this.activityCurrentId = 1;
    this.linkedinAgentLeadsCurrentId = 1;
    
    // Initialize with some sample metrics
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    this.createMetric({
      date: yesterday,
      invitesSent: 45,
      invitesAccepted: 18
    });
    
    this.createMetric({
      date: today,
      invitesSent: 38,
      invitesAccepted: 14
    });
    
    // Add some initial activities
    this.createActivity({
      timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: "invite_sent",
      message: "15 new connection requests sent"
    });
    
    this.createActivity({
      timestamp: new Date(today.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      type: "invite_accepted",
      message: "8 connection requests accepted"
    });
    
    this.createActivity({
      timestamp: new Date(today.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      type: "refresh",
      message: "Daily KPI data refreshed"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getMetrics(limit?: number): Promise<Metric[]> {
    const metrics = Array.from(this.metrics.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? metrics.slice(0, limit) : metrics;
  }
  
  async getMetricsByDateRange(startDate: Date, endDate: Date): Promise<Metric[]> {
    return Array.from(this.metrics.values())
      .filter(metric => {
        const metricDate = new Date(metric.date);
        return metricDate >= startDate && metricDate <= endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getLatestMetric(): Promise<Metric | undefined> {
    const metrics = await this.getMetrics(1);
    return metrics.length > 0 ? metrics[0] : undefined;
  }
  
  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const id = this.metricCurrentId++;
    // Calculate acceptance ratio
    const acceptanceRatio = insertMetric.invitesAccepted / insertMetric.invitesSent * 100;
    
    // Ensure date is set
    const date = insertMetric.date || new Date();
    
    const metric: Metric = { 
      ...insertMetric, 
      id,
      date,
      acceptanceRatio
    };
    
    this.metrics.set(id, metric);
    return metric;
  }
  
  async getActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    // Ensure timestamp is set
    const timestamp = insertActivity.timestamp || new Date();
    
    const activity: Activity = { 
      ...insertActivity, 
      id,
      timestamp 
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  // LinkedIn Agent Leads methods now use the database instead of in-memory storage
  async getLinkedinAgentLeads(limit?: number): Promise<LinkedinAgentLeads[]> {
    try {
      // Use Drizzle to query the database
      const result = await db.select().from(linkedinAgentLeads)
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
      const [result] = await db.select().from(linkedinAgentLeads)
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
      console.log("Inserting LinkedIn agent leads into PostgreSQL database:", data);
      
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
        processData: data.processData
      }).returning();
      
      console.log("Successfully inserted LinkedIn agent leads data:", result);
      return result;
    } catch (error) {
      console.error("Error inserting LinkedIn agent leads into database:", error);
      
      // Fallback to in-memory storage if database insert fails
      const id = this.linkedinAgentLeadsCurrentId++;
      const leads: LinkedinAgentLeads = {
        id,
        timestamp: data.timestamp || new Date(),
        dailySent: data.dailySent,
        dailyAccepted: data.dailyAccepted,
        totalSent: data.totalSent,
        totalAccepted: data.totalAccepted,
        maxInvitations: data.maxInvitations || null,
        processedProfiles: data.processedProfiles || null,
        status: data.status || null,
        csvLink: data.csvLink || null,
        jsonLink: data.jsonLink || null,
        connectionStatus: data.connectionStatus || null,
        rawLog: data.rawLog || null,
        processData: data.processData || {}
      };
      
      this.linkedinAgentLeads.set(id, leads);
      return leads;
    }
  }
}

export const storage = new MemStorage();
