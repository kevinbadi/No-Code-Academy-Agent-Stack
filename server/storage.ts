import { 
  User, InsertUser, 
  Metric, InsertMetric, 
  Activity, InsertActivity,
  LinkedinAgentLeads, InsertLinkedinAgentLeads,
  ScheduleConfig, InsertScheduleConfig
} from "@shared/schema";

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
  
  // Schedule Configurations
  getScheduleConfigs(): Promise<ScheduleConfig[]>;
  getScheduleConfig(id: number): Promise<ScheduleConfig | undefined>;
  createScheduleConfig(config: InsertScheduleConfig): Promise<ScheduleConfig>;
  updateScheduleConfig(id: number, config: Partial<InsertScheduleConfig>): Promise<ScheduleConfig | undefined>;
  deleteScheduleConfig(id: number): Promise<boolean>;
  updateScheduleLastRun(id: number, lastRun: Date): Promise<ScheduleConfig | undefined>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private metrics: Map<number, Metric> = new Map();
  private activities: Map<number, Activity> = new Map();
  private linkedinAgentLeads: Map<number, LinkedinAgentLeads> = new Map();
  private scheduleConfigs: Map<number, ScheduleConfig> = new Map();
  
  private userCurrentId = 1;
  private metricCurrentId = 1;
  private activityCurrentId = 1;
  private linkedinAgentLeadsCurrentId = 1;
  private scheduleConfigCurrentId = 1;

  constructor() {
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
    const metricsList = Array.from(this.metrics.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? metricsList.slice(0, limit) : metricsList;
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
    const activitiesList = Array.from(this.activities.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? activitiesList.slice(0, limit) : activitiesList;
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
  
  // Schedule Configuration Methods
  async getScheduleConfigs(): Promise<ScheduleConfig[]> {
    return Array.from(this.scheduleConfigs.values())
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }
  
  async getScheduleConfig(id: number): Promise<ScheduleConfig | undefined> {
    return this.scheduleConfigs.get(id);
  }
  
  async createScheduleConfig(config: InsertScheduleConfig): Promise<ScheduleConfig> {
    const id = this.scheduleConfigCurrentId++;
    const now = new Date();
    
    const scheduleConfig: ScheduleConfig = {
      ...config,
      id,
      createdAt: now,
      updatedAt: now,
      lastRun: null,
      nextRun: null,
      runCount: 0
    };
    
    this.scheduleConfigs.set(id, scheduleConfig);
    
    // Add an activity for the new schedule
    this.createActivity({
      type: "schedule_created",
      message: `New schedule created: ${config.name}`,
      metadata: { scheduleId: id }
    });
    
    return scheduleConfig;
  }
  
  async updateScheduleConfig(id: number, config: Partial<InsertScheduleConfig>): Promise<ScheduleConfig | undefined> {
    const existingConfig = this.scheduleConfigs.get(id);
    if (!existingConfig) return undefined;
    
    const updatedConfig: ScheduleConfig = {
      ...existingConfig,
      ...config,
      updatedAt: new Date()
    };
    
    this.scheduleConfigs.set(id, updatedConfig);
    
    // Add an activity for the updated schedule
    this.createActivity({
      type: "schedule_updated",
      message: `Schedule updated: ${updatedConfig.name}`,
      metadata: { scheduleId: id }
    });
    
    return updatedConfig;
  }
  
  async deleteScheduleConfig(id: number): Promise<boolean> {
    const config = this.scheduleConfigs.get(id);
    if (!config) return false;
    
    const success = this.scheduleConfigs.delete(id);
    
    if (success) {
      // Add an activity for the deleted schedule
      this.createActivity({
        type: "schedule_deleted",
        message: `Schedule deleted: ${config.name}`,
        metadata: { scheduleId: id }
      });
    }
    
    return success;
  }
  
  async updateScheduleLastRun(id: number, lastRun: Date): Promise<ScheduleConfig | undefined> {
    const config = this.scheduleConfigs.get(id);
    if (!config) return undefined;
    
    const updatedConfig: ScheduleConfig = {
      ...config,
      lastRun,
      updatedAt: new Date(),
      runCount: config.runCount + 1
    };
    
    this.scheduleConfigs.set(id, updatedConfig);
    
    // Add an activity for the schedule run
    this.createActivity({
      type: "schedule_run",
      message: `Schedule executed: ${config.name}`,
      metadata: { scheduleId: id, runCount: updatedConfig.runCount }
    });
    
    return updatedConfig;
  }
}

// Use memory storage as the default implementation
export const storage = new MemStorage();