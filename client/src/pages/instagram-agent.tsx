import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";
import InstagramWarmLeadAgent from "@/components/instagram-agent";

export default function InstagramAgentPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 md:ml-56 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Instagram Warm Lead Agent</h1>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <InstagramWarmLeadAgent />
          </div>
        </div>
      </div>
    </div>
  );
}