import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Instagram, 
  RefreshCw, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  Search, 
  User, 
  ExternalLink,
  Filter,
  ListFilter,
  Clock,
  DollarSign,
  Calendar,
  ArrowRightCircle,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ThumbsUp
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
  const [counts, setCounts] = useState<LeadCounts>({
    warmLeadCount: 0,
    messageSentCount: 0,
    saleClosedCount: 0,
    totalCount: 0
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
          setCounts({
            warmLeadCount: countsData.warmLeadCount || 0,
            messageSentCount: countsData.messageSentCount || 0,
            saleClosedCount: countsData.saleClosedCount || 0,
            totalCount: countsData.totalCount || 0
          });
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
              lastUpdated: new Date().toISOString().split('T')[0],
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
          totalCount: countsData.totalCount || 0
        });
      }
      
      // Clear the note text
      setNoteText("");
      
      // Refresh the filtered leads
      filterLeadsByStatus("warm_lead");
      
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
              lastUpdated: new Date().toISOString().split('T')[0],
              notes: noteText.trim() || lead.notes
            };
          }
          return lead;
        })
      );
      
      // Update counts
      const countsResponse = await fetch('/api/instagram-leads/counts');
      if (countsResponse.ok) {
        const countsData = await countsResponse.json();
        setCounts({
          warmLeadCount: countsData.warmLeadCount || 0,
          messageSentCount: countsData.messageSentCount || 0,
          saleClosedCount: countsData.saleClosedCount || 0,
          totalCount: countsData.totalCount || 0
        });
      }
      
      // Clear note text
      setNoteText("");
      
      // Refresh the filtered leads after status change
      filterLeadsByStatus("message_sent");
      
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
            totalCount: countsData.totalCount || 0
          });
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
    return filteredLeads[currentLeadIndex];
  };
  
  // Format large numbers with commas
  const formatNumber = (num?: number) => {
    return num?.toLocaleString() || 0;
  };
  
  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <Card className="shadow-sm border border-gray-100">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-gray-800">
                <span className="flex items-center">
                  <Instagram className="h-5 w-5 mr-2 text-[#E1306C]" />
                  Instagram Lead Pipeline
                </span>
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                Manage and track your Instagram warm leads through your sales pipeline
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Pipeline Stats */}
          <div className="px-6 pb-5 border-b border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-pink-50 border border-pink-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Warm Leads</p>
                    <p className="text-2xl font-bold text-[#E1306C]">{getLeadCount("warm_lead")}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <Search className="h-5 w-5 text-[#E1306C]" />
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Message Sent</p>
                    <p className="text-2xl font-bold text-[#5851DB]">{getLeadCount("message_sent")}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-[#5851DB]" />
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sales Closed</p>
                    <p className="text-2xl font-bold text-green-600">{getLeadCount("sale_closed")}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lead Management Tabs */}
          <Tabs defaultValue="warm_lead" value={activeTab} onValueChange={(value) => filterLeadsByStatus(value as LeadStatus)}>
            <div className="px-6 py-4 border-b border-gray-100">
              <TabsList className="grid grid-cols-3 gap-4">
                <TabsTrigger value="warm_lead" className="flex items-center">
                  <Search className="h-4 w-4 mr-1.5" />
                  Warm Leads
                  <Badge className="ml-2 bg-pink-100 text-[#E1306C] hover:bg-pink-100">
                    {getLeadCount("warm_lead")}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="message_sent" className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Message Sent
                  <Badge className="ml-2 bg-purple-100 text-[#5851DB] hover:bg-purple-100">
                    {getLeadCount("message_sent")}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="sale_closed" className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Sale Closed
                  <Badge className="ml-2 bg-green-100 text-green-600 hover:bg-green-100">
                    {getLeadCount("sale_closed")}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="p-8 flex flex-col items-center justify-center">
                <RefreshCw className="h-10 w-10 text-gray-400 animate-spin mb-4" />
                <p className="text-gray-500">Loading Instagram leads...</p>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="p-8 flex flex-col items-center justify-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                <p className="text-red-500 font-medium mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  Retry
                </Button>
              </div>
            )}
            
            {/* Empty State */}
            {!isLoading && !error && filteredLeads.length === 0 && (
              <div className="p-8 flex flex-col items-center justify-center">
                <User className="h-10 w-10 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No {activeTab.replace('_', ' ')} leads found</p>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  Refresh
                </Button>
              </div>
            )}
            
            {/* Warm Leads Tab - Card View */}
            <TabsContent value="warm_lead" className="p-0">
              {!isLoading && !error && filteredLeads.length > 0 && (
                <div className="px-6 py-4">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    {/* Lead Navigation */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateLeads('prev')}
                        disabled={currentLeadIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm text-gray-500">
                        Lead {currentLeadIndex + 1} of {filteredLeads.length}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigateLeads('next')}
                        disabled={currentLeadIndex === filteredLeads.length - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    
                    {/* Current Lead Card */}
                    {getCurrentWarmLead() && (
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Lead Avatar */}
                          <Avatar className="h-16 w-16 rounded-full border-2 border-pink-100">
                            {getCurrentWarmLead().profilePictureUrl ? (
                              <AvatarImage src={getCurrentWarmLead().profilePictureUrl} />
                            ) : (
                              <AvatarFallback className="bg-pink-50 text-[#E1306C] text-lg">
                                {getCurrentWarmLead().username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          
                          {/* Lead Details */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{getCurrentWarmLead().fullName}</h3>
                              {getCurrentWarmLead().isVerified && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center text-gray-500 mb-3">
                              <span className="text-sm">@{getCurrentWarmLead().username}</span>
                              <a 
                                href={getCurrentWarmLead().profileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center text-pink-500 hover:text-pink-600 text-sm ml-2"
                              >
                                View Profile <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                            
                            <p className="text-gray-700 mb-4">{getCurrentWarmLead().bio}</p>
                            
                            {/* Lead Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="bg-gray-50 rounded p-2 text-center">
                                <span className="block text-sm text-gray-500">Followers</span>
                                <span className="font-semibold">{formatNumber(getCurrentWarmLead().followers)}</span>
                              </div>
                              <div className="bg-gray-50 rounded p-2 text-center">
                                <span className="block text-sm text-gray-500">Following</span>
                                <span className="font-semibold">{formatNumber(getCurrentWarmLead().following)}</span>
                              </div>
                              <div className="bg-gray-50 rounded p-2 text-center">
                                <span className="block text-sm text-gray-500">Added</span>
                                <span className="font-semibold">{getCurrentWarmLead().dateAdded}</span>
                              </div>
                            </div>
                            
                            {/* Lead Tags */}
                            {getCurrentWarmLead().tags && getCurrentWarmLead().tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {getCurrentWarmLead().tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="bg-gray-100">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {/* Action Form */}
                            <div className="mt-4">
                              <Textarea
                                placeholder="Add notes about this lead (optional)"
                                className="min-h-[80px] mb-3"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                              />
                              <Button 
                                className="w-full bg-[#5851DB] hover:bg-[#4c46c3]"
                                onClick={() => handleMarkMessageSent(getCurrentWarmLead().id)}
                                disabled={isLoading}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Mark Message Sent
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Message Sent Tab - Table View */}
            <TabsContent value="message_sent" className="p-0">
              {!isLoading && !error && filteredLeads.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 rounded-full mr-3">
                                {lead.profilePictureUrl ? (
                                  <AvatarImage src={lead.profilePictureUrl} />
                                ) : (
                                  <AvatarFallback className="bg-purple-50 text-[#5851DB]">
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
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                            {lead.notes || "No notes"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600 hover:text-green-800"
                              onClick={() => {
                                setNoteText(lead.notes || "");
                                handleCloseSale(lead.id);
                              }}
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
              )}
            </TabsContent>
            
            {/* Sale Closed Tab - Table View */}
            <TabsContent value="sale_closed" className="p-0">
              {!isLoading && !error && filteredLeads.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Closed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="bg-green-50 bg-opacity-30">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 rounded-full mr-3">
                                {lead.profilePictureUrl ? (
                                  <AvatarImage src={lead.profilePictureUrl} />
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}