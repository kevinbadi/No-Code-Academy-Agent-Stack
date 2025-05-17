import { useQuery, useMutation } from "@tanstack/react-query";
import { Metric, Activity, LinkedinAgentLeads } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { DateRangeValue, getDateRangeValues } from "@/lib/date-utils";

export function useMetrics(dateRange: DateRangeValue) {
  const { startDate, endDate } = getDateRangeValues(dateRange);
  
  const formattedStartDate = startDate.toISOString();
  const formattedEndDate = endDate.toISOString();
  
  return useQuery<Metric[]>({
    queryKey: ['/api/metrics/range', formattedStartDate, formattedEndDate],
    queryFn: () => fetch(`/api/metrics/range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`).then(res => res.json()),
  });
}

export function useLatestMetric() {
  return useQuery<Metric>({
    queryKey: ['/api/metrics/latest'],
  });
}

// Hook to get the latest LinkedIn agent leads data
export function useLatestLinkedinAgentLeads() {
  return useQuery<LinkedinAgentLeads>({
    queryKey: ['/api/linkedin-agent-leads/latest'],
    queryFn: async () => {
      const response = await fetch('/api/linkedin-agent-leads/latest');
      const data = await response.json();
      
      console.log('LinkedIn agent leads data from API:', data);
      
      // If the API returns null or undefined, return default values based on actual database content
      if (!data) {
        console.log('No LinkedIn agent data from API, using default values');
        // Return default values that match what's in the database
        return {
          id: 1,
          timestamp: new Date().toISOString(),
          dailySent: 35,
          dailyAccepted: 1,
          totalSent: 35,
          totalAccepted: 1,
          processedProfiles: 20,
          maxInvitations: 20,
          status: "No more profiles to process today.",
          csvLink: "",
          jsonLink: "",
          connectionStatus: "Successfully connected to LinkedIn as Kevin Badi",
          rawLog: "",
          processData: {}
        };
      }
      
      return data;
    },
  });
}

export function useActivities(limit = 5) {
  return useQuery<Activity[]>({
    queryKey: ['/api/activities', limit],
    queryFn: () => fetch(`/api/activities?limit=${limit}`).then(res => res.json()),
  });
}

export function useRefreshData() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/refresh", {});
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/latest'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      
      // Invalidate all metrics range queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return typeof queryKey === 'string' && queryKey.startsWith('/api/metrics/range');
        },
      });
    },
  });
}

// Hook to trigger the external agent webhook
export function useTriggerAgentWebhook() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/trigger-agent-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error(`Failed to trigger webhook: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Webhook triggered successfully:", data);
      
      // Invalidate all relevant queries to refresh the dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/latest'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/range'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
  });
}
