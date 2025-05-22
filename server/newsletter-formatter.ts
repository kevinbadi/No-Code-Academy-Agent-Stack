/**
 * Format helper for newsletter webhook data
 * This file processes the exact format provided by the user.
 */

interface NewsletterWebhookData {
  [key: string]: string;
}

interface FormattedNewsletterData {
  campaignId: string;
  campaignName: string;
  campaignDate: Date;
  campaignType: string;
  subject: string;
  previewText: string;
  listId: string;
  listIsActive: boolean;
  listName: string;
  
  // Email metrics
  totalRecipients: number;
  emailsSent: number;
  emailsCanceled: number;
  
  // Delivery status
  deliveryStatus: string;
  canCancel: boolean;
  deliveryEnabled: boolean;
  
  // Bounce metrics
  hardBounces: number;
  softBounces: number;
  syntaxErrors: number;
  totalBounces: number;
  
  // Open metrics
  opensTotal: number;
  uniqueOpens: number;
  proxyExcludedOpens: number;
  proxyExcludedUniqueOpens: number;
  lastOpenTime: Date | null;
  
  // Click metrics
  clicksTotal: number;
  uniqueClicks: number;
  uniqueSubscriberClicks: number;
  lastClickTime: Date | null;
  
  // Forward metrics
  forwardsCount: number;
  forwardsOpens: number;
  
  // Engagement metrics
  abuseReports: number;
  unsubscribes: number;
  
  // Calculated rates
  openRate: number;
  proxyExcludedOpenRate: number;
  clickRate: number;
  clickToOpenRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  
  // Timing info
  sendTime: Date;
  dayOfWeek: string;
  
  // Raw data
  rawData: NewsletterWebhookData;
}

/**
 * Format the webhook data from the exact format provided
 */
export function formatNewsletterWebhookData(webhookData: NewsletterWebhookData): FormattedNewsletterData {
  // Parse send time
  const sendTimeStr = webhookData['Send Time'] || '';
  const sendTime = sendTimeStr ? new Date(sendTimeStr) : new Date();
  const dayOfWeek = sendTime.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Parse last open and click times
  const lastOpenStr = webhookData['Last Open'] || '';
  const lastOpenTime = lastOpenStr ? new Date(lastOpenStr) : null;
  
  const lastClickStr = webhookData['Last Click'] || '';
  const lastClickTime = lastClickStr ? new Date(lastClickStr) : null;
  
  // Parse numeric values
  const emailsSent = parseInt(webhookData['Emails Sent'] || '0');
  const hardBounces = parseInt(webhookData['Hard Bounces'] || '0');
  const softBounces = parseInt(webhookData['Soft Bounces'] || '0');
  const syntaxErrors = parseInt(webhookData['Syntax Errors'] || '0');
  const totalBounces = hardBounces + softBounces + syntaxErrors;
  
  const opensTotal = parseInt(webhookData['Opens Total'] || '0');
  const uniqueOpens = parseInt(webhookData['Unique Opens'] || '0');
  const proxyExcludedOpens = parseInt(webhookData['proxy_excluded_opens'] || '0');
  const proxyExcludedUniqueOpens = parseInt(webhookData['proxy_excluded_unique_opens'] || '0');
  
  const clicksTotal = parseInt(webhookData['Clicks Total'] || '0');
  const uniqueClicks = parseInt(webhookData['Unique Clicks'] || '0');
  const uniqueSubscriberClicks = parseInt(webhookData['Unique Subscriber Clicks'] || '0');
  
  const abuseReports = parseInt(webhookData['Abuse Reports'] || '0');
  const unsubscribes = parseInt(webhookData['Unsubscribed'] || '0');
  const emailsCanceled = parseInt(webhookData['emails_canceled'] || '0');
  
  // Parse rates or calculate if missing
  const openRate = parseFloat(webhookData['Open Rate'] || '0');
  const proxyExcludedOpenRate = parseFloat(webhookData['proxy_excluded_open_rate'] || '0');
  const clickRate = parseFloat(webhookData['Click Rate'] || '0');
  
  // Calculate derived rates
  const clickToOpenRate = uniqueOpens > 0 ? uniqueClicks / uniqueOpens : 0;
  const bounceRate = emailsSent > 0 ? totalBounces / emailsSent : 0;
  const unsubscribeRate = emailsSent > 0 ? unsubscribes / emailsSent : 0;
  
  // Parse delivery status
  const deliveryEnabled = webhookData['Enabled'] === 'true';
  const canCancel = webhookData['can_cancel'] === 'true';
  const deliveryStatus = webhookData['status'] || 'delivered';
  
  // Format the data according to our database schema
  return {
    campaignId: webhookData['Campaign ID'] || '',
    campaignName: webhookData['Campaign Title'] || '',
    campaignDate: sendTime,
    campaignType: webhookData['Type'] || 'regular',
    subject: webhookData['Subject Line'] || '',
    previewText: webhookData['Preview Text'] || '',
    listId: webhookData['List ID'] || '',
    listIsActive: webhookData['List Is Active'] === 'true',
    listName: webhookData['List Name'] || '',
    
    totalRecipients: emailsSent,
    emailsSent,
    emailsCanceled,
    
    deliveryStatus,
    canCancel,
    deliveryEnabled,
    
    hardBounces,
    softBounces,
    syntaxErrors,
    totalBounces,
    
    opensTotal,
    uniqueOpens,
    proxyExcludedOpens,
    proxyExcludedUniqueOpens,
    lastOpenTime,
    
    clicksTotal,
    uniqueClicks,
    uniqueSubscriberClicks,
    lastClickTime,
    
    forwardsCount: 0, // Not in the provided data
    forwardsOpens: 0, // Not in the provided data
    
    abuseReports,
    unsubscribes,
    
    openRate,
    proxyExcludedOpenRate,
    clickRate,
    clickToOpenRate,
    bounceRate,
    unsubscribeRate,
    
    sendTime,
    dayOfWeek,
    
    rawData: webhookData
  };
}

