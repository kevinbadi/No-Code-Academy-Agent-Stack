import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRefreshData } from "@/hooks/use-metrics";

export default function ServerAutomationButton() {
  const { toast } = useToast();
  const { mutate: refreshData } = useRefreshData();
  const [isLoading, setIsLoading] = useState(false);
  
  const triggerAutomation = async () => {
    setIsLoading(true);
    
    try {
      // Call the server-side webhook endpoint
      const response = await fetch('/api/trigger-agent-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log("Server automation triggered successfully:", result);
        
        toast({
          title: "Automation Triggered",
          description: "LinkedIn agent automation triggered successfully",
        });
        
        // Refresh the dashboard data
        refreshData();
      } else {
        console.error("Error triggering automation:", result);
        
        toast({
          title: "Automation Error",
          description: result.message || "Failed to trigger LinkedIn agent automation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error calling automation endpoint:", error);
      
      toast({
        title: "Connection Error",
        description: "Failed to connect to automation endpoint",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={triggerAutomation}
      disabled={isLoading}
      size="lg"
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Running Automation...
        </>
      ) : (
        "Run LinkedIn Agent (Server)"
      )}
    </Button>
  );
}