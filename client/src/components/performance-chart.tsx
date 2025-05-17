import { Card, CardContent } from "@/components/ui/card";
import { Metric } from "@shared/schema";
import { formatDateForDisplay } from "@/lib/date-utils";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";

interface PerformanceChartProps {
  data: Metric[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  // Process data to group by months
  const processDataByMonth = (metrics: Metric[]) => {
    const monthlyData = metrics.reduce((acc: any, metric) => {
      const date = new Date(metric.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: new Date(date.getFullYear(), date.getMonth(), 1),
          invitesSent: 0,
          acceptanceRatio: 0,
          count: 0
        };
      }

      acc[monthKey].invitesSent += metric.invitesSent;
      acc[monthKey].acceptanceRatio += metric.acceptanceRatio;
      acc[monthKey].count += 1;

      return acc;
    }, {});

    // Calculate averages and format data
    return Object.values(monthlyData).map((item: any) => ({
      month: formatDateForDisplay(item.month, { month: 'short', year: 'numeric' }),
      invitesSent: item.invitesSent,
      acceptanceRatio: +(item.acceptanceRatio / item.count).toFixed(1)
    })).sort((a: any, b: any) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  };

  const chartData = processDataByMonth(data);

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-700">Performance Over Time (Yearly View)</h3>
        </div>

        <div className="h-80">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center flex-col">
              <p className="text-lg text-gray-400 mb-2">No data available</p>
              <p className="text-sm text-gray-400">Refresh to load data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Invites Sent', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Acceptance Ratio (%)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="invitesSent"
                  fill="#0077B5"
                  name="Invites Sent"
                />
                <Bar
                  yAxisId="right"
                  dataKey="acceptanceRatio"
                  fill="#00A0DC"
                  name="Acceptance Ratio (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}