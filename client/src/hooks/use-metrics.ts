import { useQuery, useMutation } from "@tanstack/react-query";
import { Metric, Activity } from "@shared/schema";
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
      // Using the correct apiRequest format
      return await apiRequest('/api/trigger-agent-webhook', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      console.log("Webhook triggered successfully:", data);
      
      // Invalidate all relevant queries to refresh the dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/latest'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/range'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      
      return data;
    },
  });
}
