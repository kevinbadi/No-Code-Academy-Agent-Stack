import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Users, 
  BarChart4, 
  TrendingUp, 
  Clock, 
  PieChart,
  Send,
  Mail,
  MousePointerClick,
  ThumbsUp,
  RefreshCw,
  LineChart,
  CalendarDays,
  Repeat2
} from "lucide-react";

import Sidebar from "@/components/sidebar";

// Sample newsletter analytics data
const newsletterData = {
  // Subscriber metrics
  totalSubscribers: 4568,
  activeSubscribers: 4237,
  newSubscribers: 247,
  unsubscribes: 18,
  
  // Send statistics
  sentNewsletters: 24,
  totalSends: 109632,
  avgOpenRate: 32.4,
  avgClickRate: 8.7,
  
  // Recent campaigns
  recentCampaigns: [
    {
      id: 1,
      name: "May Product Update",
      dateSent: "May 15, 2025",
      recipients: 4532,
      opens: 1598,
      clicks: 417,
      openRate: 35.3,
      clickRate: 9.2,
      unsubscribes: 3
    },
    {
      id: 2,
      name: "April Industry Insights",
      dateSent: "Apr 28, 2025",
      recipients: 4485,
      opens: 1489,
      clicks: 386,
      openRate: 33.2,
      clickRate: 8.6,
      unsubscribes: 5
    },
    {
      id: 3,
      name: "Special Promotion",
      dateSent: "Apr 12, 2025",
      recipients: 4456,
      opens: 1690,
      clicks: 527,
      openRate: 37.9,
      clickRate: 11.8,
      unsubscribes: 2
    }
  ],
  
  // Subscriber growth
  subscriberGrowth: [
    { month: "Jan", subscribers: 3842 },
    { month: "Feb", subscribers: 3998 },
    { month: "Mar", subscribers: 4156 },
    { month: "Apr", subscribers: 4321 },
    { month: "May", subscribers: 4568 }
  ],
  
  // Content performance categories
  topContentCategories: [
    { category: "Industry News", openRate: 38.2, clickRate: 10.5 },
    { category: "Product Updates", openRate: 35.7, clickRate: 9.3 },
    { category: "Tutorials", openRate: 42.1, clickRate: 15.2 },
    { category: "Case Studies", openRate: 33.4, clickRate: 12.7 },
    { category: "Promotions", openRate: 31.9, clickRate: 8.4 }
  ],
  
  // Engagement timing
  bestSendTimes: [
    { day: "Tuesday", time: "10:00 AM", openRate: 36.8 },
    { day: "Wednesday", time: "9:30 AM", openRate: 35.7 },
    { day: "Thursday", time: "11:00 AM", openRate: 34.2 }
  ],
  
  // Audience segments
  audienceSegments: [
    { name: "New Subscribers", subscribers: 247, openRate: 41.2, clickRate: 12.5 },
    { name: "Highly Engaged", subscribers: 1258, openRate: 48.7, clickRate: 17.3 },
    { name: "Moderately Engaged", subscribers: 2145, openRate: 29.3, clickRate: 6.8 },
    { name: "At Risk", subscribers: 834, openRate: 12.1, clickRate: 1.6 }
  ]
};

