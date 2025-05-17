import { Card, CardContent } from "@/components/ui/card";
import { Metric } from "@shared/schema";
import { formatDateForDisplay } from "@/lib/date-utils";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";

interface ChartPeriod {
  label: string;
  value: "daily" | "weekly" | "monthly";
}

const CHART_PERIODS: ChartPeriod[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" }
];

interface PerformanceChartProps {
  data: Metric[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const [period, setPeriod] = useState<ChartPeriod["value"]>("daily");
  
  // Sort data by date (oldest to newest)
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Format the chart data
  const chartData = sortedData.map(metric => ({
    date: formatDateForDisplay(new Date(metric.date)),
    invitesSent: metric.invitesSent,
    invitesAccepted: metric.invitesAccepted,
    acceptanceRatio: metric.acceptanceRatio
  }));
  
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-700">Performance Over Time</h3>
          <div className="flex space-x-2">
            {CHART_PERIODS.map((chartPeriod) => (
              <Button
                key={chartPeriod.value}
                onClick={() => setPeriod(chartPeriod.value)}
                variant={period === chartPeriod.value ? "default" : "outline"}
                size="sm"
                className={
                  period === chartPeriod.value 
                    ? "bg-[#0077B5] hover:bg-[#005e8b] text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-none"
                }
              >
                {chartPeriod.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="h-80">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center flex-col">
              <p className="text-lg text-gray-400 mb-2">No data available</p>
              <p className="text-sm text-gray-400">Refresh to load data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickMargin={10}
                  yAxisId="left"
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickMargin={10}
                  orientation="right"
                  yAxisId="right"
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="invitesSent"
                  stroke="#0077B5"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="Invites Sent"
                  dot={{ strokeWidth: 2 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="invitesAccepted"
                  stroke="#00A0DC"
                  strokeWidth={2}
                  name="Invites Accepted"
                  dot={{ strokeWidth: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="acceptanceRatio"
                  stroke="#0A66C2"
                  strokeWidth={2}
                  name="Acceptance Ratio (%)"
                  dot={{ strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
