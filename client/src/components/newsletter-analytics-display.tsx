import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import MetricCard from "./metric-card";
import { useQuery } from "@tanstack/react-query";

// Type for newsletter analytics data
interface NewsletterAnalytics {
  id: number;
  campaign_id: string;
  campaign_name: string;
  campaign_date: string;
  campaign_type: string;
  subject: string;
  list_name: string;
  emails_sent: number;
  hard_bounces: number;
  soft_bounces: number;
  total_bounces: number;
  opens_total: number;
  unique_opens: number;
  clicks_total: number;
  unique_clicks: number;
  unique_subscriber_clicks: number;
  open_rate: number;
  click_rate: number;
  click_to_open_rate: number;
  unsubscribes: number;
  send_time: string;
  day_of_week: string;
}

export default function NewsletterAnalyticsDisplay() {
  const { data: latestCampaign, isLoading: isLatestLoading } = useQuery<NewsletterAnalytics>({
    queryKey: ["/api/newsletter-analytics/latest"],
    refetchOnWindowFocus: false,
  });

  const { data: allCampaigns, isLoading: isAllLoading } = useQuery<NewsletterAnalytics[]>({
    queryKey: ["/api/newsletter-analytics"],
    refetchOnWindowFocus: false,
  });

  // Format percentages for display
  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(2) + "%";
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLatestLoading || isAllLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium">Loading newsletter analytics...</h3>
          <p className="text-muted-foreground">Please wait while we fetch the data.</p>
        </div>
      </div>
    );
  }

  if (!latestCampaign) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium">No newsletter data available</h3>
          <p className="text-muted-foreground">Try sending a campaign first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Newsletter Analytics</h2>
        <p className="text-muted-foreground">
          Track performance metrics for your email newsletters. New campaigns are sent every Monday, Wednesday, and Friday at 5 PM EST.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Emails Sent"
              value={latestCampaign.emails_sent}
              icon="paper-plane"
              change={0}
              color="blue"
              progressValue={100}
            />
            <MetricCard
              title="Open Rate"
              value={formatPercentage(latestCampaign.open_rate)}
              icon="user-check"
              change={latestCampaign.open_rate > 0.2 ? 12 : -5}
              color="green"
              progressValue={latestCampaign.open_rate * 100}
            />
            <MetricCard
              title="Click Rate"
              value={formatPercentage(latestCampaign.click_rate)}
              icon="mouse-pointer"
              change={latestCampaign.click_rate > 0.01 ? 8 : -2}
              color="purple"
              progressValue={latestCampaign.click_rate * 100}
            />
            <MetricCard
              title="Bounce Rate"
              value={formatPercentage(latestCampaign.total_bounces / latestCampaign.emails_sent)}
              icon="alert-circle"
              change={-3}
              color="amber"
              progressValue={(latestCampaign.total_bounces / latestCampaign.emails_sent) * 100}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Latest Campaign</CardTitle>
                <CardDescription>
                  {latestCampaign.subject} • {formatDate(latestCampaign.send_time)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Campaign ID:</span>
                      </div>
                      <span>{latestCampaign.campaign_id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">List:</span>
                      </div>
                      <span>{latestCampaign.list_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Day Sent:</span>
                      </div>
                      <span>{latestCampaign.day_of_week}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Type:</span>
                      </div>
                      <span className="capitalize">{latestCampaign.campaign_type}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Statistics</CardTitle>
                <CardDescription>Metrics for the latest campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Delivered:</span>
                      </div>
                      <span>{latestCampaign.emails_sent - latestCampaign.total_bounces}</span>
                    </div>
                    <Progress value={(latestCampaign.emails_sent - latestCampaign.total_bounces) / latestCampaign.emails_sent * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Hard Bounces:</span>
                      </div>
                      <span>{latestCampaign.hard_bounces}</span>
                    </div>
                    <Progress value={latestCampaign.hard_bounces / latestCampaign.emails_sent * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Soft Bounces:</span>
                      </div>
                      <span>{latestCampaign.soft_bounces}</span>
                    </div>
                    <Progress value={latestCampaign.soft_bounces / latestCampaign.emails_sent * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Open Activity</CardTitle>
                <CardDescription>Details about email opens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Total Opens:</span>
                      </div>
                      <span>{latestCampaign.opens_total}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Unique Opens:</span>
                      </div>
                      <span>{latestCampaign.unique_opens}</span>
                    </div>
                    <Progress 
                      value={latestCampaign.unique_opens / latestCampaign.emails_sent * 100} 
                      className="h-2 bg-gradient-to-r from-blue-200 to-blue-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Open Rate:</span>
                      </div>
                      <span>{formatPercentage(latestCampaign.open_rate)}</span>
                    </div>
                    <Progress 
                      value={latestCampaign.open_rate * 100} 
                      className="h-2 bg-gradient-to-r from-green-200 to-green-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Click Activity</CardTitle>
                <CardDescription>Details about link clicks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Total Clicks:</span>
                      </div>
                      <span>{latestCampaign.clicks_total}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Unique Clicks:</span>
                      </div>
                      <span>{latestCampaign.unique_clicks}</span>
                    </div>
                    <Progress 
                      value={latestCampaign.unique_clicks / latestCampaign.emails_sent * 100} 
                      className="h-2 bg-gradient-to-r from-indigo-200 to-indigo-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Click-to-Open Rate:</span>
                      </div>
                      <span>{formatPercentage(latestCampaign.click_to_open_rate)}</span>
                    </div>
                    <Progress 
                      value={latestCampaign.click_to_open_rate * 100} 
                      className="h-2 bg-gradient-to-r from-purple-200 to-purple-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subscriber Engagement</CardTitle>
              <CardDescription>How subscribers interacted with your campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <h3 className="text-sm font-medium">Unique Subscriber Clicks</h3>
                    </div>
                    <div className="text-2xl font-bold">{latestCampaign.unique_subscriber_clicks}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(latestCampaign.unique_subscriber_clicks / latestCampaign.emails_sent)} of subscribers
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <h3 className="text-sm font-medium">Unsubscribes</h3>
                    </div>
                    <div className="text-2xl font-bold">{latestCampaign.unsubscribes}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(latestCampaign.unsubscribes / latestCampaign.emails_sent)} of subscribers
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <h3 className="text-sm font-medium">Bounces</h3>
                    </div>
                    <div className="text-2xl font-bold">{latestCampaign.total_bounces}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(latestCampaign.total_bounces / latestCampaign.emails_sent)} of emails
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign History</CardTitle>
              <CardDescription>All your newsletter campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {allCampaigns && allCampaigns.length > 0 ? (
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-left text-sm font-medium">Campaign</th>
                        <th className="py-2 px-4 text-left text-sm font-medium">Date</th>
                        <th className="py-2 px-4 text-left text-sm font-medium">Sent</th>
                        <th className="py-2 px-4 text-left text-sm font-medium">Opens</th>
                        <th className="py-2 px-4 text-left text-sm font-medium">Clicks</th>
                        <th className="py-2 px-4 text-left text-sm font-medium">Open Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b last:border-b-0 hover:bg-muted/50">
                          <td className="py-2 px-4 text-sm">
                            <div className="font-medium">{campaign.subject}</div>
                            <div className="text-xs text-muted-foreground">{campaign.campaign_id}</div>
                          </td>
                          <td className="py-2 px-4 text-sm">{formatDate(campaign.send_time)}</td>
                          <td className="py-2 px-4 text-sm">{campaign.emails_sent}</td>
                          <td className="py-2 px-4 text-sm">{campaign.unique_opens}</td>
                          <td className="py-2 px-4 text-sm">{campaign.unique_clicks}</td>
                          <td className="py-2 px-4 text-sm">{formatPercentage(campaign.open_rate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>No campaign history found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}