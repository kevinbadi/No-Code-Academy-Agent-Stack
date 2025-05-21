import { pgTable, text, serial, integer, timestamp, real, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// LinkedIn Metrics Schema
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  invitesSent: integer("invites_sent").notNull(),
  invitesAccepted: integer("invites_accepted").notNull(),
  acceptanceRatio: real("acceptance_ratio").notNull(),
});

export const insertMetricSchema = createInsertSchema(metrics).omit({
  id: true,
  acceptanceRatio: true,
});

// Schema for webhook payload
export const webhookPayloadSchema = z.object({
  invitesSent: z.number().int().positive(),
  invitesAccepted: z.number().int().min(0)
});

export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Metric = typeof metrics.$inferSelect;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

// Schema for activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  metadata: json("metadata")
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
}).extend({
  metadata: z.record(z.unknown()).optional()
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// LinkedIn Agent Data Schema - stores detailed webhook response data
export const linkedinAgentLeads = pgTable("linkedin_agent_leads", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  
  // Day summary data
  dailySent: integer("daily_sent").notNull(),
  dailyAccepted: integer("daily_accepted").notNull(),
  processedProfiles: integer("processed_profiles"),
  maxInvitations: integer("max_invitations"),
  
  // Total summary data
  totalSent: integer("total_sent").notNull(),
  totalAccepted: integer("total_accepted").notNull(),
  status: text("status"),
  
  // Links to data files
  csvLink: text("csv_link"),
  jsonLink: text("json_link"),
  connectionStatus: text("connection_status"),
  
  // Raw data for reference
  rawLog: text("raw_log"),
  processData: json("process_data")
});

export const insertLinkedinAgentLeadsSchema = createInsertSchema(linkedinAgentLeads).omit({
  id: true
});

export type InsertLinkedinAgentLeads = z.infer<typeof insertLinkedinAgentLeadsSchema>;
export type LinkedinAgentLeads = typeof linkedinAgentLeads.$inferSelect;

// Webhook Schedule Configuration Schema
export const scheduleConfigs = pgTable("schedule_configs", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  cronExpression: text("cron_expression").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  webhookUrl: text("webhook_url").notNull(),
  runCount: integer("run_count").default(0).notNull()
});

export const insertScheduleConfigSchema = createInsertSchema(scheduleConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastRun: true,
  nextRun: true,
  runCount: true
});

export type InsertScheduleConfig = z.infer<typeof insertScheduleConfigSchema>;
export type ScheduleConfig = typeof scheduleConfigs.$inferSelect;

// Instagram Agent Data Schema - stores Instagram warm lead data
export const instagramAgentLeads = pgTable("instagram_agent_leads", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  
  // User identification fields
  username: text("username").notNull(),
  fullName: text("full_name"),
  profileUrl: text("profile_url"),
  profilePictureUrl: text("profile_picture_url"),
  instagramID: text("instagram_id"),
  isVerified: boolean("is_verified").default(false),
  followedByViewer: boolean("followed_by_viewer").default(false),
  requestedByViewer: boolean("requested_by_viewer").default(false),
  photoUrl: text("photo_url"),
  
  // Daily stats
  dailyProfilesScanned: integer("daily_profiles_scanned").notNull().default(0),
  dailyLeadsFound: integer("daily_leads_found").notNull().default(0),
  dailyMessagesInitiated: integer("daily_messages_initiated").notNull().default(0),
  dailyResponsesReceived: integer("daily_responses_received").notNull().default(0),
  
  // Cumulative stats
  totalProfilesScanned: integer("total_profiles_scanned").notNull().default(0),
  totalLeadsFound: integer("total_leads_found").notNull().default(0),
  totalMessagesInitiated: integer("total_messages_initiated").notNull().default(0),
  totalResponsesReceived: integer("total_responses_received").notNull().default(0),
  
  // Status and diagnostics
  status: text("status"),
  targetAudience: text("target_audience"),
  conversionRate: real("conversion_rate"),
  responseRate: real("response_rate"),
  
  // Data links
  dataExportLink: text("data_export_link"),
  connectionStatus: text("connection_status"),
  
  // Raw data
  rawLog: text("raw_log"),
  processData: json("process_data")
});

export const insertInstagramAgentLeadsSchema = createInsertSchema(instagramAgentLeads).omit({
  id: true
});

export type InsertInstagramAgentLeads = z.infer<typeof insertInstagramAgentLeadsSchema>;
export type InstagramAgentLeads = typeof instagramAgentLeads.$inferSelect;
