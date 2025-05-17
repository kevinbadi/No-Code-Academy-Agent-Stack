import { Card, CardContent } from "@/components/ui/card";
import { Copy, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLatestMetric, useLatestLinkedinAgentLeads } from "@/hooks/use-metrics";
import { formatDateTime } from "@/lib/date-utils";
import DirectWebhookButton from "./direct-webhook-button";

export default function WebhookStatus() {
  const { toast } = useToast();
  const { data: latestMetric } = useLatestMetric();
  const { data: latestLeads, isLoading: isLoadingLeads } = useLatestLinkedinAgentLeads();
  
  const webhookUrl = "https://hook.us2.make.com/w2b6ubph0j3rxcfd1kj3c3twmamrqico";
  
  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copied to clipboard",
      description: "Webhook URL has been copied to your clipboard",
    });
  };
  
  // Get the last update time from the latest LinkedIn webhook data or fallback to metric time
  const lastUpdateTime = latestLeads?.timestamp 
    ? new Date(latestLeads.timestamp) 
    : latestMetric 
      ? new Date(latestMetric.date) 
      : new Date();
  
  // Calculate next scheduled time (6 hours after the last update)
  const nextScheduledTime = new Date(lastUpdateTime);
  nextScheduledTime.setHours(nextScheduledTime.getHours() + 6);
  
  // Get additional data from the LinkedIn agent webhook response
  const dailySent = latestLeads?.dailySent || 0;
  const dailyAccepted = latestLeads?.dailyAccepted || 0;
  const totalSent = latestLeads?.totalSent || 0;
  const totalAccepted = latestLeads?.totalAccepted || 0;
  const processedProfiles = latestLeads?.processedProfiles || 0;
  const maxInvitations = latestLeads?.maxInvitations || 0;
  const status = latestLeads?.status || "No status available";
  const connectionStatus = latestLeads?.connectionStatus || "Not connected";
  
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-700">Webhook Status</h3>
          <div className="flex items-center">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span className="text-sm text-green-600 font-medium">Connected</span>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Last Update</span>
            <span className="text-sm font-medium text-gray-700">
              {formatDateTime(lastUpdateTime)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Next Scheduled</span>
            <span className="text-sm font-medium text-gray-700">
              {formatDateTime(nextScheduledTime)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
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
          
          {latestLeads && (
            <>
              <div className="flex items-center justify-between mb-2">
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
            </>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Webhook Endpoint</h4>
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
          
          <div className="mt-5 flex flex-col space-y-3">
            <DirectWebhookButton />
            <div className="text-xs text-gray-500 text-center">
              This will fetch real-time KPI data from your LinkedIn outreach agent
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button className="text-sm text-[#0077B5] hover:underline">
              Configure Webhook
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}