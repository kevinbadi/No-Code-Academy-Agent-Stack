import { pgTable, text, serial, integer, timestamp, real, json, boolean, jsonb } from "drizzle-orm/pg-core";
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

// Newsletter Analytics Agent Schema - stores newsletter campaign data and metrics
export const newsletterAnalytics = pgTable("newsletter_analytics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  
  // Campaign details
  campaignId: text("campaign_id"),
  campaignName: text("campaign_name").notNull(),
  campaignDate: timestamp("campaign_date").notNull(),
  campaignType: text("campaign_type").default("regular"),
  subject: text("subject").notNull(),
  previewText: text("preview_text"),
  listId: text("list_id"),
  listIsActive: boolean("list_is_active").default(true),
  listName: text("list_name"),
  
  // Email metrics
  totalRecipients: integer("total_recipients").notNull(),
  emailsSent: integer("emails_sent").notNull(),
  emailsCanceled: integer("emails_canceled").default(0),
  
  // Delivery status
  deliveryStatus: text("delivery_status").default("delivered"),
  canCancel: boolean("can_cancel").default(false),
  deliveryEnabled: boolean("delivery_enabled").default(true),
  
  // Bounce metrics
  hardBounces: integer("hard_bounces").default(0),
  softBounces: integer("soft_bounces").default(0),
  syntaxErrors: integer("syntax_errors").default(0),
  totalBounces: integer("total_bounces").default(0),
  
  // Open metrics
  opensTotal: integer("opens_total").default(0),
  uniqueOpens: integer("unique_opens").default(0),
  proxyExcludedOpens: integer("proxy_excluded_opens").default(0),
  proxyExcludedUniqueOpens: integer("proxy_excluded_unique_opens").default(0),
  lastOpenTime: timestamp("last_open_time"),
  
  // Click metrics
  clicksTotal: integer("clicks_total").default(0),
  uniqueClicks: integer("unique_clicks").default(0),
  uniqueSubscriberClicks: integer("unique_subscriber_clicks").default(0),
  lastClickTime: timestamp("last_click_time"),
  
  // Forward metrics
  forwardsCount: integer("forwards_count").default(0),
  forwardsOpens: integer("forwards_opens").default(0),
  
  // Engagement metrics
  abuseReports: integer("abuse_reports").default(0),
  unsubscribes: integer("unsubscribes").default(0),
  
  // Calculated rates
  openRate: real("open_rate").notNull(),
  proxyExcludedOpenRate: real("proxy_excluded_open_rate"),
  clickRate: real("click_rate").notNull(),
  clickToOpenRate: real("click_to_open_rate").notNull(),
  bounceRate: real("bounce_rate").notNull().default(0),
  unsubscribeRate: real("unsubscribe_rate").notNull().default(0),
  
  // Timing info
  sendTime: timestamp("send_time").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  
  // Additional info
  facebookLikes: json("facebook_likes"),
  ecommerceData: json("ecommerce_data"),
  timeseriesData: json("timeseries_data"),
  
  // Raw data for reference
  rawData: json("raw_data")
});

export const insertNewsletterAnalyticsSchema = createInsertSchema(newsletterAnalytics).omit({
  id: true,
  openRate: true,
  clickRate: true,
  clickToOpenRate: true,
  bounceRate: true,
  unsubscribeRate: true
}).extend({
  deviceBreakdown: z.record(z.unknown()).optional(),
  locationData: z.record(z.unknown()).optional(),
  rawData: z.record(z.unknown()).optional()
});

export type InsertNewsletterAnalytics = z.infer<typeof insertNewsletterAnalyticsSchema>;
export type NewsletterAnalytics = typeof newsletterAnalytics.$inferSelect;

// Instagram Posts Schema - stores URLs of posts uploaded since last warm leads were added
export const instagramPosts = pgTable("instagram_posts", {
  id: serial("id").primaryKey(),
  postUrl: text("post_url").notNull(),
  postDescription: text("post_description"),
  postDate: timestamp("post_date").notNull().defaultNow(),
  addedToWarmLeads: boolean("added_to_warm_leads").notNull().default(false),
  addedToWarmLeadsDate: timestamp("added_to_warm_leads_date"),
  engagementStats: jsonb("engagement_stats")
});

export const insertInstagramPostSchema = createInsertSchema(instagramPosts).omit({
  id: true,
  addedToWarmLeadsDate: true
}).extend({
  engagementStats: z.record(z.unknown()).optional()
});

export type InsertInstagramPost = z.infer<typeof insertInstagramPostSchema>;
export type InstagramPost = typeof instagramPosts.$inferSelect;

// LinkedIn Agent 2 Schema - stores enhanced LinkedIn data structure
export const linkedinAgent2 = pgTable("linkedin_agent_2", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  
  // Invite summary (day collection)
  daySent: integer("day_sent").notNull(),
  dayAccepted: integer("day_accepted").notNull(),
  processedProfiles: integer("processed_profiles").notNull(),
  maxInvitations: integer("max_invitations").notNull(),
  
  // Total collection
  totalSent: integer("total_sent").notNull(),
  totalAccepted: integer("total_accepted").notNull(),
  
  // Status
  status: text("status").notNull(),
  
  // Links collection
  csvLink: text("csv_link"),
  jsonLink: text("json_link"),
  
  // Connection status
  connectionStatus: text("connection_status"),
  
  // Process collection data
  processData: json("process_data")
});

export const insertLinkedinAgent2Schema = createInsertSchema(linkedinAgent2).omit({
  id: true
});

export type InsertLinkedinAgent2 = z.infer<typeof insertLinkedinAgent2Schema>;
export type LinkedinAgent2 = typeof linkedinAgent2.$inferSelect;

// Viral Video Generator Agent Schema - stores generated video URLs
export const viralVideoAgent = pgTable("viral_video_agent", {
  id: serial("id").primaryKey(),
  videoUrl: text("video_url").notNull(),
  title: text("title"),
  description: text("description"),
  status: text("status").notNull().default("generated"), // generated, uploaded, published
  platform: text("platform"), // youtube, tiktok, instagram, etc.
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  shares: integer("shares").default(0),
  metadata: json("metadata")
});

export const insertViralVideoAgentSchema = createInsertSchema(viralVideoAgent).omit({
  id: true
}).extend({
  metadata: z.record(z.unknown()).optional()
});

export type InsertViralVideoAgent = z.infer<typeof insertViralVideoAgentSchema>;
export type ViralVideoAgent = typeof viralVideoAgent.$inferSelect;
