import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  User, Users, Mail, Calendar, 
  FileText, BarChart3, PieChart,
  MailCheck, MailX, TrendingUp, Download
} from "lucide-react";
import Sidebar from "../components/sidebar";
import MetricCard from "../components/metric-card";

export default function ColdEmailAgentPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Sample B2B Email data
  const emailData = {
    campaigns: [
      { 
        id: 1, 
        name: "Enterprise SaaS Solutions 2025", 
        sent: 347, 
        opened: 102, 
        clicked: 52, 
        replied: 43, 
        scheduled: 12,
        bounced: 7,
        status: "active",
        progress: 75,
        startDate: "2025-05-10",
        endDate: "2025-05-25",
      },
      { 
        id: 2, 
        name: "CTO Decision Makers Q2", 
        sent: 215, 
        opened: 83, 
        clicked: 38, 
        replied: 24, 
        scheduled: 8,
        bounced: 3,
        status: "completed",
        progress: 100,
        startDate: "2025-04-15",
        endDate: "2025-05-01",
      },
    ],
    stats: {
      totalEmails: 562,
      openRate: 33,
      clickRate: 16,
      replyRate: 12,
      meetingRate: 3.5,
      bounceRate: 1.8
    }
  };
  
  const activeCampaign = emailData.campaigns[0];
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      
      <main className="flex-1 md:ml-56 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Cold Email B2B Agent</h2>
              <p className="mt-1 text-sm text-gray-600">Manage and monitor your B2B email outreach campaigns</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Mail className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </div>
          </div>
        </div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-700">Loading data...</span>
            </div>
          </div>
        )}
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Emails Sent"
            value={emailData.stats.totalEmails}
            icon="mail"
            change={8.7}
            color="#3B82F6"
            progressValue={85}
            isLoading={isLoading}
          />
          
          <MetricCard
            title="Open Rate"
            value={emailData.stats.openRate}
            suffix="%"
            icon="mail-check"
            change={2.3}
            color="#10B981"
            progressValue={emailData.stats.openRate}
            isLoading={isLoading}
          />
          
          <MetricCard
            title="Reply Rate"
            value={emailData.stats.replyRate}
            suffix="%"
            icon="reply"
            change={1.5}
            color="#6366F1"
            progressValue={Math.min(100, emailData.stats.replyRate * 5)}
            isLoading={isLoading}
          />
        </div>
        
        {/* Campaign Tabs */}
        <div className="mb-8">
          <Tabs defaultValue="active">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="active">Active Campaigns</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              </TabsList>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
            
            <TabsContent value="active" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Campaign</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Progress</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Sent</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Opens</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Replies</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Meetings</th>
                          <th className="py-3 px-4 text-right font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emailData.campaigns.filter(c => c.status === "active").map((campaign) => (
                          <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{campaign.name}</div>
                                <div className="text-xs text-gray-500">{campaign.startDate} to {campaign.endDate}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${campaign.progress}%` }}></div>
                                </div>
                                <span className="text-xs text-gray-500">{campaign.progress}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium">{campaign.sent}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className="font-medium">{campaign.opened}</span>
                                <span className="text-xs text-gray-500 ml-1">({Math.round((campaign.opened / campaign.sent) * 100)}%)</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className="font-medium">{campaign.replied}</span>
                                <span className="text-xs text-gray-500 ml-1">({Math.round((campaign.replied / campaign.sent) * 100)}%)</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className="font-medium">{campaign.scheduled}</span>
                                <span className="text-xs text-gray-500 ml-1">({Math.round((campaign.scheduled / campaign.sent) * 100)}%)</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="outline" size="sm">View</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Campaign</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Sent</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Opens</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Replies</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-500">Meetings</th>
                          <th className="py-3 px-4 text-right font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emailData.campaigns.filter(c => c.status === "completed").map((campaign) => (
                          <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{campaign.name}</div>
                                <div className="text-xs text-gray-500">{campaign.startDate} to {campaign.endDate}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Completed
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium">{campaign.sent}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className="font-medium">{campaign.opened}</span>
                                <span className="text-xs text-gray-500 ml-1">({Math.round((campaign.opened / campaign.sent) * 100)}%)</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className="font-medium">{campaign.replied}</span>
                                <span className="text-xs text-gray-500 ml-1">({Math.round((campaign.replied / campaign.sent) * 100)}%)</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className="font-medium">{campaign.scheduled}</span>
                                <span className="text-xs text-gray-500 ml-1">({Math.round((campaign.scheduled / campaign.sent) * 100)}%)</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="outline" size="sm">Report</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="scheduled" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No scheduled campaigns</h3>
                    <p className="text-sm text-gray-500 mt-2">When you schedule campaigns for future delivery, they'll appear here.</p>
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Create Campaign</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Campaign Details */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Active Campaign: {activeCampaign.name}</h3>
          
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-700 mb-4">Campaign Performance</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Open Rate</span>
                        <span className="text-sm font-medium">{Math.round((activeCampaign.opened / activeCampaign.sent) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.round((activeCampaign.opened / activeCampaign.sent) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Click Rate</span>
                        <span className="text-sm font-medium">{Math.round((activeCampaign.clicked / activeCampaign.sent) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full" 
                          style={{ width: `${Math.round((activeCampaign.clicked / activeCampaign.sent) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Reply Rate</span>
                        <span className="text-sm font-medium">{Math.round((activeCampaign.replied / activeCampaign.sent) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.round((activeCampaign.replied / activeCampaign.sent) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Meeting Conversion</span>
                        <span className="text-sm font-medium">{Math.round((activeCampaign.scheduled / activeCampaign.sent) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${Math.round((activeCampaign.scheduled / activeCampaign.sent) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-4">Campaign Stats</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Emails Sent</p>
                          <p className="text-xl font-bold">{activeCampaign.sent}</p>
                        </div>
                        <Mail className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Opens</p>
                          <p className="text-xl font-bold">{activeCampaign.opened}</p>
                        </div>
                        <MailCheck className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Clicks</p>
                          <p className="text-xl font-bold">{activeCampaign.clicked}</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-indigo-500" />
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Replies</p>
                          <p className="text-xl font-bold">{activeCampaign.replied}</p>
                        </div>
                        <FileText className="h-8 w-8 text-purple-500" />
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Meetings</p>
                          <p className="text-xl font-bold">{activeCampaign.scheduled}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Bounces</p>
                          <p className="text-xl font-bold">{activeCampaign.bounced}</p>
                        </div>
                        <MailX className="h-8 w-8 text-red-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Attribution */}
        <div className="mt-8 text-xs text-gray-500 text-center">
          <p>© 2025 AI Agent Team Dashboard. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}