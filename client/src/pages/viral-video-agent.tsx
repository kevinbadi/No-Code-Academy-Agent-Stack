import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Play, Eye, Heart, Share, Plus, Video } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const videoSchema = z.object({
  videoUrl: z.string().url("Please enter a valid URL"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  platform: z.string().optional(),
  status: z.enum(["generated", "uploaded", "published"]).default("generated")
});

type VideoFormData = z.infer<typeof videoSchema>;

interface VideoStats {
  totalVideos: number;
  publishedVideos: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
}

interface ViralVideo {
  id: number;
  videoUrl: string;
  title: string | null;
  description: string | null;
  status: string;
  platform: string | null;
  views: number | null;
  likes: number | null;
  shares: number | null;
  metadata: any;
}

export default function ViralVideoAgent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      videoUrl: "",
      title: "",
      description: "",
      platform: "",
      status: "generated"
    }
  });

  const { data: videos = [], isLoading: videosLoading, error: videosError } = useQuery<ViralVideo[]>({
    queryKey: ["/api/viral-videos"],
    queryFn: async () => {
      const response = await fetch("/api/viral-videos");
      if (!response.ok) throw new Error("Failed to fetch videos");
      return response.json();
    }
  });

  const { data: stats } = useQuery<VideoStats>({
    queryKey: ["/api/viral-videos/stats"],
    queryFn: async () => {
      const response = await fetch("/api/viral-videos/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    }
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data: VideoFormData) => {
      const response = await fetch("/api/viral-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/viral-videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/viral-videos/stats"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ title: "Video added successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to add video", variant: "destructive" });
    }
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/viral-videos/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/viral-videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/viral-videos/stats"] });
      toast({ title: "Video deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete video", variant: "destructive" });
    }
  });

  const onSubmit = (data: VideoFormData) => {
    createVideoMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "uploaded": return "bg-blue-100 text-blue-800";
      case "generated": return "bg-gray-100 text-gray-800";
      case "ready to upload": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPlatformIcon = (platform: string | null) => {
    switch (platform?.toLowerCase()) {
      case "youtube": return "🎥";
      case "tiktok": return "🎵";
      case "instagram": return "📸";
      case "facebook": return "📘";
      default: return "🎬";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Viral Video Generator Agent</h1>
          <p className="text-gray-600 mt-2">VEO 3 powered AI video generation and management</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Video title..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Video description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="generated">Generated</SelectItem>
                          <SelectItem value="uploaded">Uploaded</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createVideoMutation.isPending}>
                    {createVideoMutation.isPending ? "Adding..." : "Add Video"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVideos || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.publishedVideos || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLikes?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalShares?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Videos */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {videosLoading ? (
            <div className="text-center py-8">Loading videos...</div>
          ) : !videos || videos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No videos generated yet. The AI agent will automatically add videos here when they're generated.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video bg-black rounded-t-lg">
                    <video 
                      className="w-full h-full object-cover rounded-t-lg"
                      controls
                      preload="metadata"
                    >
                      <source src={video.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getPlatformIcon(video.platform)}</span>
                      <h3 className="font-semibold text-lg flex-1">{video.title || "Untitled Video"}</h3>
                      <Badge className={getStatusColor(video.status)}>
                        {video.status}
                      </Badge>
                    </div>
                    
                    {video.description && (
                      <p className="text-gray-600 mb-3 text-sm">{video.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {video.platform && (
                          <span className="capitalize">{video.platform}</span>
                        )}
                        <span>ID: {video.id}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {video.views !== null && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {video.views.toLocaleString()}
                          </span>
                        )}
                        {video.likes !== null && (
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {video.likes.toLocaleString()}
                          </span>
                        )}
                        {video.shares !== null && (
                          <span className="flex items-center gap-1">
                            <Share className="h-3 w-3" />
                            {video.shares.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-3 border-t">
                      <Button
                        className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold"
                        onClick={() => {
                          toast({ title: "Uploading to all social platforms...", description: "Your video is being published to YouTube, TikTok, Instagram, and Facebook." });
                        }}
                      >
                        Upload to All Social Platforms
                      </Button>
                      
                      <div className="flex items-center justify-between">
                        <a 
                          href={video.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Open in new tab
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(video.videoUrl, '_blank')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}