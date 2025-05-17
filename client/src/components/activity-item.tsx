import { Activity } from "@shared/schema";
import { formatTimeAgo } from "@/lib/date-utils";
import { Check, Users, RefreshCw, AlertTriangle, Bot } from "lucide-react";

interface ActivityItemProps {
  activity: Activity;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  // Determine the icon and color based on activity type
  const getIconConfig = (type: string) => {
    switch (type) {
      case "invite_sent":
        return { 
          icon: <Users size={14} />, 
          bgColor: "bg-blue-50", 
          textColor: "text-blue-500" 
        };
      case "invite_accepted":
        return { 
          icon: <Check size={14} />, 
          bgColor: "bg-green-50", 
          textColor: "text-green-500" 
        };
      case "refresh":
        return { 
          icon: <RefreshCw size={14} />, 
          bgColor: "bg-indigo-50", 
          textColor: "text-indigo-500" 
        };
      case "warning":
        return { 
          icon: <AlertTriangle size={14} />, 
          bgColor: "bg-yellow-50", 
          textColor: "text-amber-500" 
        };
      case "agent":
        return { 
          icon: <Bot size={14} />, 
          bgColor: "bg-blue-50", 
          textColor: "text-blue-500" 
        };
      default:
        return { 
          icon: <RefreshCw size={14} />, 
          bgColor: "bg-gray-50", 
          textColor: "text-gray-500" 
        };
    }
  };
  
  const { icon, bgColor, textColor } = getIconConfig(activity.type);
  const timeAgo = formatTimeAgo(new Date(activity.timestamp));
  
  return (
    <div className="flex items-start">
      <div className={`p-2 ${bgColor} ${textColor} rounded-full mr-3`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-700 font-medium">{activity.message}</p>
        <p className="text-xs text-gray-500">{timeAgo}</p>
      </div>
    </div>
  );
}
