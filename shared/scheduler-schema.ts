import { pgTable, serial, timestamp, text, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define schedule configuration table
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
  // How many times this schedule has run
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

// Common cron expressions for the UI to use
export const COMMON_CRON_EXPRESSIONS = [
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every 12 hours", value: "0 */12 * * *" },
  { label: "Daily at 9 AM", value: "0 9 * * *" },
  { label: "Daily at 12 PM", value: "0 12 * * *" },
  { label: "Daily at 5 PM", value: "0 17 * * *" },
  { label: "Weekly on Monday at 9 AM", value: "0 9 * * 1" },
  { label: "Monthly on the 1st at 12 AM", value: "0 0 1 * *" }
];