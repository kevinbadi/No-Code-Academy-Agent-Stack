import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Instagram, 
  RefreshCw, 
  MessageSquare, 
  CheckCircle, 
  Search, 
  User, 
  ExternalLink,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Define lead status types
type LeadStatus = "warm_lead" | "message_sent" | "sale_closed";

// Interface for Instagram Lead
interface InstagramLead {
  id: number;
  username: string;
  fullName: string;
  profileUrl: string;
  profilePictureUrl: string;
  instagramID: string;
  isVerified: boolean;
  bio?: string;
  followers?: number;
  following?: number;
  status: LeadStatus;
  dateAdded: string;
  lastUpdated: string;
  notes?: string;
  tags?: string[];
  totalMessagesSent?: number;
}

// Interface for lead counts
interface LeadCounts {
  warmLeadCount: number;
  messageSentCount: number;
  saleClosedCount: number;
  totalCount: number;
}

export default function InstagramLeadPipeline() {
  const [activeTab, setActiveTab] = useState<LeadStatus>("warm_lead");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<InstagramLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<InstagramLead[]>([]);
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [noteText, setNoteText] = useState("");
  const [totalMessagesSent, setTotalMessagesSent] = useState(0);
  const [dailyMessagesSent, setDailyMessagesSent] = useState(0);
  const [counts, setCounts] = useState<LeadCounts & { totalMessagesSent?: number, dailyMessagesSent?: number }>({
    warmLeadCount: 0,
    messageSentCount: 0,
    saleClosedCount: 0,
    totalCount: 0,
    totalMessagesSent: 0,
    dailyMessagesSent: 0
  });
  
  // Filter leads based on current tab
  const filterLeadsByStatus = (status: LeadStatus) => {
    setActiveTab(status);
    const filtered = leads.filter(lead => lead.status === status);
    setFilteredLeads(filtered);
    setCurrentLeadIndex(0); // Reset to first lead when changing tabs
  };
  
  // Handle refreshing lead data
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch fresh data from the API
      const response = await fetch('/api/instagram-leads');
      if (response.ok) {
        const leadsData = await response.json();
        setLeads(leadsData);
        filterLeadsByStatus(activeTab);
        
        // Also refresh counts
        const countsResponse = await fetch('/api/instagram-leads/counts');
        if (countsResponse.ok) {
          const countsData = await countsResponse.json();
          console.log("Retrieved counts data:", countsData);
          
          // Update all counts including totalMessagesSent and dailyMessagesSent
          setCounts({
            warmLeadCount: countsData.warmLeadCount || 0,
            messageSentCount: countsData.messageSentCount || 0,
            saleClosedCount: countsData.saleClosedCount || 0,
            totalCount: countsData.totalCount || 0,
            totalMessagesSent: countsData.totalMessagesSent || 0,
            dailyMessagesSent: countsData.dailyMessagesSent || 0
          });
          
          // Update both message count states
          setTotalMessagesSent(countsData.totalMessagesSent || 0);
          setDailyMessagesSent(countsData.dailyMessagesSent || 0);
          console.log("Daily messages sent today:", countsData.dailyMessagesSent || 0);
        }
      } else {
        console.error("Failed to refresh Instagram leads:", await response.text());
        setError("Failed to refresh data");
      }
    } catch (error) {
      console.error("Error refreshing Instagram leads:", error);
      setError("Error connecting to the server");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle marking a lead as "Message Sent" - updates DB and moves lead to message_sent table
  const handleMarkMessageSent = async (leadId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the API to update the lead status in the database
      const response = await fetch(`/api/instagram-leads/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'message_sent',
          notes: noteText.trim() || undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }
      
      // Update local state to reflect the change
      setLeads(prevLeads => {
        // First update the current lead's status
        const updatedLeads = prevLeads.map(lead => {
          if (lead.id === leadId) {
            return {
              ...lead,
              status: "message_sent" as LeadStatus,
              lastUpdated: new Date().toISOString(),
              notes: noteText.trim() || lead.notes
            };
          }
          return lead;
        });
        
        return updatedLeads;
      });
      
      // Update counts
      const countsResponse = await fetch('/api/instagram-leads/counts');
      if (countsResponse.ok) {
        const countsData = await countsResponse.json();
        setCounts({
          warmLeadCount: countsData.warmLeadCount || 0,
          messageSentCount: countsData.messageSentCount || 0,
          saleClosedCount: countsData.saleClosedCount || 0,
          totalCount: countsData.totalCount || 0,
          totalMessagesSent: countsData.totalMessagesSent || 0
        });
        
        // Update the separate totalMessagesSent state
        setTotalMessagesSent(countsData.totalMessagesSent || 0);
      }
      
      // Clear the note text
      setNoteText("");
      
      // Remove the processed lead from filtered leads
      setFilteredLeads(prevFilteredLeads => 
        prevFilteredLeads.filter(lead => lead.id !== leadId)
      );
      
      // Update current lead index if needed
      if (currentLeadIndex >= filteredLeads.length - 1) {
        setCurrentLeadIndex(Math.max(0, filteredLeads.length - 2));
      }
      
    } catch (error) {
      console.error('Error updating lead status:', error);
      setError("Failed to update lead status");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle closing a sale - updates DB and moves lead to sale_closed table
  const handleCloseSale = async (leadId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the API to update the lead status in the database
      const response = await fetch(`/api/instagram-leads/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'sale_closed',
          notes: noteText.trim() || undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }
      
      // Update local state to reflect the change
      setLeads(prevLeads => 
        prevLeads.map(lead => {
          if (lead.id === leadId) {
            return {
              ...lead,
              status: "sale_closed" as LeadStatus,
              lastUpdated: new Date().toISOString(),
              notes: noteText.trim() || lead.notes
            };
          }
          return lead;
        })
      );
      
      // Remove the lead from the filtered leads
      setFilteredLeads(prevFilteredLeads => 
        prevFilteredLeads.filter(lead => lead.id !== leadId)
      );
      
      // Update counts
      const countsResponse = await fetch('/api/instagram-leads/counts');
      if (countsResponse.ok) {
        const countsData = await countsResponse.json();
        setCounts({
          warmLeadCount: countsData.warmLeadCount || 0,
          messageSentCount: countsData.messageSentCount || 0,
          saleClosedCount: countsData.saleClosedCount || 0,
          totalCount: countsData.totalCount || 0,
          totalMessagesSent: countsData.totalMessagesSent || 0
        });
      }
      
      // Clear note text
      setNoteText("");
      
    } catch (error) {
      console.error('Error updating lead status:', error);
      setError("Failed to update lead status");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch real data from our database API
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const fetchLeads = async () => {
      try {
        // Fetch all Instagram leads from our API
        const response = await fetch('/api/instagram-leads');
        if (response.ok) {
          const leadsData = await response.json();
          setLeads(leadsData);
          filterLeadsByStatus("warm_lead");
        } else {
          console.error("Failed to fetch Instagram leads:", await response.text());
          setError("Failed to load Instagram leads");
        }
      } catch (error) {
        console.error("Error fetching Instagram leads:", error);
        setError("Error connecting to the server");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch lead counts for badges
    const fetchLeadCounts = async () => {
      try {
        const response = await fetch('/api/instagram-leads/counts');
        if (response.ok) {
          const countsData = await response.json();
          setCounts({
            warmLeadCount: countsData.warmLeadCount || 0,
            messageSentCount: countsData.messageSentCount || 0,
            saleClosedCount: countsData.saleClosedCount || 0,
            totalCount: countsData.totalCount || 0,
            totalMessagesSent: countsData.totalMessagesSent || 0
          });
          
          // Set the separate totalMessagesSent state
          setTotalMessagesSent(countsData.totalMessagesSent || 0);
        }
      } catch (error) {
        console.error("Error fetching lead counts:", error);
      }
    };
    
    // Run both fetch operations
    fetchLeads();
    fetchLeadCounts();
  }, []);
  
  // Navigate to previous or next lead
  const navigateLeads = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentLeadIndex > 0) {
      setCurrentLeadIndex(prev => prev - 1);
    } else if (direction === 'next' && currentLeadIndex < filteredLeads.length - 1) {
      setCurrentLeadIndex(prev => prev + 1);
    }
  };
  
  // Get current lead count for a specific status
  const getLeadCount = (status: LeadStatus) => {
    switch (status) {
      case 'warm_lead':
        return counts.warmLeadCount;
      case 'message_sent':
        return counts.messageSentCount;
      case 'sale_closed':
        return counts.saleClosedCount;
      default:
        return 0;
    }
  };
  
  // Helper to get the current warm lead
  const getCurrentWarmLead = () => {
    if (filteredLeads.length === 0 || currentLeadIndex >= filteredLeads.length) {
      return null;
    }
    return filteredLeads[currentLeadIndex];
  };
  
  // Format large numbers with commas
  const formatNumber = (num?: number) => {
    return num?.toLocaleString() || "0";
  };
  
  // Format date to be more readable
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };
  
  // Prevent counter from briefly showing 0 during refresh
  const getDisplayMessageCount = () => {
    return counts.dailyMessagesSent || dailyMessagesSent || 0;
  };
  
  // Get total messages sent for lifetime stats
  const getTotalMessageCount = () => {
    return counts.totalMessagesSent || totalMessagesSent || 0;
  };
  
  // Calculate daily reachout progress (75 per day goal)
  const getDailyProgress = () => {
    // Use dailyMessagesSent for accurate daily tracking
    const messageCount = counts.dailyMessagesSent || dailyMessagesSent || 0;
    return {
      total: 75,
      current: messageCount > 75 ? 75 : messageCount,
      percentage: Math.min(100, Math.round((messageCount / 75) * 100))
    };
  };
  
  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] p-1">
          <div className="bg-white dark:bg-gray-950 p-5">
            <CardHeader className="pb-4 px-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] inline-block text-transparent bg-clip-text">
                    <span className="flex items-center">
                      <Instagram className="h-6 w-6 mr-3 text-[#E1306C]" />
                      Instagram Lead Pipeline
                    </span>
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 mt-2 ml-1">
                    Manage and track your Instagram warm leads through your sales pipeline
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh} 
                    disabled={isLoading}
                    className="border border-gray-200 hover:bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:text-white transition-all duration-300"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Pipeline Stats */}
              <div className="px-6 pb-5 border-b border-gray-100">
                <div className="grid grid-cols-1 gap-4">
                  {/* Stats Cards in a Beautiful Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    {/* Total Messages Sent - Premium Gradient Design */}
                    <div className="relative p-6 rounded-xl bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mt-16 -mr-16 opacity-40 group-hover:scale-110 transition-all duration-300"></div>
                      <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-2">
                          <h3 className="text-base font-semibold text-gray-800">Total Outreach Messages</h3>
                          <p className="text-sm text-gray-500">Lifetime performance</p>
                        </div>
                        <div className="flex items-center">
                          <div className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 flex items-center justify-center mr-3 shadow-md">
                            <MessageSquare className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-500 text-transparent bg-clip-text">{getDisplayMessageCount()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Daily Reachout Progress - Modern Design with Animation */}
                    <div className="relative p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mt-16 -mr-16 opacity-40 group-hover:scale-110 transition-all duration-300"></div>
                      <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="space-y-2">
                          <h3 className="text-base font-semibold text-gray-800">Daily Outreach Progress</h3>
                          <p className="text-sm text-gray-500">Goal: 75 leads per day</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">{getDailyProgress().current}</span>
                          <span className="text-gray-500 text-lg">/{getDailyProgress().total}</span>
                          <p className="text-sm font-medium text-blue-600">({getDailyProgress().percentage}%)</p>
                        </div>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden relative group-hover:bg-blue-200 transition-all duration-300">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-700 ease-in-out"
                          style={{ width: `${getDailyProgress().percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Lead Status Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-100 relative overflow-hidden group hover:shadow-sm transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-200 rounded-full -mt-12 -mr-12 opacity-20 group-hover:scale-110 transition-all duration-300"></div>
                      <div className="flex flex-col items-center relative z-10">
                        <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 mb-2">Warm Leads</Badge>
                        <span className="text-2xl font-bold text-pink-600">{getLeadCount('warm_lead')}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-100 relative overflow-hidden group hover:shadow-sm transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-violet-200 rounded-full -mt-12 -mr-12 opacity-20 group-hover:scale-110 transition-all duration-300"></div>
                      <div className="flex flex-col items-center relative z-10">
                        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-200 mb-2">Message Sent</Badge>
                        <span className="text-2xl font-bold text-violet-600">{getLeadCount('message_sent')}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-100 relative overflow-hidden group hover:shadow-sm transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200 rounded-full -mt-12 -mr-12 opacity-20 group-hover:scale-110 transition-all duration-300"></div>
                      <div className="flex flex-col items-center relative z-10">
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 mb-2">Sale Closed</Badge>
                        <span className="text-2xl font-bold text-emerald-600">{getLeadCount('sale_closed')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pipeline Management Tabs */}
              <Tabs defaultValue="warm_lead" value={activeTab} onValueChange={(value) => filterLeadsByStatus(value as LeadStatus)} className="w-full">
                <div className="px-6 py-3 border-b border-gray-100">
                  <TabsList className="bg-gray-100/70 p-1 rounded-lg grid grid-cols-3 gap-1">
                    <TabsTrigger value="warm_lead" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#833AB4] data-[state=active]:to-[#FD1D1D] data-[state=active]:text-white">
                      Warm Leads
                      <Badge variant="outline" className="ml-2 bg-white/20">{getLeadCount('warm_lead')}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="message_sent" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#833AB4] data-[state=active]:to-[#FD1D1D] data-[state=active]:text-white">
                      Messages Sent
                      <Badge variant="outline" className="ml-2 bg-white/20">{getLeadCount('message_sent')}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="sale_closed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#833AB4] data-[state=active]:to-[#FD1D1D] data-[state=active]:text-white">
                      Sales Closed
                      <Badge variant="outline" className="ml-2 bg-white/20">{getLeadCount('sale_closed')}</Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Warm Leads Tab */}
                <TabsContent value="warm_lead" className="p-0">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 m-6 rounded-lg flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      {error}
                    </div>
                  )}
                  
                  {/* Lead Workspace - Where you work with the current lead */}
                  {filteredLeads.length > 0 && (
                    <div className="p-6 border-b border-gray-100">
                      <div className="grid grid-cols-3 gap-6">
                        {/* Lead Profile Card */}
                        <div className="col-span-1 rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="flex flex-col items-center text-center">
                            {getCurrentWarmLead()?.profilePictureUrl ? (
                              <Avatar className="h-24 w-24 mb-4 border-2 border-pink-200">
                                <AvatarImage 
                                  src={getCurrentWarmLead()?.profilePictureUrl} 
                                  alt={getCurrentWarmLead()?.fullName} 
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] text-white text-lg">
                                  {getCurrentWarmLead()?.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <Avatar className="h-24 w-24 mb-4 border-2 border-pink-200">
                                <AvatarFallback className="bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] text-white text-lg">
                                  {getCurrentWarmLead()?.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {getCurrentWarmLead()?.fullName}
                              {getCurrentWarmLead()?.isVerified && (
                                <span className="inline-flex items-center ml-1 text-blue-500">
                                  <CheckCircle className="h-4 w-4" />
                                </span>
                              )}
                            </h3>
                            <p className="text-gray-500 mb-3">@{getCurrentWarmLead()?.username}</p>
                            
                            <div className="flex items-center justify-center space-x-3 mb-4 text-sm">
                              <div className="flex flex-col items-center">
                                <span className="font-semibold text-gray-800">{formatNumber(getCurrentWarmLead()?.followers)}</span>
                                <span className="text-gray-500 text-xs">Followers</span>
                              </div>
                              <div className="h-8 w-px bg-gray-200"></div>
                              <div className="flex flex-col items-center">
                                <span className="font-semibold text-gray-800">{formatNumber(getCurrentWarmLead()?.following)}</span>
                                <span className="text-gray-500 text-xs">Following</span>
                              </div>
                            </div>
                            
                            <div className="w-full">
                              <a 
                                href={getCurrentWarmLead()?.profileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Profile
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        {/* Message/Notes Area */}
                        <div className="col-span-2 space-y-4">
                          <div className="bg-gradient-to-r from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#FCAF45]/10 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-2">Lead Notes</h3>
                            <Textarea 
                              placeholder="Add notes about this lead (optional)..."
                              className="w-full bg-white border-gray-200 focus:border-pink-300 focus:ring-pink-300"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              rows={4}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigateLeads('prev')} 
                                disabled={currentLeadIndex === 0 || isLoading}
                                className="border border-gray-200 hover:border-pink-300"
                              >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigateLeads('next')} 
                                disabled={currentLeadIndex >= filteredLeads.length - 1 || isLoading}
                                className="border border-gray-200 hover:border-pink-300"
                              >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                              <span className="text-sm text-gray-500">
                                {filteredLeads.length > 0 ? `${currentLeadIndex + 1} of ${filteredLeads.length}` : '0 of 0'}
                              </span>
                            </div>
                            
                            <div>
                              <Button 
                                disabled={isLoading || !getCurrentWarmLead()} 
                                onClick={() => getCurrentWarmLead() && handleMarkMessageSent(getCurrentWarmLead()!.id)}
                                className="bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] hover:from-[#833AB4]/90 hover:to-[#FD1D1D]/90 text-white shadow-md"
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Mark Message Sent
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Leads Table */}
                  {filteredLeads.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left">Profile</th>
                            <th className="px-6 py-3 text-left">Followers</th>
                            <th className="px-6 py-3 text-left">Date Added</th>
                            <th className="px-6 py-3 text-left">Last Updated</th>
                            <th className="px-6 py-3 text-left">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredLeads.map((lead) => (
                            <tr 
                              key={lead.id} 
                              className={`hover:bg-gray-50 ${lead.id === getCurrentWarmLead()?.id ? 'bg-pink-50' : ''}`}
                              onClick={() => setCurrentLeadIndex(filteredLeads.findIndex(l => l.id === lead.id))}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Avatar className="h-10 w-10 mr-3">
                                    {lead.profilePictureUrl && lead.profilePictureUrl !== "" ? (
                                      <AvatarImage 
                                        src={lead.profilePictureUrl} 
                                        alt={lead.fullName} 
                                        className="object-cover"
                                      />
                                    ) : (
                                      <AvatarFallback className="bg-green-50 text-green-600">
                                        {lead.username.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-gray-900">{lead.fullName}</div>
                                    <div className="text-gray-500 text-sm">@{lead.username}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatNumber(lead.followers)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lead.dateAdded}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lead.lastUpdated}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                                {lead.notes || "No notes"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-gray-50">
                        <User className="h-10 w-10 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No warm leads found</h3>
                        <p className="text-gray-500 mb-4">All your warm leads will appear here.</p>
                        <Button 
                          onClick={handleRefresh} 
                          variant="outline" 
                          className="border border-gray-200 hover:bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:text-white transition-all duration-300"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                {/* Messages Sent Tab - Shows leads that have been messaged */}
                <TabsContent value="message_sent" className="p-0">
                  {filteredLeads.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left">Profile</th>
                            <th className="px-6 py-3 text-left">Followers</th>
                            <th className="px-6 py-3 text-left">Message Date</th>
                            <th className="px-6 py-3 text-left">Notes</th>
                            <th className="px-6 py-3 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Avatar className="h-10 w-10 mr-3">
                                    {lead.profilePictureUrl && lead.profilePictureUrl !== "" ? (
                                      <AvatarImage 
                                        src={lead.profilePictureUrl} 
                                        alt={lead.fullName} 
                                        className="object-cover"
                                      />
                                    ) : (
                                      <AvatarFallback className="bg-violet-50 text-violet-600">
                                        {lead.username.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-gray-900">{lead.fullName}</div>
                                    <div className="text-gray-500 text-sm">@{lead.username}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatNumber(lead.followers)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lead.lastUpdated}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-[300px] truncate">
                                {lead.notes || "No notes"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <Button
                                  size="sm"
                                  onClick={() => handleCloseSale(lead.id)}
                                  className="bg-gradient-to-r from-[#FCAF45] to-[#FD1D1D] hover:from-[#FCAF45]/90 hover:to-[#FD1D1D]/90 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Close Sale
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-gray-50">
                        <MessageSquare className="h-10 w-10 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No leads with messages sent</h3>
                        <p className="text-gray-500 mb-4">Leads you've sent messages to will appear here.</p>
                        <Button 
                          onClick={handleRefresh} 
                          variant="outline" 
                          className="border border-gray-200 hover:bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:text-white transition-all duration-300"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                {/* Sales Closed Tab - Shows leads where sales have been closed */}
                <TabsContent value="sale_closed" className="p-0">
                  {filteredLeads.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left">Profile</th>
                            <th className="px-6 py-3 text-left">Followers</th>
                            <th className="px-6 py-3 text-left">Sale Date</th>
                            <th className="px-6 py-3 text-left">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Avatar className="h-10 w-10 mr-3">
                                    {lead.profilePictureUrl && lead.profilePictureUrl !== "" ? (
                                      <AvatarImage 
                                        src={lead.profilePictureUrl} 
                                        alt={lead.fullName} 
                                        className="object-cover"
                                      />
                                    ) : (
                                      <AvatarFallback className="bg-green-50 text-green-600">
                                        {lead.username.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-gray-900">{lead.fullName}</div>
                                    <div className="text-gray-500 text-sm">@{lead.username}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatNumber(lead.followers)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lead.lastUpdated}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                                {lead.notes || "No notes"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-gray-50">
                        <CheckCircle className="h-10 w-10 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No closed sales yet</h3>
                        <p className="text-gray-500 mb-4">Leads with closed sales will appear here.</p>
                        <Button 
                          onClick={handleRefresh} 
                          variant="outline" 
                          className="border border-gray-200 hover:bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:text-white transition-all duration-300"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}