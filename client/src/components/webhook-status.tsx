import { Card, CardContent } from "@/components/ui/card";
import { Copy, Bot, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLatestMetric, useTriggerAgentWebhook } from "@/hooks/use-metrics";
import { formatDateTime } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";

export default function WebhookStatus() {
  const { toast } = useToast();
  const { data: latestMetric } = useLatestMetric();
  const { mutate: triggerWebhook, isPending: isTriggering } = useTriggerAgentWebhook();
  
  const webhookUrl = "https://hook.us2.make.com/8j6hpulng3f8obvebciva6kzpg6kyydx";
  
  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copied to clipboard",
      description: "Webhook URL has been copied to your clipboard",
    });
  };
  
  const handleTriggerWebhook = () => {
    triggerWebhook(undefined, {
      onSuccess: (data) => {
        toast({
          title: "Webhook Triggered",
          description: "Successfully contacted the LinkedIn agent webhook",
        });
        console.log("Webhook response:", data);
      },
      onError: (error) => {
        toast({
          title: "Webhook Error",
          description: error instanceof Error ? error.message : "Failed to trigger webhook",
          variant: "destructive",
        });
      }
    });
  };
  
  // Get the last update time from the latest metric or fallback to current time
  const lastUpdateTime = latestMetric ? new Date(latestMetric.date) : new Date();
  
  // Calculate next scheduled time (6 hours after the last update)
  const nextScheduledTime = new Date(lastUpdateTime);
  nextScheduledTime.setHours(nextScheduledTime.getHours() + 6);
  
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
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Webhook Health</span>
            <span className="text-sm font-medium text-green-500">98.5%</span>
          </div>
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
            <Button
              onClick={handleTriggerWebhook}
              disabled={isTriggering}
              className="w-full bg-[#0077B5] hover:bg-[#005e8b] text-white font-medium"
            >
              {isTriggering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Triggering Webhook...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Trigger LinkedIn Agent Webhook
                </>
              )}
            </Button>
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
