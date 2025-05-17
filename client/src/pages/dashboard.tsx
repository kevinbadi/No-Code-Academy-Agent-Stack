import { useState } from "react";
import { useMetrics, useLatestMetric, useActivities, useRefreshData, useLatestLinkedinAgentLeads } from "@/hooks/use-metrics";
import { DateRangeValue, DATE_RANGES, getDateRangeValues } from "@/lib/date-utils";
import { useQuery } from "@tanstack/react-query";
import { Metric, Activity, LinkedinAgentLeads } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import MetricCard from "@/components/metric-card";
import PerformanceChart from "@/components/performance-chart";
import ActivityItem from "@/components/activity-item";
import WebhookStatus from "@/components/webhook-status";
import TargetAudience from "@/components/target-audience";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRangeValue>("7days");
  const { toast } = useToast();
  
  // Use staleTime to prevent continuous requests
  const { data: metrics, isLoading: isLoadingMetrics, error: metricsError } = useQuery<Metric[]>({
    queryKey: ['/api/metrics/range', dateRange],
    queryFn: () => {
      const { startDate, endDate } = getDateRangeValues(dateRange);
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();
      return fetch(`/api/metrics/range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`).then(res => res.json());
    },
    staleTime: 30000, // 30 seconds
  });
  
  const { data: latestMetric, isLoading: isLoadingLatest } = useQuery<Metric>({
    queryKey: ['/api/metrics/latest'],
    staleTime: 30000, // 30 seconds
  });
  
  // Get the latest LinkedIn agent leads data from the PostgreSQL database
  const { data: linkedinLeads, isLoading: isLoadingLeads } = useLatestLinkedinAgentLeads();
  
  // Log the data to debug
  console.log("LinkedIn Agent Data from DB:", linkedinLeads);
  
  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ['/api/activities', 5],
    queryFn: () => fetch(`/api/activities?limit=5`).then(res => res.json()),
    staleTime: 30000, // 30 seconds
  });
  
  const { mutate: refreshData, isPending: isRefreshing } = useRefreshData();
  
  const handleRefresh = () => {
    refreshData(undefined, {
      onSuccess: () => {
        toast({
          title: "Data refreshed",
          description: "The dashboard metrics have been updated with the latest data.",
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to refresh data",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      }
    });
  };
  
  // Extract the latest values for metric cards
  // Use the data from PostgreSQL for LinkedIn agent leads if available
  // Fall back to metrics data if LinkedIn leads data is not available
  const invitesSent = linkedinLeads?.totalSent || latestMetric?.invitesSent || 0;
  const invitesAccepted = linkedinLeads?.totalAccepted || latestMetric?.invitesAccepted || 0;
  
  // Calculate acceptance ratio (avoid division by zero)
  const acceptanceRatio = invitesSent > 0 
    ? (invitesAccepted / invitesSent * 100) 
    : latestMetric?.acceptanceRatio || 0;
  
  // Only show loading indicator when initially loading, not during refresh
  const isLoading = false; // Disabled to fix permanent loading overlay
  
  const chartData = metrics || [];
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">LinkedIn Outreach Dashboard</h2>
              <p className="mt-1 text-sm text-gray-600">Monitor your AI agent's performance and metrics</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Select
                value={dateRange}
                onValueChange={(value) => setDateRange(value as DateRangeValue)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="bg-[#0077B5] hover:bg-[#005e8b] text-white"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
        
        {/* Error Alert */}
        {metricsError && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">
                Failed to load metrics: {metricsError instanceof Error ? metricsError.message : "Unknown error"}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0077B5] mr-3"></div>
              <span className="text-gray-700">Loading data...</span>
            </div>
          </div>
        )}
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Invites Sent"
            value={invitesSent}
            icon="paper-plane"
            change={12.5} // Example value
            color="#0077B5"
            progressValue={85}
            isLoading={isLoadingLatest || isLoadingLeads}
          />
          
          <MetricCard
            title="Total Invites Accepted"
            value={invitesAccepted}
            icon="user-check"
            change={8.3} // Example value
            color="#00A0DC"
            progressValue={65}
            isLoading={isLoadingLatest || isLoadingLeads}
          />
          
          <MetricCard
            title="Acceptance Ratio"
            value={acceptanceRatio.toFixed(1)}
            suffix="%"
            icon="percentage"
            change={-2.1} // Example value
            color="#0A66C2"
            progressValue={Math.min(100, acceptanceRatio)}
            isLoading={isLoadingLatest || isLoadingLeads}
          />
        </div>
        
        {/* Chart and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PerformanceChart data={chartData} />
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-700">Recent Activity</h3>
                <button className="text-[#0077B5] hover:text-[#005e8b] text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {isLoadingActivities ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-start">
                      <div className="w-8 h-8 bg-gray-100 rounded-full mr-3 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : activities?.length ? (
                  activities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Target Audience and Webhook Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TargetAudience />
          <WebhookStatus />
        </div>
        
        {/* Attribution */}
        <div className="mt-8 text-xs text-gray-500 text-center">
          <p>© 2023 LinkedIn Outreach AI Agent Dashboard. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
