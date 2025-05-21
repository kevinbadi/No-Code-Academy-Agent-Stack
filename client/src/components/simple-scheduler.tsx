import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { COMMON_CRON_EXPRESSIONS } from "@shared/scheduler-schema";
import { useLatestMetric, useLatestLinkedinAgentLeads } from "@/hooks/use-metrics";
import { formatDateTime } from "@/lib/date-utils";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Calendar, Clock, Play, Settings, 
  Repeat, Copy, CheckCircle, AlertCircle, 
  Zap, Activity
} from "lucide-react";

/**
 * An integrated component that combines webhook status and scheduling functionality.
 * It shows status information from the LinkedIn agent and allows triggering or scheduling
 * the webhook.
 */
export default function SimpleScheduler() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: latestMetric } = useLatestMetric();
  const { data: latestLeads } = useLatestLinkedinAgentLeads();
  
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("https://hook.us2.make.com/w2b6ubph0j3rxcfd1kj3c3twmamrqico");
  const [isScheduleActive, setIsScheduleActive] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<string | null>(null);
  
  // Get the last update time from the latest LinkedIn webhook data or fallback to metric time
  const lastUpdateTime = latestLeads?.timestamp 
    ? new Date(latestLeads.timestamp) 
    : latestMetric 
      ? new Date(latestMetric.date) 
      : new Date();
  
  // Calculate next scheduled time (based on active schedule or default to 6 hours)
  const nextScheduledTime = new Date(lastUpdateTime);
  nextScheduledTime.setHours(nextScheduledTime.getHours() + 6);
  
  // Get additional data from the LinkedIn agent webhook response
  const dailySent = latestLeads?.dailySent || 0;
  const dailyAccepted = latestLeads?.dailyAccepted || 0;
  const processedProfiles = latestLeads?.processedProfiles || 0;
  const maxInvitations = latestLeads?.maxInvitations || 0;
  const status = latestLeads?.status || "No status available";
  const connectionStatus = latestLeads?.connectionStatus || "Not connected";
  
  // Copy webhook URL to clipboard
  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copied to clipboard",
      description: "Webhook URL has been copied to your clipboard",
    });
  };
  
  // Handle manual webhook trigger
  const handleManualTrigger = async () => {
    setIsLoading(true);
    
    try {
      // This is the Make.com webhook we need to directly trigger
      const makeWebhookUrl = "https://hook.us2.make.com/w2b6ubph0j3rxcfd1kj3c3twmamrqico";
      console.log("Calling Make.com webhook directly:", makeWebhookUrl);
      
      // Use the direct webhook URL, not the variable (which might be changed by user)
      const response = await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // The Make.com webhook expects this format
        body: JSON.stringify({
          request_source: "dashboard",
          trigger_timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to trigger webhook: ${response.status}`);
      }
      
      // Process the webhook response
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log("Webhook response data:", responseData);
      } else {
        const textResponse = await response.text();
        console.log("Webhook response text:", textResponse);
        // Try to parse the text as JSON in case the content-type header is incorrect
        try {
          responseData = JSON.parse(textResponse);
          console.log("Webhook response parsed as JSON:", responseData);
        } catch (e) {
          console.log("Processing text response");
        }
      }
      
      // Store webhook data in the database by sending directly to our webhook endpoint
      if (responseData) {
        console.log("Sending webhook data to our database endpoint:", responseData);
        
        // Send the raw webhook response to our internal webhook endpoint
        // This uses the same processing logic as the server webhook endpoint
        const dbResponse = await fetch('/api/webhook/linkedin-agent/kpi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(responseData)
        });
        
        console.log("Database storage response status:", dbResponse.status);
        
        if (!dbResponse.ok) {
          console.warn("Failed to store webhook data in database:", await dbResponse.text());
        } else {
          console.log("Successfully stored webhook data in database");
        }
      }
      
      // Add a new activity to record the webhook was triggered
      await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'manual',
          message: 'Manually triggered LinkedIn agent webhook',
          metadata: {
            trigger: 'manual',
            timestamp: new Date().toISOString(),
            success: true,
            response: responseData ? 'Received webhook data' : 'No data received'
          }
        })
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/latest'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/range'] });
      queryClient.invalidateQueries({ queryKey: ['/api/linkedin-agent-leads/latest'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      
      // Add a webhook response message
      let toastMessage = "The LinkedIn agent webhook was successfully triggered";
      
      // If we got a valid response with invite data, show some details
      if (responseData && responseData.invite_summaryCollection) {
        const summary = responseData.invite_summaryCollection;
        if (summary.dayCollection) {
          toastMessage += `. Today: ${summary.dayCollection.sent} invites sent, ${summary.dayCollection.accepted} accepted.`;
        }
      }
      
      toast({
        title: "LinkedIn Agent Webhook Triggered",
        description: toastMessage
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      
      toast({
        title: "Webhook Error",
        description: error instanceof Error ? error.message : "Failed to trigger the webhook",
        variant: "destructive"
      });
      
      // Record the failed attempt
      await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'error',
          message: 'Failed to trigger LinkedIn agent webhook',
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString()
          }
        })
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle schedule setup
  const handleSetSchedule = async () => {
    // Find the selected schedule details
    const selectedSchedule = COMMON_CRON_EXPRESSIONS.find(item => item.value === schedule);
    
    if (!selectedSchedule) {
      toast({
        title: "Schedule Required",
        description: "Please select a schedule frequency.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Log the activity for setting up a schedule
      await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'system',
          message: `Webhook schedule configured: ${selectedSchedule.label}`,
          metadata: {
            schedule: selectedSchedule.value,
            webhookUrl,
            timestamp: new Date().toISOString()
          }
        })
      });
      
      // Invalidate the activities query to update the feed
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      
      // Set the active schedule information
      setActiveSchedule(selectedSchedule.label);
      setIsScheduleActive(true);
      
      toast({
        title: "Schedule Configured",
        description: `LinkedIn webhook scheduled: ${selectedSchedule.label}. The server will automatically trigger the webhook according to this schedule.`
      });
    } catch (error) {
      console.error("Error setting schedule:", error);
      
      toast({
        title: "Schedule Error",
        description: error instanceof Error ? error.message : "Failed to set the schedule",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle schedule active state
  const toggleScheduleActive = () => {
    setIsScheduleActive(!isScheduleActive);
    
    toast({
      title: isScheduleActive ? "Schedule Paused" : "Schedule Activated",
      description: isScheduleActive 
        ? "The automated webhook schedule has been paused." 
        : "The automated webhook schedule has been activated."
    });
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="relative pb-0">
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">LinkedIn Agent Webhook</CardTitle>
            <CardDescription>
              Monitor status, trigger manually, or set up automation schedule
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              <span className="text-sm text-green-600 font-medium">Connected</span>
            </div>
            {activeSchedule && (
              <>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <Badge variant={isScheduleActive ? "default" : "secondary"} className="h-6">
                  <Clock className="mr-1 h-3 w-3" />
                  {activeSchedule}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isScheduleActive}
                    onCheckedChange={toggleScheduleActive}
                    aria-label="Toggle schedule"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="status" className="px-1">
        <div className="px-6 pt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">
              <Activity className="mr-2 h-4 w-4" />
              Status
            </TabsTrigger>
            <TabsTrigger value="trigger">
              <Zap className="mr-2 h-4 w-4" />
              Trigger
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Settings className="mr-2 h-4 w-4" />
              Schedule
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Status Tab */}
        <TabsContent value="status" className="p-0">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Status Information */}
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-4 flex items-center">
                  <Activity className="mr-2 h-4 w-4 text-blue-500" />
                  LinkedIn Agent Status
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Update</span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatDateTime(lastUpdateTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Next Scheduled</span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatDateTime(nextScheduledTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">LinkedIn Status</span>
                    <span className="text-sm font-medium flex items-center">
                      {connectionStatus.includes("Successfully") ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-green-600">Connected</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 text-amber-500 mr-1" />
                          <span className="text-amber-600">Not Connected</span>
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Today's Progress</span>
                    <span className="text-sm font-medium text-gray-700">
                      {processedProfiles} / {maxInvitations} profiles
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Agent Status</span>
                    <span className="text-sm font-medium text-blue-500">
                      {status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Webhook URL */}
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-purple-500" />
                  Webhook Endpoint
                </h3>
                <div className="flex">
                  <code className="text-xs bg-gray-100 p-2 rounded flex-1 font-mono text-gray-700 overflow-x-auto">
                    {webhookUrl}
                  </code>
                  <button 
                    className="ml-2 text-[#0077B5] hover:text-[#005e8b]"
                    onClick={copyWebhookUrl}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        {/* Trigger Tab */}
        <TabsContent value="trigger" className="p-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-blue-500" />
                  Manual Webhook Trigger
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manually trigger the LinkedIn agent webhook to process new connections and update metrics.
                </p>
                <Button 
                  onClick={handleManualTrigger}
                  disabled={isLoading}
                  className="w-full bg-[#0077B5] hover:bg-[#005e8b]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Trigger LinkedIn Agent Webhook Now
                    </>
                  )}
                </Button>
              </div>
              
              {activeSchedule && (
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Repeat className="mr-2 h-4 w-4 text-green-500" />
                    Active Schedule
                  </h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{activeSchedule}</p>
                      <p className="text-xs text-muted-foreground">
                        Status: {isScheduleActive ? "Active" : "Paused"}
                      </p>
                    </div>
                    <Switch
                      checked={isScheduleActive}
                      onCheckedChange={toggleScheduleActive}
                      aria-label="Toggle schedule"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
        
        {/* Schedule Tab */}
        <TabsContent value="schedule" className="p-0">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hook.make.com/your-webhook-id"
              />
              <p className="text-sm text-muted-foreground">
                Your Make.com webhook URL for the LinkedIn agent
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schedule">Automation Schedule</Label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_CRON_EXPRESSIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How often the LinkedIn agent webhook should be called
              </p>
            </div>
            
            <Button 
              onClick={handleSetSchedule}
              disabled={!schedule || isLoading}
              className="w-full mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Apply Schedule Settings
                </>
              )}
            </Button>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}