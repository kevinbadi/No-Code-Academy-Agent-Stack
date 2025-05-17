import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Send, UserCheck, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type IconType = "paper-plane" | "user-check" | "percentage";

interface MetricCardProps {
  title: string;
  value: number | string;
  debugData?: any; // Optional debug data
  suffix?: string;
  icon: IconType;
  change: number;
  color: string;
  progressValue: number;
  isLoading?: boolean;
}

export default function MetricCard({
  title,
  value,
  suffix = "",
  icon,
  change,
  color,
  progressValue,
  isLoading = false,
}: MetricCardProps) {
  const isPositiveChange = change >= 0;
  
  // Map icon type to component
  const IconComponent = () => {
    switch (icon) {
      case "paper-plane":
        return <Send size={18} />;
      case "user-check":
        return <UserCheck size={18} />;
      case "percentage":
        return <Percent size={18} />;
      default:
        return <Send size={18} />;
    }
  };
  
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
          <div className="p-2 bg-blue-50 rounded-full" style={{ color }}>
            <IconComponent />
          </div>
        </div>
        
        <div className="flex items-baseline">
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <span className="text-3xl font-bold text-gray-800">
                {value}
                {suffix}
              </span>
              <span className={`ml-2 text-sm font-medium flex items-center ${
                isPositiveChange ? "text-green-500" : "text-red-500"
              }`}>
                {isPositiveChange ? (
                  <ArrowUp className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3" />
                )}
                {Math.abs(change)}%
              </span>
            </>
          )}
        </div>
        
        <p className="mt-1 text-sm text-gray-500">Compared to last period</p>
        
        {isLoading ? (
          <Skeleton className="h-1.5 w-full mt-4" />
        ) : (
          <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${Math.min(100, progressValue)}%`,
                backgroundColor: color,
              }}
            ></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
