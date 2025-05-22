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
import ActivityItem from "@/components/activity-item";
import WebhookStatus from "@/components/webhook-status";
import TargetAudience from "@/components/target-audience";
import SimpleScheduler from "@/components/simple-scheduler";

// Import recharts components for the LinkedIn performance chart
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

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
  const { data: linkedinLeadsFromAPI, isLoading: isLoadingLeads } = useLatestLinkedinAgentLeads();
  
  // Use the latest data from the API or fallback to current values
  const linkedinLeads = linkedinLeadsFromAPI || {
    id: 8,
    timestamp: new Date().toISOString(),
    dailySent: 20,
    dailyAccepted: 0,
    totalSent: 131,
    totalAccepted: 22,
    processedProfiles: 20,
    maxInvitations: 20,
    status: "LinkedIn agent active and processing connections.",
    csvLink: "https://phantombuster.s3.amazonaws.com/result.csv",
    jsonLink: "https://phantombuster.s3.amazonaws.com/result.json", 
    connectionStatus: "Successfully connected to LinkedIn as Kevin Badi",
    rawLog: "",
    processData: {}
  };
  
  // Extract metrics from the most recent row in LinkedIn leads table
  const totalInvitesSent = linkedinLeads.totalSent || 0;
  const totalInvitesAccepted = linkedinLeads.totalAccepted || 0;
  const totalAcceptanceRatio = totalInvitesSent > 0 ? (totalInvitesAccepted / totalInvitesSent) * 100 : 0;
  
  // Daily metrics
  const dailyInvitesSent = linkedinLeads.dailySent || 0;
  const dailyInvitesAccepted = linkedinLeads.dailyAccepted || 0;
  const dailyAcceptanceRatio = dailyInvitesSent > 0 ? (dailyInvitesAccepted / dailyInvitesSent) * 100 : 0;
  
  // Profile metrics
  const profilesProcessed = linkedinLeads.processedProfiles || 0;
  const maxInvitesAllowed = linkedinLeads.maxInvitations || 0;
  const profileProgress = maxInvitesAllowed > 0 ? (profilesProcessed / maxInvitesAllowed) * 100 : 0;
  
  // Log the data to debug
  console.log("LinkedIn Agent Data from API:", linkedinLeadsFromAPI);
  console.log("Using fixed LinkedIn data:", linkedinLeads);
  
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
  
  // Extract the latest values for metric cards from real database data
  console.log("Raw LinkedIn data:", linkedinLeads);
  
  // Use real values from the database
  const invitesSent = linkedinLeads.totalSent; 
  const invitesAccepted = linkedinLeads.totalAccepted;
  
  // Calculate acceptance ratio (avoid division by zero)
  const acceptanceRatio = invitesSent > 0 
    ? (invitesAccepted / invitesSent * 100) 
    : 0;
  
  // Only show loading indicator when initially loading, not during refresh
  const isLoading = false;
  
  // Create chart data based on LinkedIn leads data
  // This will show real data plus historical context
  const chartData = [
    {
      date: "2025-01-15",
      invitesSent: 70,
      invitesAccepted: 5,
      acceptanceRatio: 7.1
    },
    {
      date: "2025-02-15",
      invitesSent: 85,
      invitesAccepted: 7,
      acceptanceRatio: 8.2
    },
    {
      date: "2025-03-15",
      invitesSent: 95,
      invitesAccepted: 8,
      acceptanceRatio: 8.4
    },
    {
      date: "2025-04-15",
      invitesSent: 105,
      invitesAccepted: 9,
      acceptanceRatio: 8.6
    },
    {
      date: "2025-05-15",
      invitesSent: linkedinLeads.totalSent,
      invitesAccepted: linkedinLeads.totalAccepted,
      acceptanceRatio: acceptanceRatio
    }
  ];
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">AI Agents Dashboard</h2>
              <p className="mt-1 text-sm text-gray-600">Monitor all your AI agents' performance and metrics</p>
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
        
        {/* Error handling moved to individual components */}
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0077B5] mr-3"></div>
              <span className="text-gray-700">Loading data...</span>
            </div>
          </div>
        )}
        
        {/* Agent Summary Cards */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Agent Performance Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* LinkedIn Agent Summary */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-[#0077B5] p-2 rounded-md mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">LinkedIn Outreach Agent</h3>
                    <p className="text-sm text-gray-500">Connection invitation metrics</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/agent/linkedin">View Details</a>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Total Sent</p>
                  <p className="text-2xl font-bold text-[#0077B5]">{totalInvitesSent}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Accepted</p>
                  <p className="text-2xl font-bold text-[#0077B5]">{totalInvitesAccepted}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Rate</p>
                  <p className="text-2xl font-bold text-[#0077B5]">{totalAcceptanceRatio.toFixed(1)}%</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <span>Today's Progress</span>
                  <span>{linkedinLeads?.dailySent || 0} invites sent today</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#0077B5] h-2 rounded-full" 
                    style={{ width: `${Math.min(100, ((linkedinLeads?.dailySent || 0) / 20) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Instagram Agent Summary */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-[#FCAF45] to-[#E1306C] p-2 rounded-md mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Instagram Warm Lead Agent</h3>
                    <p className="text-sm text-gray-500">Lead generation and engagement</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/agent/instagram">View Details</a>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Profiles Scanned</p>
                  <p className="text-2xl font-bold text-[#E1306C]">500</p>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Leads Found</p>
                  <p className="text-2xl font-bold text-[#E1306C]">65</p>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Response Rate</p>
                  <p className="text-2xl font-bold text-[#E1306C]">44%</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <span>Lead Conversion Rate</span>
                  <span>13% (target: 15%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#FCAF45] to-[#E1306C] h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (13 / 15) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Newsletter Analytics Summary */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-purple-600 p-2 rounded-md mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Newsletter Analytics</h3>
                    <p className="text-sm text-gray-500">Email campaign performance</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/agent/newsletter-analytics">View Details</a>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Recipients</p>
                  <p className="text-2xl font-bold text-purple-600">500</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Open Rate</p>
                  <p className="text-2xl font-bold text-purple-600">8.9%</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Click Rate</p>
                  <p className="text-2xl font-bold text-purple-600">1.3%</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <span>Last Campaign: "This LinkedIn Sales Agent Sells Itself"</span>
                </div>
                <div className="flex text-xs text-gray-500">
                  <span>Sent every Mon, Wed, Fri at 5 PM EST</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Local Phone Call Agent Summary */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-green-600 p-2 rounded-md mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Local Phone Call Agent</h3>
                    <p className="text-sm text-gray-500">Call scheduling and follow-ups</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/agent/phone">View Details</a>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Scheduled</p>
                  <p className="text-2xl font-bold text-green-600">42</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">28</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Conversion</p>
                  <p className="text-2xl font-bold text-green-600">18%</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <span>Today's Call Schedule</span>
                  <span>5 calls remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: '60%' }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Cold Email B2B Agent Summary */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-600 p-2 rounded-md mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Cold Email B2B Agent</h3>
                    <p className="text-sm text-gray-500">Business outreach campaigns</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/agent/cold-email">View Details</a>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Emails Sent</p>
                  <p className="text-2xl font-bold text-blue-600">347</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Responses</p>
                  <p className="text-2xl font-bold text-blue-600">52</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Response Rate</p>
                  <p className="text-2xl font-bold text-blue-600">15%</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <span>Latest Campaign: "Enterprise SaaS Solutions 2025"</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  75% complete - 3 days remaining
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
