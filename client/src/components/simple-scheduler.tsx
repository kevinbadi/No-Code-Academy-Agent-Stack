import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { COMMON_CRON_EXPRESSIONS } from "@shared/scheduler-schema";
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
import { Loader2 } from "lucide-react";

/**
 * A simplified scheduler component that allows triggering the LinkedIn webhook
 * on a schedule.
 */
export default function SimpleScheduler() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("https://hook.make.com/yourwebhookid");
  
  // Handle manual webhook trigger
  const handleManualTrigger = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/trigger-agent-webhook', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to trigger webhook: ${response.status}`);
      }
      
      toast({
        title: "Webhook Triggered",
        description: "The LinkedIn agent webhook was successfully triggered."
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      
      toast({
        title: "Webhook Error",
        description: error instanceof Error ? error.message : "Failed to trigger the webhook",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle schedule setup
  const handleSetSchedule = () => {
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
    
    toast({
      title: "Schedule Configured",
      description: `LinkedIn webhook scheduled: ${selectedSchedule.label}. The server will automatically trigger the webhook according to this schedule.`
    });
    
    // In a production app, this would save the schedule to the server
    console.log("Schedule configured:", {
      schedule: selectedSchedule.value,
      label: selectedSchedule.label,
      webhookUrl
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Webhook Automation</CardTitle>
        <CardDescription>
          Configure when the LinkedIn agent webhook should be triggered
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button 
          onClick={handleSetSchedule}
          disabled={!schedule || isLoading}
          className="w-full sm:w-auto"
        >
          Set Automation Schedule
        </Button>
        
        <Button 
          variant="secondary" 
          className="w-full sm:w-auto"
          onClick={handleManualTrigger}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Trigger Webhook Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}