import { User, InsertUser, Metric, InsertMetric, Activity, InsertActivity } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private metrics: Map<number, Metric>;
  private activities: Map<number, Activity>;
  
  userCurrentId: number;
  metricCurrentId: number;
  activityCurrentId: number;

  constructor() {
    this.users = new Map();
    this.metrics = new Map();
    this.activities = new Map();
    
    this.userCurrentId = 1;
    this.metricCurrentId = 1;
    this.activityCurrentId = 1;
    
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
    
    const metric: Metric = { 
      ...insertMetric, 
      id,
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
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
