import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

// Simple interface for our newsletter analytics data
interface NewsletterAnalytics {
  id: number;
  campaign_name: string;
  subject: string;
  total_recipients: number;
  emails_sent: number;
  total_bounces: number;
  opens_total: number;
  clicks_total: number;
  unsubscribes: number;
  open_rate: number;
  click_rate: number;
  send_time: string;
}

export default function NewsletterDisplay() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch newsletter analytics data
  const { 
    data: newsletterData, 
    isLoading, 
    refetch 
  } = useQuery<NewsletterAnalytics[]>({
    queryKey: ["/api/newsletter-analytics"],
    refetchOnWindowFocus: false,
  });
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };
  
  // Format percentage values for display
  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(2) + "%";
  };
  
  // Format date values for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Newsletter Analytics Agent</h1>
            <p className="text-gray-500">
              This agent reports analytics from all email campaigns sent to our newsletter subscribers 
              every Monday, Wednesday, and Friday at 5 PM EST.
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium">Loading newsletter data...</h3>
              <p className="text-muted-foreground">Please wait while we fetch the campaign data.</p>
            </div>
          </div>
        ) : newsletterData && newsletterData.length > 0 ? (
          <>
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Campaign Performance</CardTitle>
                  <CardDescription>
                    All email campaigns sent to our newsletter subscribers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 [&>th]:p-2 text-left">
                          <th>Campaign</th>
                          <th>Subject</th>
                          <th>Recipients</th>
                          <th>Bounces</th>
                          <th>Opens</th>
                          <th>Clicks</th>
                          <th>Unsubscribes</th>
                          <th>Open Rate</th>
                          <th>Click Rate</th>
                          <th>Sent Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newsletterData.map((campaign) => (
                          <tr key={campaign.id} className="border-b [&>td]:p-2">
                            <td className="font-medium">{campaign.campaign_name}</td>
                            <td>{campaign.subject}</td>
                            <td>{campaign.total_recipients}</td>
                            <td>{campaign.total_bounces}</td>
                            <td>{campaign.opens_total}</td>
                            <td>{campaign.clicks_total}</td>
                            <td>{campaign.unsubscribes || 0}</td>
                            <td>{formatPercentage(campaign.open_rate)}</td>
                            <td>{formatPercentage(campaign.click_rate)}</td>
                            <td>{formatDate(campaign.send_time)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsletterData.map((campaign) => (
                <Card key={campaign.id} className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-lg">{campaign.subject}</CardTitle>
                    <CardDescription>
                      {campaign.campaign_name} • {formatDate(campaign.send_time)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      <div className="px-4 py-3 flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Recipients:</span>
                        <span className="font-medium">{campaign.total_recipients}</span>
                      </div>
                      <div className="px-4 py-3 flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Bounces:</span>
                        <span className="font-medium">{campaign.total_bounces}</span>
                      </div>
                      <div className="px-4 py-3 flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Opens:</span>
                        <span className="font-medium">{campaign.opens_total}</span>
                      </div>
                      <div className="px-4 py-3 flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Clicks:</span>
                        <span className="font-medium">{campaign.clicks_total}</span>
                      </div>
                      <div className="px-4 py-3 flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Unsubscribes:</span>
                        <span className="font-medium">{campaign.unsubscribes || 0}</span>
                      </div>
                      <div className="px-4 py-3 flex justify-between bg-blue-50">
                        <span className="text-sm font-medium text-blue-700">Open Rate:</span>
                        <span className="font-bold text-blue-700">{formatPercentage(campaign.open_rate)}</span>
                      </div>
                      <div className="px-4 py-3 flex justify-between bg-green-50">
                        <span className="text-sm font-medium text-green-700">Click Rate:</span>
                        <span className="font-bold text-green-700">{formatPercentage(campaign.click_rate)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium">No newsletter data available</h3>
              <p className="text-muted-foreground">Try sending a campaign first or create sample data.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}