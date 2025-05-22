import React from 'react';
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, Users, MousePointer, AlertCircle } from "lucide-react";

// This is a display of the real LinkedIn sales agent campaign data from your database
export default function NewsletterStats() {
  // Only showing the real LinkedIn sales agent campaign data
  const campaignData = [
    {
      id: 8,
      campaign_name: "kevinbadi@nocodeacademy.com",
      subject: "This Linkedin Sales Agent Sells Itself (Free CodeBase)",
      total_recipients: 500,
      emails_sent: 500,
      total_bounces: 27,
      opens_total: 48,
      clicks_total: 10,
      unsubscribes: 1,
      open_rate: 0.0888, // Formatted as 8.88%
      click_rate: 0.0127, // Formatted as 1.27%
      send_time: "2025-05-21",
    }
  ];

  // Format percentage for display
  const formatPercent = (value: number) => {
    return (value * 100).toFixed(2) + '%';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Newsletter Analytics Agent</h1>
          <p className="text-gray-500">
            This agent reports analytics from all email campaigns sent to our newsletter subscribers
            every Monday, Wednesday, and Friday at 5 PM EST.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-500">Total Emails Sent</h3>
              <p className="text-2xl font-bold">500</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-500">Total Recipients</h3>
              <p className="text-2xl font-bold">500</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <MousePointer className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-500">Open Rate</h3>
              <p className="text-2xl font-bold">8.88%</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-500">Click Rate</h3>
              <p className="text-2xl font-bold">1.27%</p>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Email Campaign Performance</CardTitle>
            <CardDescription>
              All email campaigns sent to our newsletter subscribers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 [&>th]:p-2 text-left">
                    <th>Campaign</th>
                    <th>Subject</th>
                    <th>Recipients</th>
                    <th>Bounces</th>
                    <th>Opens</th>
                    <th>Clicks</th>
                    <th>Unsubscribes</th>
                    <th>Open Rate</th>
                    <th>Click Rate</th>
                    <th>Sent Date</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignData.map((campaign) => (
                    <tr key={campaign.id} className="border-b [&>td]:p-2">
                      <td className="font-medium">{campaign.campaign_name}</td>
                      <td>{campaign.subject}</td>
                      <td>{campaign.total_recipients}</td>
                      <td>{campaign.total_bounces}</td>
                      <td>{campaign.opens_total}</td>
                      <td>{campaign.clicks_total}</td>
                      <td>{campaign.unsubscribes}</td>
                      <td>{formatPercent(campaign.open_rate)}</td>
                      <td>{formatPercent(campaign.click_rate)}</td>
                      <td>{formatDate(campaign.send_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaignData.map((campaign) => (
            <Card key={campaign.id} className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg">{campaign.subject}</CardTitle>
                <CardDescription>
                  {campaign.campaign_name} • {formatDate(campaign.send_time)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Recipients:</span>
                    <span className="font-medium">{campaign.total_recipients}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Bounces:</span>
                    <span className="font-medium">{campaign.total_bounces}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Opens:</span>
                    <span className="font-medium">{campaign.opens_total}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Clicks:</span>
                    <span className="font-medium">{campaign.clicks_total}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Unsubscribes:</span>
                    <span className="font-medium">{campaign.unsubscribes}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between bg-blue-50">
                    <span className="text-sm font-medium text-blue-700">Open Rate:</span>
                    <span className="font-bold text-blue-700">{formatPercent(campaign.open_rate)}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between bg-green-50">
                    <span className="text-sm font-medium text-green-700">Click Rate:</span>
                    <span className="font-bold text-green-700">{formatPercent(campaign.click_rate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}