export default function NewsletterAgent() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refreshing data
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Newsletter Analytics Agent</h1>
            <p className="text-gray-500">This agent reports analytics from all email campaigns sent to our newsletter subscribers every Monday, Wednesday, and Friday at 5 PM EST.</p>
            <p className="text-sm text-gray-400 mt-1">Monitor open rates, click rates, subscriber growth, and optimize your newsletter performance.</p>
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
        
        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Subscribers</p>
                  <h3 className="text-3xl font-bold mt-1 text-gray-800">{newsletterData.totalSubscribers.toLocaleString()}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+{newsletterData.newSubscribers} this month</span>
                <span className="text-xs text-gray-500 ml-2">{(newsletterData.unsubscribes / newsletterData.totalSubscribers * 100).toFixed(1)}% churn rate</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Open Rate</p>
                  <h3 className="text-3xl font-bold mt-1 text-gray-800">{newsletterData.avgOpenRate}%</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Industry average: 25.8%</p>
                <Progress value={newsletterData.avgOpenRate / 50 * 100} className="h-1 bg-gray-100 [&>div]:bg-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Click Rate</p>
                  <h3 className="text-3xl font-bold mt-1 text-gray-800">{newsletterData.avgClickRate}%</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <MousePointerClick className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Industry average: 3.2%</p>
                <Progress value={newsletterData.avgClickRate / 15 * 100} className="h-1 bg-gray-100 [&>div]:bg-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Newsletters Sent</p>
                  <h3 className="text-3xl font-bold mt-1 text-gray-800">{newsletterData.sentNewsletters}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <Send className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-xs font-medium text-gray-600">Total sends: {newsletterData.totalSends.toLocaleString()}</span>
                <span className="text-xs text-gray-500 ml-2">Avg. audience: {Math.round(newsletterData.totalSends / newsletterData.sentNewsletters).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-6 bg-white border rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100">
              <BarChart4 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-gray-100">
              <Send className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="data-[state=active]:bg-gray-100">
              <Users className="h-4 w-4 mr-2" />
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="optimization" className="data-[state=active]:bg-gray-100">
              <TrendingUp className="h-4 w-4 mr-2" />
              Optimization
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-sm border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Subscriber Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 flex flex-col">
                      <div className="flex-grow flex items-end justify-between">
                        {newsletterData.subscriberGrowth.map((month, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div className="relative w-16">
                              <div 
                                className="w-12 bg-blue-600 rounded-t-lg mx-auto" 
                                style={{ 
                                  height: `${(month.subscribers / 5000) * 100}%`,
                                  minHeight: '20px'
                                }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-500 mt-2">{month.month}</span>
                            <span className="text-xs text-gray-400">{(month.subscribers / 1000).toFixed(1)}k</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                    Audience Segments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {newsletterData.audienceSegments.map((segment, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{segment.name}</span>
                          <span className="text-xs text-gray-500">{segment.subscribers.toLocaleString()} subscribers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(segment.subscribers / newsletterData.totalSubscribers) * 100} 
                            className={`h-2 ${
                              index === 0 ? "[&>div]:bg-green-500" : 
                              index === 1 ? "[&>div]:bg-blue-500" : 
                              index === 2 ? "[&>div]:bg-yellow-500" : 
                              "[&>div]:bg-red-500"
                            }`}
                          />
                          <span className="text-xs text-gray-500 w-8">
                            {((segment.subscribers / newsletterData.totalSubscribers) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium mb-3">Engagement by Segment</h4>
                    <div className="space-y-3">
                      {newsletterData.audienceSegments.map((segment, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{segment.name}</span>
                          <div className="flex items-center gap-4">
                            <span>
                              <Mail className="h-3 w-3 inline mr-1 text-gray-500" />
                              {segment.openRate}%
                            </span>
                            <span>
                              <MousePointerClick className="h-3 w-3 inline mr-1 text-gray-500" />
                              {segment.clickRate}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <ThumbsUp className="h-5 w-5 mr-2 text-green-600" />
                    Top Performing Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {newsletterData.topContentCategories.map((category, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{category.category}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">Open Rate</span>
                              <span className="text-xs font-medium">{category.openRate}%</span>
                            </div>
                            <Progress 
                              value={(category.openRate / 50) * 100} 
                              className="h-1.5 [&>div]:bg-green-500"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">Click Rate</span>
                              <span className="text-xs font-medium">{category.clickRate}%</span>
                            </div>
                            <Progress 
                              value={(category.clickRate / 20) * 100} 
                              className="h-1.5 [&>div]:bg-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-amber-600" />
                    Best Send Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {newsletterData.bestSendTimes.map((timeSlot, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex-shrink-0 w-24">
                            <div className="text-sm font-medium">{timeSlot.day}</div>
                            <div className="text-xs text-gray-500">{timeSlot.time}</div>
                          </div>
                          
                          <div className="flex-grow">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">Open Rate</span>
                              <span className="text-xs font-medium">{timeSlot.openRate}%</span>
                            </div>
                            <Progress 
                              value={(timeSlot.openRate / 50) * 100} 
                              className={`h-2 ${
                                index === 0 ? "[&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-amber-500" : 
                                index === 1 ? "[&>div]:bg-gradient-to-r [&>div]:from-amber-300 [&>div]:to-amber-400" : 
                                "[&>div]:bg-gradient-to-r [&>div]:from-amber-200 [&>div]:to-amber-300"
                              }`}
                            />
                          </div>
                        </div>
                        
                        {index < newsletterData.bestSendTimes.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))}
                    
                    <div className="bg-amber-50 rounded-lg p-4 mt-4">
                      <h4 className="text-sm font-medium flex items-center mb-2">
                        <Repeat2 className="h-4 w-4 mr-2 text-amber-600" />
                        Sending Recommendation
                      </h4>
                      <p className="text-sm text-gray-600">
                        Schedule your next newsletter for <span className="font-medium">Tuesday at 10:00 AM</span> to maximize engagement based on your audience behavior.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card className="shadow-sm border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Send className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-xs text-gray-500">
                        <th className="px-4 py-3 text-left font-medium">Name</th>
                        <th className="px-4 py-3 text-left font-medium">Date Sent</th>
                        <th className="px-4 py-3 text-right font-medium">Recipients</th>
                        <th className="px-4 py-3 text-right font-medium">Opens</th>
                        <th className="px-4 py-3 text-right font-medium">Clicks</th>
                        <th className="px-4 py-3 text-right font-medium">Open Rate</th>
                        <th className="px-4 py-3 text-right font-medium">Click Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsletterData.recentCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-medium text-blue-600">{campaign.name}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{campaign.dateSent}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 text-right">{campaign.recipients.toLocaleString()}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 text-right">{campaign.opens.toLocaleString()}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 text-right">{campaign.clicks.toLocaleString()}</td>
                          <td className="px-4 py-4 text-sm font-medium text-right">
                            <span className={`${campaign.openRate > newsletterData.avgOpenRate ? 'text-green-600' : 'text-gray-600'}`}>
                              {campaign.openRate}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-right">
                            <span className={`${campaign.clickRate > newsletterData.avgClickRate ? 'text-green-600' : 'text-gray-600'}`}>
                              {campaign.clickRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <Button variant="outline" size="sm" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Export Report
                  </Button>
                  
                  <div className="text-sm text-gray-500">
                    Showing 3 of 24 campaigns
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <BarChart4 className="h-5 w-5 mr-2 text-purple-600" />
                    Campaign Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 flex flex-col">
                      <div className="flex-grow flex items-end justify-between">
                        {newsletterData.recentCampaigns.map((campaign, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div className="relative w-24 flex items-end justify-center gap-2">
                              <div 
                                className="w-8 bg-purple-600 rounded-t-lg" 
                                style={{ 
                                  height: `${(campaign.openRate / 50) * 100}%`,
                                  minHeight: '20px'
                                }}
                              >
                                <div className="absolute -top-5 w-8 text-center text-xs font-medium text-purple-700">{campaign.openRate}%</div>
                              </div>
                              <div 
                                className="w-8 bg-blue-500 rounded-t-lg" 
                                style={{ 
                                  height: `${(campaign.clickRate / 15) * 100}%`,
                                  minHeight: '15px'
                                }}
                              >
                                <div className="absolute -top-5 w-8 text-center text-xs font-medium text-blue-700">{campaign.clickRate}%</div>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-gray-500 mt-2">{campaign.name.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-center mt-4 space-x-6">
                        <div className="flex items-center">
                          <div className="h-3 w-3 bg-purple-600 rounded-sm mr-2"></div>
                          <span className="text-xs text-gray-500">Open Rate</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 bg-blue-500 rounded-sm mr-2"></div>
                          <span className="text-xs text-gray-500">Click Rate</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-green-600" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Opens Over Time</span>
                        <span className="text-xs text-green-600 font-medium">+2.4% trend</span>
                      </div>
                      <div className="h-24 bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 flex items-end">
                        <div className="flex-1 h-full flex items-end">
                          {[28, 31, 26, 33, 35, 37, 33].map((value, i) => (
                            <div 
                              key={i}
                              className="flex-1 mx-0.5"
                              style={{ height: `${value}%` }}
                            >
                              <div 
                                className="w-full h-full bg-green-500 rounded-sm opacity-70"
                                style={{ 
                                  opacity: i < 6 ? 0.5 + (i * 0.08) : 0.98
                                }}
                              ></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Clicks Over Time</span>
                        <span className="text-xs text-green-600 font-medium">+4.1% trend</span>
                      </div>
                      <div className="h-24 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 flex items-end">
                        <div className="flex-1 h-full flex items-end">
                          {[8.1, 7.6, 8.3, 9.2, 8.5, 9.8, 11.8].map((value, i) => (
                            <div 
                              key={i}
                              className="flex-1 mx-0.5"
                              style={{ height: `${value * 4}%` }}
                            >
                              <div 
                                className="w-full h-full bg-blue-500 rounded-sm opacity-70"
                                style={{ 
                                  opacity: i < 6 ? 0.5 + (i * 0.08) : 0.98
                                }}
                              ></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 mt-4">
                      <h4 className="text-sm font-medium flex items-center mb-2">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                        Performance Insight
                      </h4>
                      <p className="text-sm text-gray-600">
                        Your <span className="font-medium">Special Promotion</span> campaign had the highest engagement, with a 37.9% open rate and 11.8% click rate, significantly above industry averages.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-sm border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Subscriber Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium">Active Subscribers</div>
                        <div className="text-sm font-medium">{(newsletterData.activeSubscribers / newsletterData.totalSubscribers * 100).toFixed(1)}%</div>
                      </div>
                      <Progress value={newsletterData.activeSubscribers / newsletterData.totalSubscribers * 100} className="h-2 [&>div]:bg-blue-600" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <div>{newsletterData.activeSubscribers.toLocaleString()} subscribers</div>
                        <div>from {newsletterData.totalSubscribers.toLocaleString()} total</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium">New Subscribers</div>
                        <div className="flex items-center">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full mr-2">
                            +5.2%
                          </span>
                          <span className="text-sm font-medium">{newsletterData.newSubscribers}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-500">Last 30 days</div>
                        <div className="flex-grow h-1 bg-gray-100 rounded">
                          <div className="h-1 bg-green-500 rounded" style={{ width: "65%" }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium">Unsubscribes</div>
                        <div className="flex items-center">
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full mr-2">
                            {(newsletterData.unsubscribes / newsletterData.totalSubscribers * 100).toFixed(2)}%
                          </span>
                          <span className="text-sm font-medium">{newsletterData.unsubscribes}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-500">Last 30 days</div>
                        <div className="flex-grow h-1 bg-gray-100 rounded">
                          <div className="h-1 bg-red-500 rounded" style={{ width: "15%" }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium flex items-center mb-2">
                        <CalendarDays className="h-4 w-4 mr-2 text-blue-600" />
                        Monthly Growth Rate
                      </h4>
                      <div className="flex items-center">
                        <div className="text-2xl font-bold text-blue-700">+5.7%</div>
                        <div className="text-xs text-gray-600 ml-2">
                          average over last 3 months
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2 shadow-sm border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                    Subscriber Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Engagement Segments</h4>
                      <div className="relative h-64 w-64 mx-auto">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800">{newsletterData.totalSubscribers.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Total Subscribers</div>
                          </div>
                        </div>
                        
                        {/* Simplified donut chart */}
                        <svg width="100%" height="100%" viewBox="0 0 42 42" className="transform -rotate-90">
                          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d1d5db" strokeWidth="3"></circle>
                          
                          {/* Highly Engaged ~ 28% */}
                          <circle 
                            cx="21" cy="21" r="15.91549430918954" fill="transparent"
                            stroke="#3b82f6" strokeWidth="3"
                            strokeDasharray="28 72" strokeDashoffset="0"
                          ></circle>
                          
                          {/* Moderately Engaged ~ 47% */}
                          <circle 
                            cx="21" cy="21" r="15.91549430918954" fill="transparent"
                            stroke="#60a5fa" strokeWidth="3"
                            strokeDasharray="47 53" strokeDashoffset="-28"
                          ></circle>
                          
                          {/* At Risk ~ 18% */}
                          <circle 
                            cx="21" cy="21" r="15.91549430918954" fill="transparent"
                            stroke="#f59e0b" strokeWidth="3"
                            strokeDasharray="18 82" strokeDashoffset="-75"
                          ></circle>
                          
                          {/* Inactive ~ 7% */}
                          <circle 
                            cx="21" cy="21" r="15.91549430918954" fill="transparent"
                            stroke="#ef4444" strokeWidth="3"
                            strokeDasharray="7 93" strokeDashoffset="-93"
                          ></circle>
                        </svg>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center">
                          <div className="h-3 w-3 bg-blue-600 rounded-sm mr-2"></div>
                          <span className="text-xs text-gray-600">Highly Engaged (28%)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 bg-blue-400 rounded-sm mr-2"></div>
                          <span className="text-xs text-gray-600">Moderately Engaged (47%)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 bg-amber-500 rounded-sm mr-2"></div>
                          <span className="text-xs text-gray-600">At Risk (18%)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 bg-red-500 rounded-sm mr-2"></div>
                          <span className="text-xs text-gray-600">Inactive (7%)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3">Subscriber Sources</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Website Sign-ups</span>
                            <span className="text-sm font-medium">48%</span>
                          </div>
                          <Progress value={48} className="h-2 [&>div]:bg-blue-600" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Landing Pages</span>
                            <span className="text-sm font-medium">23%</span>
                          </div>
                          <Progress value={23} className="h-2 [&>div]:bg-green-500" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Social Media</span>
                            <span className="text-sm font-medium">17%</span>
                          </div>
                          <Progress value={17} className="h-2 [&>div]:bg-purple-500" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Referrals</span>
                            <span className="text-sm font-medium">9%</span>
                          </div>
                          <Progress value={9} className="h-2 [&>div]:bg-amber-500" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Other</span>
                            <span className="text-sm font-medium">3%</span>
                          </div>
                          <Progress value={3} className="h-2 [&>div]:bg-gray-500" />
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium flex items-center mb-2">
                          <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                          Acquisition Insight
                        </h4>
                        <p className="text-sm text-gray-600">
                          Your landing pages are converting 32% better than last quarter, becoming your fastest-growing subscriber source.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <ThumbsUp className="h-5 w-5 mr-2 text-green-600" />
                    Subject Line Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Top Performing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                          Exclusive
                          <span className="ml-1 text-xs font-normal">(+28%)</span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                          Limited
                          <span className="ml-1 text-xs font-normal">(+26%)</span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                          Today
                          <span className="ml-1 text-xs font-normal">(+21%)</span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                          New
                          <span className="ml-1 text-xs font-normal">(+19%)</span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                          Offer
                          <span className="ml-1 text-xs font-normal">(+17%)</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3">Subject Line Length</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Short (3-5 words)</span>
                            <span className="text-sm font-medium">34.2% open rate</span>
                          </div>
                          <Progress value={34.2 / 50 * 100} className="h-2 [&>div]:bg-green-600" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Medium (6-10 words)</span>
                            <span className="text-sm font-medium">32.9% open rate</span>
                          </div>
                          <Progress value={32.9 / 50 * 100} className="h-2 [&>div]:bg-blue-500" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Long (11+ words)</span>
                            <span className="text-sm font-medium">27.3% open rate</span>
                          </div>
                          <Progress value={27.3 / 50 * 100} className="h-2 [&>div]:bg-amber-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium flex items-center mb-2">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                        Subject Line Recommendation
                      </h4>
                      <p className="text-sm text-gray-600">
                        Keep your subject lines concise (3-5 words) and include words like "Exclusive" or "Limited" to improve open rates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <MousePointerClick className="h-5 w-5 mr-2 text-blue-600" />
                    Content Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Best Performing Content Types</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Tutorials & Guides</span>
                            <span className="text-sm font-medium">15.2% click rate</span>
                          </div>
                          <Progress value={15.2 / 20 * 100} className="h-2 [&>div]:bg-blue-600" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Case Studies</span>
                            <span className="text-sm font-medium">12.7% click rate</span>
                          </div>
                          <Progress value={12.7 / 20 * 100} className="h-2 [&>div]:bg-purple-500" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Industry News</span>
                            <span className="text-sm font-medium">10.5% click rate</span>
                          </div>
                          <Progress value={10.5 / 20 * 100} className="h-2 [&>div]:bg-green-500" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Product Updates</span>
                            <span className="text-sm font-medium">9.3% click rate</span>
                          </div>
                          <Progress value={9.3 / 20 * 100} className="h-2 [&>div]:bg-amber-500" />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3">Call-to-Action Analysis</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-blue-700 mb-1">Button CTAs</div>
                          <div className="text-2xl font-bold text-blue-700">+72%</div>
                          <div className="text-xs text-blue-600 mt-1">higher click rate than text links</div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-green-700 mb-1">Best CTA Text</div>
                          <div className="text-lg font-bold text-green-700">"Learn More"</div>
                          <div className="text-xs text-green-600 mt-1">13.8% click rate</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium flex items-center mb-2">
                        <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                        Content Recommendation
                      </h4>
                      <p className="text-sm text-gray-600">
                        Include more tutorial content with prominent button CTAs using action-oriented phrases like "Learn More" to maximize engagement.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="shadow-sm border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-amber-600" />
                  Optimization Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                        High Impact
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Sending Time</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Shifting your sending time from 2 PM to 10 AM on Tuesdays could increase open rates by approximately 4.6%.
                    </p>
                    <Button size="sm" variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-100">
                      Implement Change
                    </Button>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        Medium Impact
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Audience Segmentation</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Creating targeted content for your "Highly Engaged" segment could increase overall click rates by 2.8%.
                    </p>
                    <Button size="sm" variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-100">
                      Create Segments
                    </Button>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Medium Impact
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Subject Line Testing</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      A/B testing subject lines with emotional triggers could improve open rates by approximately 3.2%.
                    </p>
                    <Button size="sm" variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-100">
                      Setup A/B Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}