import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  AlertCircle
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

export default function InstagramLeadCRM() {
  const [activeTab, setActiveTab] = useState<LeadStatus>("warm_lead");
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<InstagramLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<InstagramLead[]>([]);
  
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
          bio: "Business owner with passion for tech and innovation",
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
          bio: "UI/UX Designer • Digital Creative • Startup Advisor",
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
          bio: "Helping startups scale | Angel Investor | 3x Founder",
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
          bio: "Building businesses while traveling the world 🌍",
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
          bio: "E-commerce consultant • Helping brands scale online",
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
          bio: "Building the future of fintech | YC W24",
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
          bio: "Growth marketing specialist for B2B SaaS",
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
    setFilteredLeads(leads.filter(lead => lead.status === status));
  };
  
  // Handle refreshing lead data
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      filterLeadsByStatus(activeTab);
      setIsLoading(false);
    }, 500);
  };
  
  // Handle moving a lead to the next stage
  const handleAdvanceLead = (leadId: number) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => {
        if (lead.id === leadId) {
          const newStatus = lead.status === "warm_lead" 
            ? "message_sent" 
            : lead.status === "message_sent" 
              ? "sale_closed" 
              : lead.status;
          
          return {
            ...lead,
            status: newStatus,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return lead;
      })
    );
    
    // Update filtered leads to reflect changes
    filterLeadsByStatus(activeTab);
  };
  
  // Lead count badges
  const getLeadCount = (status: LeadStatus) => {
    return leads.filter(lead => lead.status === status).length;
  };
  
  // Actions based on lead status
  const getActionButton = (lead: InstagramLead) => {
    switch (lead.status) {
      case "warm_lead":
        return (
          <Button 
            onClick={() => handleAdvanceLead(lead.id)}
            className="bg-gradient-to-r from-[#FCAF45] to-[#E1306C] hover:opacity-90"
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Message Sent
          </Button>
        );
      case "message_sent":
        return (
          <Button 
            onClick={() => handleAdvanceLead(lead.id)}
            className="bg-gradient-to-r from-[#5851DB] to-[#833AB4] hover:opacity-90"
            size="sm"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Close Sale
          </Button>
        );
      case "sale_closed":
        return (
          <Button 
            className="bg-green-600 hover:bg-green-700"
            size="sm"
            disabled
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Sale Closed
          </Button>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* CRM Overview */}
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
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
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
            
            <TabsContent value="warm_lead" className="pt-0 pb-0">
              <div className="divide-y divide-gray-100">
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
                  filteredLeads.map((lead) => (
                    <div key={lead.id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarImage src={lead.profilePictureUrl} alt={lead.username} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-[#E1306C] text-white">
                            {lead.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{lead.fullName}</span>
                            {lead.isVerified && (
                              <Badge variant="outline" className="ml-2 text-[#E1306C] border-[#E1306C]">Verified</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <span>@{lead.username}</span>
                            <a 
                              href={lead.profileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-[#E1306C] hover:text-pink-700 inline-flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Profile
                            </a>
                          </div>
                          
                          {lead.bio && (
                            <p className="text-sm text-gray-600 mt-1">{lead.bio}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {lead.tags?.map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 ml-auto mt-3 md:mt-0">
                          <div className="flex flex-col items-end">
                            <div className="text-xs text-gray-500">Followers</div>
                            <div className="font-medium">{lead.followers?.toLocaleString()}</div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <div className="text-xs text-gray-500">Added</div>
                            <div className="font-medium">{lead.dateAdded}</div>
                          </div>
                          
                          {getActionButton(lead)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="message_sent" className="pt-0 pb-0">
              <div className="divide-y divide-gray-100">
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
                      Move leads to this stage after sending them a message.
                    </p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <div key={lead.id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarImage src={lead.profilePictureUrl} alt={lead.username} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-[#5851DB] text-white">
                            {lead.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{lead.fullName}</span>
                            {lead.isVerified && (
                              <Badge variant="outline" className="ml-2 text-[#5851DB] border-[#5851DB]">Verified</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <span>@{lead.username}</span>
                            <a 
                              href={lead.profileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-[#5851DB] hover:text-purple-700 inline-flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Profile
                            </a>
                          </div>
                          
                          {lead.notes && (
                            <p className="text-sm text-gray-600 mt-1">{lead.notes}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {lead.tags?.map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 ml-auto mt-3 md:mt-0">
                          <div className="flex flex-col items-end">
                            <div className="text-xs text-gray-500">Updated</div>
                            <div className="font-medium">{lead.lastUpdated}</div>
                          </div>
                          
                          {getActionButton(lead)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="sale_closed" className="pt-0 pb-0">
              <div className="divide-y divide-gray-100">
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
                      When you close deals with leads, they'll appear here.
                    </p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <div key={lead.id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarImage src={lead.profilePictureUrl} alt={lead.username} />
                          <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                            {lead.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{lead.fullName}</span>
                            {lead.isVerified && (
                              <Badge variant="outline" className="ml-2 text-green-600 border-green-600">Verified</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <span>@{lead.username}</span>
                            <a 
                              href={lead.profileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-green-600 hover:text-green-700 inline-flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Profile
                            </a>
                          </div>
                          
                          {lead.notes && (
                            <p className="text-sm text-gray-600 mt-1">{lead.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 ml-auto mt-3 md:mt-0">
                          <div className="flex flex-col items-end">
                            <div className="text-xs text-gray-500">Closed on</div>
                            <div className="font-medium">{lead.lastUpdated}</div>
                          </div>
                          
                          {getActionButton(lead)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export Leads
          </Button>
          
          <Button variant="outline" size="sm">
            <ListFilter className="h-4 w-4 mr-1" />
            Advanced Filters
          </Button>
        </div>
        
        <div>
          <Button className="bg-gradient-to-r from-[#FCAF45] to-[#E1306C] hover:opacity-90">
            <Instagram className="h-4 w-4 mr-1" />
            Find New Leads
          </Button>
        </div>
      </div>
    </div>
  );
}