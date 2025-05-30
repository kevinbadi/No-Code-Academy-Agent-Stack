import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Facebook, 
  Users, 
  MessageCircle, 
  DollarSign, 
  TrendingUp,
  RefreshCw,
  Calendar,
  Clock,
  Target,
  BarChart3
} from "lucide-react";

export default function FacebookAgentPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Mock data structure for now - you'll replace this with real data
  const mockData = {
    totalAgentsOnline: 12,
    totalConversations: 245,
    totalSales: 18500,
    dailyStats: {
      conversations: 24,
      sales: 3200,
      conversionRate: 13.1
    },
    monthlyTrend: [
      { month: "Jan", conversations: 180, sales: 12000 },
      { month: "Feb", conversations: 220, sales: 15500 },
      { month: "Mar", conversations: 245, sales: 18500 }
    ]
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 md:ml-56 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1877F2] to-[#4267B2] inline-block text-transparent bg-clip-text">
              Facebook Sales Manager
            </h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isLoading}
              className="border border-gray-200 hover:bg-gradient-to-r from-[#1877F2] to-[#4267B2] hover:text-white transition-all duration-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Agents Online */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1877F2] to-[#4267B2] p-1">
                <div className="bg-white dark:bg-gray-950 p-6">
                  <CardHeader className="pb-2 px-0">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#1877F2] to-[#4267B2] flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                        Online
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="space-y-1">
                      <p className="text-3xl font-bold bg-gradient-to-r from-[#1877F2] to-[#4267B2] text-transparent bg-clip-text">
                        {mockData.totalAgentsOnline}
                      </p>
                      <p className="text-sm text-gray-600">Total Facebook Agents Online</p>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>

            {/* Total Conversations */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-[#4267B2] to-[#6A7EC8] p-1">
                <div className="bg-white dark:bg-gray-950 p-6">
                  <CardHeader className="pb-2 px-0">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#4267B2] to-[#6A7EC8] flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="space-y-1">
                      <p className="text-3xl font-bold bg-gradient-to-r from-[#4267B2] to-[#6A7EC8] text-transparent bg-clip-text">
                        {mockData.totalConversations.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Conversations Made</p>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>

            {/* Total Sales */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-[#6A7EC8] to-[#1877F2] p-1">
                <div className="bg-white dark:bg-gray-950 p-6">
                  <CardHeader className="pb-2 px-0">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#6A7EC8] to-[#1877F2] flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                        Revenue
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="space-y-1">
                      <p className="text-3xl font-bold bg-gradient-to-r from-[#6A7EC8] to-[#1877F2] text-transparent bg-clip-text">
                        ${mockData.totalSales.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Sales Generated</p>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1877F2] to-[#4267B2] p-1">
              <div className="bg-white dark:bg-gray-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-[#1877F2] to-[#4267B2] inline-block text-transparent bg-clip-text">
                    <span className="flex items-center">
                      <Facebook className="h-5 w-5 mr-3 text-[#1877F2]" />
                      Facebook Sales Analytics
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-gray-100/70 p-1 rounded-lg grid grid-cols-3 gap-1">
                      <TabsTrigger 
                        value="overview" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1877F2] data-[state=active]:to-[#4267B2] data-[state=active]:text-white"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="performance" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1877F2] data-[state=active]:to-[#4267B2] data-[state=active]:text-white"
                      >
                        Performance
                      </TabsTrigger>
                      <TabsTrigger 
                        value="agents" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1877F2] data-[state=active]:to-[#4267B2] data-[state=active]:text-white"
                      >
                        Agent Status
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Today's Stats */}
                        <div className="p-6 rounded-lg bg-gradient-to-br from-[#1877F211] to-[#4267B211] border border-[#1877F233]">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Today's Performance</h3>
                            <Calendar className="h-5 w-5 text-[#1877F2]" />
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Conversations</span>
                              <span className="font-semibold text-[#1877F2]">{mockData.dailyStats.conversations}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Sales</span>
                              <span className="font-semibold text-[#4267B2]">${mockData.dailyStats.sales.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Conversion Rate</span>
                              <span className="font-semibold text-green-600">{mockData.dailyStats.conversionRate}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Real-time Activity */}
                        <div className="p-6 rounded-lg bg-gradient-to-br from-[#4267B211] to-[#6A7EC811] border border-[#4267B233]">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Real-time Activity</h3>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600">Live</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-[#1877F2] rounded-full"></div>
                              <span className="text-sm text-gray-600">New conversation started</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Sale completed: $850</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-[#4267B2] rounded-full"></div>
                              <span className="text-sm text-gray-600">Agent responded to inquiry</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-6 rounded-lg bg-gradient-to-br from-[#6A7EC811] to-[#1877F211] border border-[#6A7EC833]">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Quick Actions</h3>
                            <Target className="h-5 w-5 text-[#1877F2]" />
                          </div>
                          <div className="space-y-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white"
                            >
                              View Active Conversations
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-[#4267B2] text-[#4267B2] hover:bg-[#4267B2] hover:text-white"
                            >
                              Check Agent Performance
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-[#6A7EC8] text-[#6A7EC8] hover:bg-[#6A7EC8] hover:text-white"
                            >
                              Generate Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="performance" className="mt-6">
                      <div className="text-center py-12">
                        <BarChart3 className="h-12 w-12 text-[#1877F2] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#1877F2] to-[#4267B2] inline-block text-transparent bg-clip-text mb-2">
                          Performance Analytics
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Detailed performance metrics and conversion analytics will be displayed here.
                        </p>
                        <Button 
                          variant="outline" 
                          className="border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white"
                        >
                          View Detailed Analytics
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="agents" className="mt-6">
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-[#4267B2] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#1877F2] to-[#4267B2] inline-block text-transparent bg-clip-text mb-2">
                          Agent Management
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Monitor and manage all Facebook sales agents from this dashboard.
                        </p>
                        <Button 
                          variant="outline" 
                          className="border-[#4267B2] text-[#4267B2] hover:bg-[#4267B2] hover:text-white"
                        >
                          Manage Agents
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}