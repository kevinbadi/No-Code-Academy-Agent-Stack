import { pgTable, serial, varchar, timestamp, integer, text, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Create an enum for lead status
export const leadStatusEnum = pgEnum('lead_status', ['warm_lead', 'message_sent', 'sale_closed']);

// Instagram Leads table
export const instagramLeads = pgTable("instagram_leads", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  profileUrl: varchar("profile_url", { length: 255 }),
  profilePictureUrl: varchar("profile_picture_url", { length: 255 }),
  instagramID: varchar("instagram_id", { length: 255 }),
  isVerified: boolean("is_verified").default(false),
  bio: text("bio"),
  followers: integer("followers"),
  following: integer("following"),
  status: leadStatusEnum("status").default('warm_lead').notNull(),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  notes: text("notes"),
  tags: text("tags"), // Stored as comma-separated values
});

// Define the insert schema for validation
export const insertInstagramLeadSchema = createInsertSchema(instagramLeads).omit({
  id: true,
  dateAdded: true,
  lastUpdated: true
});

// Export types
export type InstagramLead = typeof instagramLeads.$inferSelect;
export type InsertInstagramLead = z.infer<typeof insertInstagramLeadSchema>;