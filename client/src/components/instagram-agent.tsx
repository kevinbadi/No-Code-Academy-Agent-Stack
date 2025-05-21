import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

export default function InstagramWarmLeadAgent() {
  // Default placeholder data for Instagram agent
  const [instagramData, setInstagramData] = useState({
    dailyProfilesScanned: 0,
    dailyLeadsFound: 0,
    dailyMessagesInitiated: 0,
    dailyResponsesReceived: 0,
    
    totalProfilesScanned: 0,
    totalLeadsFound: 0,
    totalMessagesInitiated: 0,
    totalResponsesReceived: 0,
    
    status: "Ready to scan",
    targetAudience: "Business owners, entrepreneurs",
    conversionRate: 0,
    responseRate: 0,
    
    connectionStatus: "Not connected"
  });

  // Function to fetch Instagram data from API
  const fetchInstagramData = async () => {
    try {
      const response = await fetch('/api/instagram-agent-leads/latest');
      const data = await response.json();
      
      if (data) {
        setInstagramData(data);
      }
    } catch (error) {
      console.error("Error fetching Instagram agent data:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchInstagramData();
  }, []);

  // Calculate percentages for progress bars
  const leadConversionRate = instagramData.totalProfilesScanned > 0 
    ? (instagramData.totalLeadsFound / instagramData.totalProfilesScanned) * 100 
    : 0;

  const responseRate = instagramData.totalMessagesInitiated > 0 
    ? (instagramData.totalResponsesReceived / instagramData.totalMessagesInitiated) * 100 
    : 0;

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-700">Instagram Warm Lead Agent</h3>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
              Ready
            </span>
          </div>
        </div>
        
        <div className="mb-8 bg-pink-50 p-6 rounded-lg border border-pink-100">
          <h4 className="text-base font-medium text-gray-700 mb-4">Current Performance</h4>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Total Profiles Scanned</span>
                <span className="text-3xl font-bold text-[#E1306C]">{instagramData.totalProfilesScanned}</span>
              </div>
            </div>
            
            <div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Total Warm Leads Found</span>
                <span className="text-3xl font-bold text-[#E1306C]">{instagramData.totalLeadsFound}</span>
              </div>
            </div>
            
            <div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Messages Initiated</span>
                <span className="text-3xl font-bold text-[#E1306C]">{instagramData.totalMessagesInitiated}</span>
              </div>
            </div>
            
            <div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Responses Received</span>
                <span className="text-3xl font-bold text-[#E1306C]">{instagramData.totalResponsesReceived}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Analytics */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Instagram Lead Analytics</h4>
          
          <div className="space-y-6 mt-4">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">Lead Conversion Rate</span>
                <span className="font-medium">{leadConversionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-[#E1306C] h-3 rounded-full" 
                  style={{ width: `${Math.min(100, leadConversionRate)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                Leads found per profiles scanned
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">Response Rate</span>
                <span className="font-medium">{responseRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-[#E1306C] h-3 rounded-full" 
                  style={{ width: `${Math.min(100, responseRate)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                Responses per message sent
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">Target Audience</span>
                <span className="font-medium">{instagramData.targetAudience}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">Business owners</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">Entrepreneurs</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">Startup founders</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">Tech industry</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}