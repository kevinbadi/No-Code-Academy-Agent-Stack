import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Instagram, RefreshCw, Users, MessageSquare, CheckCircle, Search, User, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function InstagramWarmLeadAgent() {
  // Instagram agent data with profile information
  const [instagramData, setInstagramData] = useState({
    // User profile
    username: "tonda.thr",
    fullName: "𝓐𝓷𝓽𝓸𝓲𝓷𝓮",
    profileUrl: "https://instagram.com/tonda.thr",
    profilePictureUrl: "https://scontent-cdg4-3.cdninstagram.com/v/t51.2885-19/475231190_1110025517526822_5889129386798833630_n.jpg",
    instagramID: "48999683829",
    isVerified: false,
    followedByViewer: false,
    requestedByViewer: false,
    photoUrl: "https://www.instagram.com/p/CqgeV-3MYIr/",
    
    // Daily metrics
    dailyProfilesScanned: 120,
    dailyLeadsFound: 15,
    dailyMessagesInitiated: 12,
    dailyResponsesReceived: 5,
    
    // Total metrics
    totalProfilesScanned: 500,
    totalLeadsFound: 65,
    totalMessagesInitiated: 50,
    totalResponsesReceived: 22,
    
    // Status information
    status: "Active",
    targetAudience: "Business owners, entrepreneurs, startup founders",
    conversionRate: 13.0,
    responseRate: 44.0,
    
    // Connection info
    connectionStatus: "Connected to Instagram"
  });
  
  // Function to fetch Instagram data from API
  const fetchInstagramData = async () => {
    try {
      const response = await fetch('/api/instagram-agent-leads/latest');
      const data = await response.json();
      
      if (data) {
        setInstagramData(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error("Error fetching Instagram agent data:", error);
    }
  };

  // Calculate percentages for progress bars
  const leadConversionRate = instagramData.totalProfilesScanned > 0 
    ? (instagramData.totalLeadsFound / instagramData.totalProfilesScanned) * 100 
    : 0;

  const responseRate = instagramData.totalMessagesInitiated > 0 
    ? (instagramData.totalResponsesReceived / instagramData.totalMessagesInitiated) * 100 
    : 0;

  // Add useEffect to fetch data when component mounts
  useEffect(() => {
    fetchInstagramData();
  }, []);
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchInstagramData();
  };
  
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Instagram className="h-6 w-6 text-[#E1306C] mr-2" />
            <h3 className="text-lg font-medium text-gray-700">Instagram Warm Lead Agent</h3>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
              {instagramData.status}
            </span>
            <Button variant="outline" size="sm" className="flex items-center" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Latest Lead Profile */}
        <div className="mb-6 bg-gradient-to-r from-purple-50 via-pink-50 to-pink-100 p-5 rounded-lg border border-pink-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <User className="h-4 w-4 mr-1 text-[#E1306C]" />
            Latest Instagram Lead
          </h4>
          
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-shrink-0">
              <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                <AvatarImage src={instagramData.profilePictureUrl} alt={instagramData.username} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-[#E1306C] text-white">
                  {instagramData.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-grow space-y-2">
              <div className="flex items-center">
                <span className="font-bold text-gray-800">{instagramData.fullName}</span>
                {instagramData.isVerified && (
                  <Badge variant="outline" className="ml-2 text-[#E1306C] border-[#E1306C]">Verified</Badge>
                )}
              </div>
              
              <div className="flex items-center text-gray-500 text-sm">
                <span>@{instagramData.username}</span>
                <a 
                  href={instagramData.profileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-[#E1306C] hover:text-pink-700 inline-flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Profile
                </a>
              </div>
              
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-500">ID: </span>
                  <span className="text-gray-700">{instagramData.instagramID}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status: </span>
                  <span className="text-gray-700">
                    {instagramData.followedByViewer ? "Following" : 
                     instagramData.requestedByViewer ? "Requested" : "Not Following"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="md:ml-auto mt-2 md:mt-0">
              <Button size="sm" className="bg-gradient-to-r from-[#FCAF45] to-[#E1306C] hover:opacity-90 text-white">
                Message Lead
              </Button>
            </div>
          </div>
        </div>
        
        {/* Today's Activity */}
        <div className="mb-6 bg-pink-50 p-5 rounded-lg border border-pink-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Search className="h-4 w-4 mr-1 text-[#E1306C]" />
            Today's Outreach Activity
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border border-pink-100 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Profiles Scanned</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-[#E1306C]">{instagramData.dailyProfilesScanned}</span>
                  <span className="text-xs text-gray-500 ml-1">today</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-pink-100 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Leads Found</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-[#E1306C]">{instagramData.dailyLeadsFound}</span>
                  <span className="text-xs text-gray-500 ml-1">today</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-pink-100 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Messages Sent</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-[#E1306C]">{instagramData.dailyMessagesInitiated}</span>
                  <span className="text-xs text-gray-500 ml-1">today</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-pink-100 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Responses</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-[#E1306C]">{instagramData.dailyResponsesReceived}</span>
                  <span className="text-xs text-gray-500 ml-1">today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Overall Performance */}
        <div className="mb-6 p-5 rounded-lg border border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-1 text-[#E1306C]" />
            Overall Campaign Performance
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Total Profiles</span>
                <span className="text-2xl font-bold text-gray-800">{instagramData.totalProfilesScanned}</span>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Total Leads</span>
                <span className="text-2xl font-bold text-gray-800">{instagramData.totalLeadsFound}</span>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Total Messages</span>
                <span className="text-2xl font-bold text-gray-800">{instagramData.totalMessagesInitiated}</span>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Total Responses</span>
                <span className="text-2xl font-bold text-gray-800">{instagramData.totalResponsesReceived}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Analytics */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <MessageSquare className="h-4 w-4 mr-1 text-[#E1306C]" />
            Campaign Analytics
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium flex items-center">
                  <Search className="h-3 w-3 mr-1 text-[#E1306C]" />
                  Lead Conversion Rate
                </span>
                <span className="font-medium">{instagramData.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#FCAF45] to-[#E1306C] h-2 rounded-full" 
                  style={{ width: `${Math.min(100, instagramData.conversionRate)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {instagramData.totalLeadsFound} leads from {instagramData.totalProfilesScanned} profiles
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1 text-[#E1306C]" />
                  Response Rate
                </span>
                <span className="font-medium">{instagramData.responseRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#FCAF45] to-[#E1306C] h-2 rounded-full" 
                  style={{ width: `${Math.min(100, instagramData.responseRate)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {instagramData.totalResponsesReceived} responses from {instagramData.totalMessagesInitiated} messages
              </div>
            </div>
          </div>
        </div>
        
        {/* Target Audience */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-[#E1306C]" />
            Target Audience Settings
          </h4>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="mb-3">
              <span className="text-xs text-gray-500 block mb-1">Current Target</span>
              <span className="text-sm font-medium">{instagramData.targetAudience}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gradient-to-r from-pink-50 to-pink-100 text-pink-800 rounded-full text-xs font-medium shadow-sm">
                Business owners
              </span>
              <span className="px-2 py-1 bg-gradient-to-r from-pink-50 to-pink-100 text-pink-800 rounded-full text-xs font-medium shadow-sm">
                Entrepreneurs
              </span>
              <span className="px-2 py-1 bg-gradient-to-r from-pink-50 to-pink-100 text-pink-800 rounded-full text-xs font-medium shadow-sm">
                Startup founders
              </span>
              <span className="px-2 py-1 bg-gradient-to-r from-pink-50 to-pink-100 text-pink-800 rounded-full text-xs font-medium shadow-sm">
                Tech industry
              </span>
              <span className="px-2 py-1 bg-gradient-to-r from-pink-50 to-pink-100 text-pink-800 rounded-full text-xs font-medium shadow-sm">
                Digital marketing
              </span>
            </div>
            
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full text-[#E1306C] border-[#E1306C] hover:bg-pink-50">
                Configure Target Audience
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}