/**
 * Create a SQL query to insert the newsletter data
 */
export function createNewsletterInsertQuery(): {
  query: string;
  getParams: (data: FormattedNewsletterData) => any[];
} {
  const query = `
    INSERT INTO newsletter_analytics (
      campaign_id, campaign_name, campaign_date, campaign_type, subject, preview_text,
      list_id, list_is_active, list_name, total_recipients, emails_sent, emails_canceled,
      delivery_status, can_cancel, delivery_enabled, hard_bounces, soft_bounces, syntax_errors,
      total_bounces, opens_total, unique_opens, proxy_excluded_opens, proxy_excluded_unique_opens,
      last_open_time, clicks_total, unique_clicks, unique_subscriber_clicks, last_click_time,
      forwards_count, forwards_opens, abuse_reports, unsubscribes, open_rate, proxy_excluded_open_rate,
      click_rate, click_to_open_rate, bounce_rate, unsubscribe_rate, send_time, day_of_week,
      raw_data
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
      $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36,
      $37, $38, $39, $40, $41
    ) RETURNING *
  `;
  
  const getParams = (data: FormattedNewsletterData): any[] => [
    data.campaignId,
    data.campaignName,
    data.campaignDate,
    data.campaignType,
    data.subject,
    data.previewText,
    data.listId,
    data.listIsActive,
    data.listName,
    data.totalRecipients,
    data.emailsSent,
    data.emailsCanceled,
    data.deliveryStatus,
    data.canCancel,
    data.deliveryEnabled,
    data.hardBounces,
    data.softBounces,
    data.syntaxErrors,
    data.totalBounces,
    data.opensTotal,
    data.uniqueOpens,
    data.proxyExcludedOpens,
    data.proxyExcludedUniqueOpens,
    data.lastOpenTime,
    data.clicksTotal,
    data.uniqueClicks,
    data.uniqueSubscriberClicks,
    data.lastClickTime,
    data.forwardsCount,
    data.forwardsOpens,
    data.abuseReports,
    data.unsubscribes,
    data.openRate,
    data.proxyExcludedOpenRate,
    data.clickRate,
    data.clickToOpenRate,
    data.bounceRate,
    data.unsubscribeRate,
    data.sendTime,
    data.dayOfWeek,
    JSON.stringify(data.rawData)
  ];
  
  return { query, getParams };
}

/**
 * Sample data in the exact format provided
 */
export const sampleNewsletterData: NewsletterWebhookData = {
  "Campaign ID": "388025b232",
  "Campaign Title": "kevinbadi@nocodeacademy.com",
  "Type": "regular",
  "List ID": "ab6c0d6df6",
  "List Is Active": "true",
  "List Name": "Kev´s No Code Academy",
  "Subject Line": "This Linkedin Sales Agent Sells Itself (Free CodeBase)",
  "Preview Text": "",
  "Emails Sent": "500",
  "Abuse Reports": "0",
  "Unsubscribed": "0",
  "Send Time": "May 22, 2025 12:53 PM",
  "Hard Bounces": "19",
  "Soft Bounces": "8",
  "Syntax Errors": "0",
  "Opens Total": "26",
  "Unique Opens": "23",
  "proxy_excluded_opens": "19",
  "proxy_excluded_unique_opens": "18",
  "Open Rate": "0.048625792811839326",
  "proxy_excluded_open_rate": "0.03805496828752643",
  "Last Open": "May 22, 2025 1:04 PM",
  "Clicks Total": "8",
  "Unique Clicks": "8",
  "Unique Subscriber Clicks": "4",
  "Click Rate": "0.008456659619450317",
  "Last Click": "May 22, 2025 1:01 PM",
  "Enabled": "true",
  "can_cancel": "false",
  "status": "delivered",
  "emails_sent": "500",
  "emails_canceled": "0"
};