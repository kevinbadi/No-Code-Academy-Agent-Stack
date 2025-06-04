import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Lightbulb, TrendingUp, ExternalLink, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ContentSearchResult {
  success: boolean;
  content: string;
  citations: string[];
  searchResults: Array<{
    title: string;
    url: string;
    date: string;
  }>;
  relatedQuestions: string[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface TrendingTopicsResult {
  success: boolean;
  trends: string;
  citations: string[];
  searchResults: Array<{
    title: string;
    url: string;
    date: string;
  }>;
  relatedQuestions: string[];
}

export default function ContentResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("social media");
  const [niche, setNiche] = useState("");
  const [searchResult, setSearchResult] = useState<ContentSearchResult | null>(null);
  const queryClient = useQueryClient();

  // Mutation for content search
  const searchMutation = useMutation({
    mutationFn: async (data: { query: string; platform: string; niche: string }) => {
      const response = await fetch("/api/content-research/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to search for content ideas");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResult(data);
    },
    onError: (error) => {
      console.error("Search error:", error);
    },
  });

  // Query for trending topics
  const { data: trendingData, isLoading: trendingLoading, refetch: refetchTrending } = useQuery<TrendingTopicsResult>({
    queryKey: ["/api/content-research/trending", selectedPlatform],
    queryFn: async () => {
      const response = await fetch(`/api/content-research/trending?platform=${selectedPlatform}`);
      if (!response.ok) {
        throw new Error("Failed to fetch trending topics");
      }
      return response.json();
    },
    enabled: false, // Don't auto-fetch, only when user clicks
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    searchMutation.mutate({
      query: searchQuery,
      platform: selectedPlatform,
      niche: niche,
    });
  };

  const handleTrendingSearch = () => {
    refetchTrending();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Lightbulb className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Content Research</h1>
      </div>
      
      <p className="text-muted-foreground">
        Generate fresh content ideas for your social media platforms using AI-powered internet search
      </p>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search for Content Ideas</span>
          </CardTitle>
          <CardDescription>
            Enter a topic, question, or theme to get creative content suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social media">All Social Media</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Twitter">Twitter/X</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Niche/Industry (Optional)</label>
              <Input
                placeholder="e.g., fitness, technology, beauty"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Query</label>
            <Textarea
              placeholder="e.g., workout routines for beginners, latest AI trends, healthy recipes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleSearch} 
              disabled={searchMutation.isPending || !searchQuery.trim()}
              className="flex items-center space-x-2"
            >
              {searchMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>Search Ideas</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleTrendingSearch}
              disabled={trendingLoading}
              className="flex items-center space-x-2"
            >
              {trendingLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              <span>Get Trending Topics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle>Content Ideas</CardTitle>
            <CardDescription>
              Generated ideas based on your search query
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {searchResult.content}
              </div>
            </div>
            
            {searchResult.searchResults.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Related Sources</h4>
                  <div className="grid gap-2">
                    {searchResult.searchResults.slice(0, 5).map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{result.title}</h5>
                          <p className="text-xs text-muted-foreground">{result.date}</p>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {searchResult.relatedQuestions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Related Questions</h4>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.relatedQuestions.slice(0, 6).map((question, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {question}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {searchResult.usage && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Tokens used: {searchResult.usage.total_tokens} (prompt: {searchResult.usage.prompt_tokens}, completion: {searchResult.usage.completion_tokens})
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trending Topics Results */}
      {trendingData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Trending Topics</span>
            </CardTitle>
            <CardDescription>
              Current trending topics for {selectedPlatform}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {trendingData.trends}
              </div>
            </div>
            
            {trendingData.searchResults.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Trending Sources</h4>
                  <div className="grid gap-2">
                    {trendingData.searchResults.slice(0, 3).map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{result.title}</h5>
                          <p className="text-xs text-muted-foreground">{result.date}</p>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {searchMutation.isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive text-sm">
              Error: {searchMutation.error?.message || "Failed to search for content ideas"}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}