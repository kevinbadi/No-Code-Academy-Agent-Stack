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

export default function InstagramLeadPipeline() {
  const [activeTab, setActiveTab] = useState<LeadStatus>("warm_lead");
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<InstagramLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<InstagramLead[]>([]);
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [noteText, setNoteText] = useState("");
  
  // Sample data - in a real app this would come from your API
  useEffect(() => {
    // Simulating an API call to fetch leads
    setIsLoading(true);
    setTimeout(() => {
      const sampleLeads: InstagramLead[] = [
        {
          id: 1,
          username: "tonda.thr",
          fullName: "𝓐𝓷𝓽𝓸𝓲𝓷𝓮",
          profileUrl: "https://instagram.com/tonda.thr",
          profilePictureUrl: "https://scontent-cdg4-3.cdninstagram.com/v/t51.2885-19/475231190_1110025517526822_5889129386798833630_n.jpg",
          instagramID: "48999683829",
          isVerified: false,
          followers: 2345,
          following: 567,
          bio: "Business owner with passion for tech and innovation. Looking for new solutions to scale my business.",
          status: "warm_lead",
          dateAdded: "2025-05-22",
          lastUpdated: "2025-05-22",
          tags: ["tech", "business", "entrepreneur"]
        },
        {
          id: 2,
          username: "sarahj.design",
          fullName: "Sarah Johnson",
          profileUrl: "https://instagram.com/sarahj.design",
          profilePictureUrl: "",
          instagramID: "38761592847",
          isVerified: true,
          followers: 12800,
          following: 432,
          bio: "UI/UX Designer • Digital Creative • Startup Advisor. Currently seeking new tools for my design business.",
          status: "warm_lead",
          dateAdded: "2025-05-21",
          lastUpdated: "2025-05-21",
          tags: ["design", "creative", "startup"]
        },
        {
          id: 3,
          username: "techstartupguru",
          fullName: "Michael Chen",
          profileUrl: "https://instagram.com/techstartupguru",
          profilePictureUrl: "",
          instagramID: "29384756123",
          isVerified: false,
          followers: 5600,
          following: 890,
          bio: "Helping startups scale | Angel Investor | 3x Founder. Always looking for innovative solutions.",
          status: "message_sent",
          dateAdded: "2025-05-20",
          lastUpdated: "2025-05-22",
          notes: "Interested in our enterprise solution, follow up next week",
          tags: ["investor", "founder", "tech"]
        },
        {
          id: 4,
          username: "digital.nomad.ceo",
          fullName: "Alex Rivera",
          profileUrl: "https://instagram.com/digital.nomad.ceo",
          profilePictureUrl: "",
          instagramID: "92837465123",
          isVerified: false,
          followers: 34500,
          following: 1200,
          bio: "Building businesses while traveling the world 🌍. Need remote tools that scale with my lifestyle.",
          status: "message_sent",
          dateAdded: "2025-05-18",
          lastUpdated: "2025-05-21",
          notes: "Scheduled a demo call for next Tuesday",
          tags: ["digital nomad", "entrepreneur", "travel"]
        },
        {
          id: 5,
          username: "ecommerce.expert",
          fullName: "Emma Thompson",
          profileUrl: "https://instagram.com/ecommerce.expert",
          profilePictureUrl: "",
          instagramID: "12345987654",
          isVerified: true,
          followers: 78600,
          following: 526,
          bio: "E-commerce consultant • Helping brands scale online. Looking for tools to recommend to my clients.",
          status: "sale_closed",
          dateAdded: "2025-05-15",
          lastUpdated: "2025-05-23",
          notes: "Purchased premium package, extremely satisfied with onboarding",
          tags: ["ecommerce", "retail", "marketing"]
        },
        {
          id: 6,
          username: "startup.founder",
          fullName: "David Miller",
          profileUrl: "https://instagram.com/startup.founder",
          profilePictureUrl: "",
          instagramID: "56723418965",
          isVerified: false,
          followers: 3200,
          following: 945,
          bio: "Building the future of fintech | YC W24. Needs scalable solutions for our growing team.",
          status: "sale_closed",
          dateAdded: "2025-05-14",
          lastUpdated: "2025-05-20",
          notes: "Signed annual contract, interested in API integration",
          tags: ["fintech", "YCombinator", "startup"]
        },
        {
          id: 7,
          username: "growth.marketer",
          fullName: "Sophia Rodriguez",
          profileUrl: "https://instagram.com/growth.marketer",
          profilePictureUrl: "",
          instagramID: "34567891234",
          isVerified: false,
          followers: 8900,
          following: 1100,
          bio: "Growth marketing specialist for B2B SaaS. Looking for advanced analytics to boost my client work.",
          status: "warm_lead",
          dateAdded: "2025-05-23",
          lastUpdated: "2025-05-23",
          tags: ["marketing", "B2B", "SaaS"]
        }
      ];
      
      setLeads(sampleLeads);
      filterLeadsByStatus("warm_lead");
      setIsLoading(false);
    }, 500);
  }, []);
  
  // Filter leads based on current tab
  const filterLeadsByStatus = (status: LeadStatus) => {
    setActiveTab(status);
    const filtered = leads.filter(lead => lead.status === status);
    setFilteredLeads(filtered);
    setCurrentLeadIndex(0); // Reset to first lead when changing tabs
  };
  
  // Handle refreshing lead data
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      filterLeadsByStatus(activeTab);
      setIsLoading(false);
    }, 500);
  };
  
  // Handle marking a lead as "Message Sent" - updates DB and moves lead to message_sent table
  const handleMarkMessageSent = async (leadId: number) => {
    setIsLoading(true);
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
      
      // Fetch new warm leads from the database to ensure we always have fresh leads
      try {
        const newLeadsResponse = await fetch('/api/instagram-leads?status=warm_lead');
        if (newLeadsResponse.ok) {
          const newLeads = await newLeadsResponse.json();
          
          // Merge the new leads with our existing leads (replacing the warm leads section)
          setLeads(prevLeads => {
            // Keep leads that aren't warm leads
            const nonWarmLeads = prevLeads.filter(lead => lead.status !== 'warm_lead');
            // Add the new warm leads
            return [...nonWarmLeads, ...newLeads];
          });
          
          // Reset to the first lead in the warm leads view
          setCurrentLeadIndex(0);
        }
      } catch (fetchError) {
        console.error('Error fetching new warm leads:', fetchError);
      }
      
      // Clear the note text
      setNoteText("");
      
    } catch (error) {
      console.error('Error updating lead status:', error);
      // You could add toast notification here
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle closing a sale - updates DB and moves lead to sale_closed table
  const handleCloseSale = async (leadId: number) => {
    setIsLoading(true);
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
      
      // Refresh the filtered leads after status change
      filterLeadsByStatus("message_sent");
      
    } catch (error) {
      console.error('Error updating lead status:', error);
      // You could add toast notification here
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigate to previous or next lead
  const navigateLeads = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentLeadIndex > 0) {
      setCurrentLeadIndex(prev => prev - 1);
    } else if (direction === 'next' && currentLeadIndex < filteredLeads.length - 1) {
      setCurrentLeadIndex(prev => prev + 1);
    }
  };
  
  // Lead count badges
  const getLeadCount = (status: LeadStatus) => {
    return leads.filter(lead => lead.status === status).length;
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
            
            {/* WARM LEADS - Show one by one */}
            <TabsContent value="warm_lead" className="pt-0 pb-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E1306C]"></div>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-16 w-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-[#E1306C]" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No warm leads found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Your agent is searching for new potential leads.
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  {/* Lead navigation */}
                  <div className="flex justify-between items-center mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigateLeads('prev')}
                      disabled={currentLeadIndex === 0}
                      className="w-24"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    
                    <span className="text-sm text-gray-500">
                      Lead {currentLeadIndex + 1} of {filteredLeads.length}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigateLeads('next')}
                      disabled={currentLeadIndex === filteredLeads.length - 1}
                      className="w-24"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  
                  {/* Current warm lead details */}
                  {getCurrentWarmLead() && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Lead profile information */}
                      <div className="md:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                          <Avatar className="h-16 w-16 border-2 border-white shadow-md mr-4">
                            <AvatarImage src={getCurrentWarmLead().profilePictureUrl} alt={getCurrentWarmLead().username} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-[#E1306C] text-white text-xl">
                              {getCurrentWarmLead().fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-lg font-bold text-gray-900">{getCurrentWarmLead().fullName}</h3>
                              {getCurrentWarmLead().isVerified && (
                                <Badge variant="outline" className="ml-2 text-[#E1306C] border-[#E1306C]">Verified</Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center text-gray-500 text-sm mt-1">
                              <span>@{getCurrentWarmLead().username}</span>
                              <a 
                                href={getCurrentWarmLead().profileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-3 text-[#E1306C] hover:text-pink-700 inline-flex items-center"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Profile
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="border border-gray-100 rounded-md p-3 bg-gray-50">
                            <div className="text-xs text-gray-500 mb-1">Followers</div>
                            <div className="text-lg font-semibold">{formatNumber(getCurrentWarmLead().followers)}</div>
                          </div>
                          
                          <div className="border border-gray-100 rounded-md p-3 bg-gray-50">
                            <div className="text-xs text-gray-500 mb-1">Following</div>
                            <div className="text-lg font-semibold">{formatNumber(getCurrentWarmLead().following)}</div>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Bio</h4>
                          <p className="text-base text-gray-700 p-3 bg-gray-50 rounded-md border border-gray-100">
                            {getCurrentWarmLead().bio || "No bio available"}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {getCurrentWarmLead().tags?.map((tag, i) => (
                              <span key={i} className="px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action panel */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lead Actions</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Add Note
                            </label>
                            <Textarea 
                              placeholder="Add details about your interaction with this lead..." 
                              className="w-full h-32 resize-none"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                            />
                          </div>
                          
                          <Button 
                            className="w-full bg-gradient-to-r from-[#FCAF45] to-[#E1306C] hover:opacity-90 text-white"
                            onClick={() => handleMarkMessageSent(getCurrentWarmLead().id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1.5" />
                            Message Sent
                          </Button>
                          
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-1.5" />
                            Open in Instagram
                          </Button>
                          
                          <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-600">
                            <p className="font-medium mb-1">Lead added on:</p>
                            <p>{getCurrentWarmLead().dateAdded}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* MESSAGE SENT - Table View */}
            <TabsContent value="message_sent" className="pt-0 pb-0">
              <div className="px-6 py-4">
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5851DB]"></div>
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-16 w-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-[#5851DB]" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No messaged leads</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Leads will appear here after you've sent them messages.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs font-medium text-gray-500 border-b border-gray-200">
                          <th className="px-4 py-3 text-left">Lead</th>
                          <th className="px-4 py-3 text-center">Followers</th>
                          <th className="px-4 py-3 text-center">Messaged On</th>
                          <th className="px-4 py-3 text-left">Notes</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-3">
                                  <AvatarImage src={lead.profilePictureUrl} alt={lead.username} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-[#5851DB] text-white">
                                    {lead.fullName.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900">{lead.fullName}</div>
                                  <div className="text-xs text-gray-500">@{lead.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">{formatNumber(lead.followers)}</td>
                            <td className="px-4 py-4 text-center">{lead.lastUpdated}</td>
                            <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                              {lead.notes || "No notes"}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Button 
                                size="sm"
                                className="bg-gradient-to-r from-[#5851DB] to-[#833AB4] hover:opacity-90 text-white"
                                onClick={() => handleCloseSale(lead.id)}
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Close Sale
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* SALE CLOSED - Table View */}
            <TabsContent value="sale_closed" className="pt-0 pb-0">
              <div className="px-6 py-4">
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No closed sales yet</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Complete the sales process to move leads to this stage.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs font-medium text-gray-500 border-b border-gray-200">
                          <th className="px-4 py-3 text-left">Lead</th>
                          <th className="px-4 py-3 text-center">Followers</th>
                          <th className="px-4 py-3 text-center">Sale Date</th>
                          <th className="px-4 py-3 text-left">Notes</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-3">
                                  <AvatarImage src={lead.profilePictureUrl} alt={lead.username} />
                                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                                    {lead.fullName.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900">{lead.fullName}</div>
                                  <div className="text-xs text-gray-500">@{lead.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">{formatNumber(lead.followers)}</td>
                            <td className="px-4 py-4 text-center">{lead.lastUpdated}</td>
                            <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                              {lead.notes || "No notes"}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completed
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}