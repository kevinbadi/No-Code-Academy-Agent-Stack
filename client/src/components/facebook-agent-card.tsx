import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Facebook, Users, MessageCircle, DollarSign, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function FacebookAgentCard() {
  // These will be replaced with real data from your backend
  const mockData = {
    totalAgentsOnline: 12,
    totalConversations: 245,
    totalSales: 18500,
    status: "active",
    lastUpdated: "2 minutes ago"
  };

  return (
    <Card className="h-full shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="bg-gradient-to-r from-[#1877F2] to-[#4267B2] p-1">
        <div className="bg-white dark:bg-gray-950 h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1877F2] to-[#4267B2] flex items-center justify-center">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-[#1877F2] to-[#4267B2] text-transparent bg-clip-text">
                    Facebook Sales Manager
                  </CardTitle>
                  <p className="text-sm text-gray-500">AI-powered sales automation</p>
                </div>
              </div>
              <Badge 
                className={`${
                  mockData.status === 'active' 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {mockData.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-4">
              {/* Total Agents Online */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#1877F211] to-[#4267B211]">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#1877F2] to-[#4267B2] flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Agents Online</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-[#1877F2] to-[#4267B2] text-transparent bg-clip-text">
                      {mockData.totalAgentsOnline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Conversations */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#4267B211] to-[#6A7EC811]">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#4267B2] to-[#6A7EC8] flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conversations</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-[#4267B2] to-[#6A7EC8] text-transparent bg-clip-text">
                      {mockData.totalConversations.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Sales */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#6A7EC811] to-[#1877F211]">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#6A7EC8] to-[#1877F2] flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-[#6A7EC8] to-[#1877F2] text-transparent bg-clip-text">
                      ${mockData.totalSales.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Indicator */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Last updated: {mockData.lastUpdated}</span>
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12% this week</span>
              </div>
            </div>

            {/* Action Button */}
            <Link href="/agent/facebook">
              <Button 
                className="w-full bg-gradient-to-r from-[#1877F2] to-[#4267B2] hover:from-[#1877F2]/90 hover:to-[#4267B2]/90 text-white"
              >
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}