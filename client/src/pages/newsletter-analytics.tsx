import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  Mail, 
  MousePointerClick, 
  AlertCircle,
  Calendar,
  Send,
  BarChart,
  ListFilter,
  Users
} from "lucide-react";
import Sidebar from "@/components/sidebar";

// Interface for our newsletter analytics data
interface NewsletterAnalytics {
  id: number;
  campaign_id: string;
  campaign_name: string;
  campaign_date: string;
  campaign_type: string;
  subject: string;
  list_name: string;
  total_recipients: number;
  emails_sent: number;
  hard_bounces: number;
  soft_bounces: number;
  total_bounces: number;
  opens_total: number;
  unique_opens: number;
  clicks_total: number;
  unique_clicks: number;
  unique_subscriber_clicks: number;
  open_rate: number;
  click_rate: number;
  click_to_open_rate: number;
  unsubscribes: number;
  send_time: string;
  day_of_week: string;
}

export default function NewsletterAnalyticsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Query to fetch the latest campaign data
  const { 
    data: latestCampaign, 
    isLoading: isLatestLoading, 
    refetch: refetchLatest 
  } = useQuery<NewsletterAnalytics>({
    queryKey: ["/api/newsletter-analytics/latest"],
    refetchOnWindowFocus: false,
  });
  
  // Query to fetch all campaigns
  const { 
    data: allCampaigns, 
    isLoading: isAllLoading,
    refetch: refetchAll
  } = useQuery<NewsletterAnalytics[]>({
    queryKey: ["/api/newsletter-analytics"],
    refetchOnWindowFocus: false,
  });
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchLatest(), refetchAll()]);
    setIsRefreshing(false);
  };
  
  // Format percentages for display
  const formatPercentage = (value: number) => {
    const percentage = value * 100;
    return percentage.toFixed(2) + "%";
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  
  if (isLatestLoading || isAllLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium">Loading newsletter analytics...</h3>
              <p className="text-muted-foreground">Please wait while we fetch the data.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Newsletter Analytics Agent</h1>
            <p className="text-gray-500">This agent reports analytics from all email campaigns sent to our newsletter subscribers every Monday, Wednesday, and Friday at 5 PM EST.</p>
            <p className="text-sm text-gray-400 mt-1">Monitor open rates, click rates, and optimize your newsletter performance.</p>
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
        
        {!latestCampaign ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium">No newsletter data available</h3>
              <p className="text-muted-foreground">Try sending a campaign first.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Emails Sent</p>
                      <h3 className="text-3xl font-bold mt-1 text-gray-800">{latestCampaign.emails_sent.toLocaleString()}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Send className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {latestCampaign.campaign_id}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {latestCampaign.day_of_week}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Open Rate</p>
                      <h3 className="text-3xl font-bold mt-1 text-gray-800">{formatPercentage(latestCampaign.open_rate)}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Industry average: 25.8%</p>
                    <Progress 
                      value={latestCampaign.open_rate * 100} 
                      className="h-1 bg-gray-100 [&>div]:bg-green-600" 
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Click Rate</p>
                      <h3 className="text-3xl font-bold mt-1 text-gray-800">{formatPercentage(latestCampaign.click_rate)}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                      <MousePointerClick className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Industry average: 3.2%</p>
                    <Progress 
                      value={latestCampaign.click_rate * 100} 
                      className="h-1 bg-gray-100 [&>div]:bg-purple-600" 
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bounce Rate</p>
                      <h3 className="text-3xl font-bold mt-1 text-gray-800">
                        {formatPercentage(latestCampaign.total_bounces / latestCampaign.emails_sent)}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-xs font-medium text-gray-600">
                      Hard: {latestCampaign.hard_bounces}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      Soft: {latestCampaign.soft_bounces}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content Tabs */}
            <Tabs defaultValue="campaign" className="w-full">
              <TabsList className="mb-6 bg-white border rounded-lg">
                <TabsTrigger value="campaign" className="data-[state=active]:bg-gray-100">
                  <BarChart className="h-4 w-4 mr-2" />
                  Campaign Details
                </TabsTrigger>
                <TabsTrigger value="metrics" className="data-[state=active]:bg-gray-100">
                  <Send className="h-4 w-4 mr-2" />
                  Performance Metrics
                </TabsTrigger>
                <TabsTrigger value="engagement" className="data-[state=active]:bg-gray-100">
                  <Users className="h-4 w-4 mr-2" />
                  Engagement
                </TabsTrigger>
              </TabsList>
              
              {/* Campaign Details Tab */}
              <TabsContent value="campaign" className="space-y-6">
                <Card className="shadow-sm border border-gray-100">
                  <CardHeader>
                    <CardTitle>Campaign Overview</CardTitle>
                    <CardDescription>
                      Details about the latest email campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Campaign ID</h3>
                            <p className="text-base font-medium mt-1">{latestCampaign.campaign_id}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Campaign Name</h3>
                            <p className="text-base font-medium mt-1">{latestCampaign.campaign_name}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Subject Line</h3>
                            <p className="text-base font-medium mt-1">{latestCampaign.subject}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Campaign Type</h3>
                            <p className="text-base font-medium mt-1">{latestCampaign.campaign_type}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">List Name</h3>
                            <p className="text-base font-medium mt-1">{latestCampaign.list_name}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Send Date & Time</h3>
                            <p className="text-base font-medium mt-1">{formatDate(latestCampaign.send_time)}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Day of Week</h3>
                            <p className="text-base font-medium mt-1">{latestCampaign.day_of_week}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Total Recipients</h3>
                            <p className="text-base font-medium mt-1">{latestCampaign.emails_sent}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Performance Metrics Tab */}
              <TabsContent value="metrics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Metrics</CardTitle>
                      <CardDescription>Email delivery statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <span className="font-medium">Emails Sent:</span>
                            </div>
                            <span>{latestCampaign.emails_sent}</span>
                          </div>
                          <Progress value={100} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <span className="font-medium">Successfully Delivered:</span>
                            </div>
                            <span>{latestCampaign.emails_sent - latestCampaign.total_bounces}</span>
                          </div>
                          <Progress 
                            value={((latestCampaign.emails_sent - latestCampaign.total_bounces) / latestCampaign.emails_sent) * 100} 
                            className="h-2" 
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <span className="font-medium">Hard Bounces:</span>
                            </div>
                            <span>{latestCampaign.hard_bounces}</span>
                          </div>
                          <Progress 
                            value={(latestCampaign.hard_bounces / latestCampaign.emails_sent) * 100} 
                            className="h-2" 
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <span className="font-medium">Soft Bounces:</span>
                            </div>
                            <span>{latestCampaign.soft_bounces}</span>
                          </div>
                          <Progress 
                            value={(latestCampaign.soft_bounces / latestCampaign.emails_sent) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement Metrics</CardTitle>
                      <CardDescription>How recipients engaged with your email</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <span className="font-medium">Unique Opens:</span>
                            </div>
                            <span>{latestCampaign.unique_opens}</span>
                          </div>
                          <Progress 
                            value={(latestCampaign.unique_opens / latestCampaign.emails_sent) * 100} 
                            className="h-2 bg-green-100 [&>div]:bg-green-500" 
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <span className="font-medium">Total Opens:</span>
                            </div>
                            <span>{latestCampaign.opens_total}</span>
                          </div>
                          <Progress 
                            value={(latestCampaign.opens_total / (latestCampaign.emails_sent * 2)) * 100} 
                            className="h-2 bg-green-100 [&>div]:bg-green-500" 
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <span className="font-medium">Unique Clicks:</span>
                            </div>
                            <span>{latestCampaign.unique_clicks}</span>
                          </div>
                          <Progress 
                            value={(latestCampaign.unique_clicks / latestCampaign.emails_sent) * 100} 
                            className="h-2 bg-purple-100 [&>div]:bg-purple-500" 
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <span className="font-medium">Total Clicks:</span>
                            </div>
                            <span>{latestCampaign.clicks_total}</span>
                          </div>
                          <Progress 
                            value={(latestCampaign.clicks_total / (latestCampaign.emails_sent * 0.5)) * 100} 
                            className="h-2 bg-purple-100 [&>div]:bg-purple-500" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Rates</CardTitle>
                    <CardDescription>Key campaign performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium text-gray-500">Open Rate</div>
                        <div className="text-2xl font-bold mt-2">{formatPercentage(latestCampaign.open_rate)}</div>
                        <Progress 
                          value={latestCampaign.open_rate * 100} 
                          className="h-1 mt-2 bg-gray-100 [&>div]:bg-green-600" 
                        />
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium text-gray-500">Click Rate</div>
                        <div className="text-2xl font-bold mt-2">{formatPercentage(latestCampaign.click_rate)}</div>
                        <Progress 
                          value={latestCampaign.click_rate * 100} 
                          className="h-1 mt-2 bg-gray-100 [&>div]:bg-purple-600" 
                        />
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium text-gray-500">Click-to-Open Rate</div>
                        <div className="text-2xl font-bold mt-2">{formatPercentage(latestCampaign.click_to_open_rate)}</div>
                        <Progress 
                          value={latestCampaign.click_to_open_rate * 100} 
                          className="h-1 mt-2 bg-gray-100 [&>div]:bg-blue-600" 
                        />
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium text-gray-500">Bounce Rate</div>
                        <div className="text-2xl font-bold mt-2">
                          {formatPercentage(latestCampaign.total_bounces / latestCampaign.emails_sent)}
                        </div>
                        <Progress 
                          value={(latestCampaign.total_bounces / latestCampaign.emails_sent) * 100} 
                          className="h-1 mt-2 bg-gray-100 [&>div]:bg-amber-600" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Engagement Tab */}
              <TabsContent value="engagement" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscriber Engagement</CardTitle>
                    <CardDescription>How subscribers interacted with your campaign</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-lg border p-4">
                          <div className="text-sm font-medium text-gray-500">Unique Opens</div>
                          <div className="text-3xl font-bold mt-2 flex items-end">
                            {latestCampaign.unique_opens}
                            <span className="text-sm text-gray-500 ml-2 pb-1">
                              ({formatPercentage(latestCampaign.unique_opens / latestCampaign.emails_sent)})
                            </span>
                          </div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="text-sm font-medium text-gray-500">Unique Clickers</div>
                          <div className="text-3xl font-bold mt-2 flex items-end">
                            {latestCampaign.unique_subscriber_clicks}
                            <span className="text-sm text-gray-500 ml-2 pb-1">
                              ({formatPercentage(latestCampaign.unique_subscriber_clicks / latestCampaign.emails_sent)})
                            </span>
                          </div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="text-sm font-medium text-gray-500">Unsubscribes</div>
                          <div className="text-3xl font-bold mt-2 flex items-end">
                            {latestCampaign.unsubscribes}
                            <span className="text-sm text-gray-500 ml-2 pb-1">
                              ({formatPercentage(latestCampaign.unsubscribes / latestCampaign.emails_sent)})
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Engagement Overview</h3>
                        <div className="h-10 w-full bg-gray-100 rounded-md overflow-hidden flex">
                          <div 
                            className="h-full bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(latestCampaign.unique_opens / latestCampaign.emails_sent) * 100}%` }}
                          >
                            {formatPercentage(latestCampaign.unique_opens / latestCampaign.emails_sent)}
                          </div>
                          <div 
                            className="h-full bg-purple-500 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(latestCampaign.unique_clicks / latestCampaign.emails_sent) * 100}%` }}
                          >
                            {formatPercentage(latestCampaign.unique_clicks / latestCampaign.emails_sent)}
                          </div>
                          <div 
                            className="h-full bg-red-400 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(latestCampaign.unsubscribes / latestCampaign.emails_sent) * 100}%` }}
                          >
                            {formatPercentage(latestCampaign.unsubscribes / latestCampaign.emails_sent)}
                          </div>
                        </div>
                        <div className="flex mt-2 text-xs text-gray-500 justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                            <span>Opened Only</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                            <span>Clicked</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-400 rounded-full mr-1"></div>
                            <span>Unsubscribed</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-100 rounded-full mr-1"></div>
                            <span>Not Opened</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}