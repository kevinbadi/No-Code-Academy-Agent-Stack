import { pgTable, text, serial, integer, timestamp, real, json } from "drizzle-orm/pg-core";
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
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// LinkedIn Agent Data Schema - stores detailed webhook response data
export const linkedinAgentLeads = pgTable("linkedin_agent_leads", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  invitesSent: integer("invites_sent").notNull(),
  invitesAccepted: integer("invites_accepted").notNull(),
  dailyLimit: integer("daily_limit"),
  profilesProcessed: integer("profiles_processed"),
  rawLog: text("raw_log"),
  additionalData: json("additional_data")
});

export const insertLinkedinAgentLeadsSchema = createInsertSchema(linkedinAgentLeads).omit({
  id: true
});

export type InsertLinkedinAgentLeads = z.infer<typeof insertLinkedinAgentLeadsSchema>;
export type LinkedinAgentLeads = typeof linkedinAgentLeads.$inferSelect;
