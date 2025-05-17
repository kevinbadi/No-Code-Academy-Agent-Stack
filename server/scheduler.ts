import cron from 'node-cron';
import fetch from 'node-fetch';
import { storage } from './storage';

const activeJobs = new Map<number, cron.ScheduledTask>();

/**
 * Sends request to configured webhook URL
 */
async function executeWebhook(scheduleId: number, webhookUrl: string) {
  console.log(`Executing webhook for schedule #${scheduleId} - ${webhookUrl}`);
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Update the last run time
    await storage.updateScheduleLastRun(scheduleId, new Date());
    
    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}: ${response.statusText}`);
    }
    
    // Create an activity log for successful execution
    await storage.createActivity({
      type: 'webhook_success',
      message: `Webhook executed successfully (schedule #${scheduleId})`,
      metadata: { scheduleId }
    });
    
    console.log(`Webhook execution successful for schedule #${scheduleId}`);
    return true;
  } catch (error) {
    console.error(`Error executing webhook for schedule #${scheduleId}:`, error);
    
    // Create an activity log for failed execution
    await storage.createActivity({
      type: 'webhook_error',
      message: `Webhook execution failed (schedule #${scheduleId}): ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: { scheduleId }
    });
    
    return false;
  }
}

/**
 * Schedule a cron job for webhook execution
 */
function scheduleJob(config: { id: number, cronExpression: string, webhookUrl: string }) {
  // Validate cron expression
  if (!cron.validate(config.cronExpression)) {
    console.error(`Invalid cron expression for schedule #${config.id}: ${config.cronExpression}`);
    return false;
  }
  
  try {
    // Stop any existing job for this schedule
    if (activeJobs.has(config.id)) {
      activeJobs.get(config.id)?.stop();
      activeJobs.delete(config.id);
    }
    
    // Schedule new job
    const job = cron.schedule(config.cronExpression, () => {
      executeWebhook(config.id, config.webhookUrl);
    });
    
    // Store the job reference
    activeJobs.set(config.id, job);
    
    console.log(`Scheduled job for ID #${config.id} with cron: ${config.cronExpression}`);
    return true;
  } catch (error) {
    console.error(`Error scheduling job for #${config.id}:`, error);
    return false;
  }
}

/**
 * Stops a scheduled job if it exists
 */
function stopJob(scheduleId: number) {
  if (activeJobs.has(scheduleId)) {
    activeJobs.get(scheduleId)?.stop();
    activeJobs.delete(scheduleId);
    console.log(`Stopped scheduled job for ID #${scheduleId}`);
    return true;
  }
  return false;
}

/**
 * Initialize all active schedules
 */
export async function initializeScheduler() {
  console.log("Initializing webhook scheduler...");
  
  try {
    // Get all active schedules
    const schedules = await storage.getScheduleConfigs();
    const activeSchedules = schedules.filter(s => s.isActive);
    
    console.log(`Found ${activeSchedules.length} active schedules to initialize`);
    
    // Schedule each active job
    for (const schedule of activeSchedules) {
      scheduleJob({
        id: schedule.id,
        cronExpression: schedule.cronExpression,
        webhookUrl: schedule.webhookUrl
      });
    }
    
    // Create an activity log for scheduler initialization
    await storage.createActivity({
      type: 'system',
      message: `Webhook scheduler initialized with ${activeSchedules.length} active schedules`,
      metadata: { 
        activeScheduleIds: activeSchedules.map(s => s.id)
      }
    });
    
    console.log("Webhook scheduler initialization complete");
    return true;
  } catch (error) {
    console.error("Error initializing scheduler:", error);
    return false;
  }
}

/**
 * Refreshes all schedules (stops and restarts active ones)
 */
export async function refreshSchedules() {
  console.log("Refreshing webhook schedules...");
  
  // Stop all current jobs
  for (const scheduleId of activeJobs.keys()) {
    stopJob(scheduleId);
  }
  
  // Initialize again
  return await initializeScheduler();
}

// Export these functions for use in API routes
export const scheduler = {
  scheduleJob,
  stopJob,
  executeWebhook,
  refreshSchedules
};