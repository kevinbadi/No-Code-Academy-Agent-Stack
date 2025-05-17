import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const audienceSegments = [
  { name: "Startup Founders", percentage: 65 },
  { name: "Marketing Directors", percentage: 22 },
  { name: "Finance", percentage: 8 },
  { name: "Education", percentage: 5 },
];

const tags = [
  "Startup Founders",
  "Tech Entrepreneurs",
  "Marketing Directors",
  "Product Managers",
  "SaaS Companies",
];

export default function TargetAudience() {
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-700">Target Audience</h3>
          <button className="text-[#0077B5] hover:text-[#005e8b]">
            <Settings size={18} />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="space-y-4">
          {audienceSegments.map((segment) => (
            <div key={segment.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">{segment.name}</span>
                <span className="text-sm font-medium text-gray-700">{segment.percentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-[#0077B5] h-2 rounded-full" 
                  style={{ width: `${segment.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
