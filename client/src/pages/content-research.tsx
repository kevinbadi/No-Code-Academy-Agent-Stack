import { useState, type FormEventHandler } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, ExternalLink, User, Bot, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AIInput,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
  AIInputButton,
  AIInputSubmit,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
} from "@/components/ui/ai-input";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  relatedQuestions?: string[];
  searchResults?: Array<{
    title: string;
    url: string;
    date: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

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

const perplexityModels = [
  { id: 'llama-3.1-sonar-small-128k-online', name: 'Sonar Small (Default)' },
  { id: 'llama-3.1-sonar-large-128k-online', name: 'Sonar Large' },
  { id: 'llama-3.1-sonar-huge-128k-online', name: 'Sonar Huge' },
];

export default function ContentResearchPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState(perplexityModels[0].id);
  const { toast } = useToast();

  // Mutation for content search using the chatbot
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch("/api/content-research/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query,
          platform: "social media",
          niche: "" 
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to search for content ideas");
      }
      
      return response.json() as Promise<ContentSearchResult>;
    },
    onSuccess: (data, query) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: data.content,
        citations: data.citations,
        relatedQuestions: data.relatedQuestions,
        searchResults: data.searchResults,
        usage: data.usage,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "Search Error",
        description: error.message || "Failed to search for content ideas",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = formData.get('message') as string;
    
    if (!message?.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: message.trim(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Clear the form
    event.currentTarget.reset();
    
    // Send to API
    searchMutation.mutate(message.trim());
  };

  // Handle trending topics
  const handleTrendingTopics = () => {
    const trendingQuery = "What are the current trending topics for social media content creation?";
    
    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: trendingQuery,
    };
    
    setMessages(prev => [...prev, userMessage]);
    searchMutation.mutate(trendingQuery);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Lightbulb className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Content Research</h1>
      </div>
      
      <p className="text-muted-foreground">
        Generate fresh content ideas using AI-powered research with Perplexity's Sonar models
      </p>

      {/* Chat Interface */}
      <div className="space-y-4">
        {/* Messages Container */}
        <div className="min-h-[400px] max-h-[600px] overflow-y-auto space-y-4 border rounded-lg p-4 bg-muted/10">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
              <Sparkles className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Start a conversation</h3>
                <p className="text-muted-foreground mt-1">
                  Ask me about content ideas, trending topics, or social media strategies
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => searchMutation.mutate("Give me 10 engaging Instagram post ideas for a fitness brand")}
                >
                  Instagram fitness ideas
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => searchMutation.mutate("What are the latest LinkedIn content trends for B2B businesses?")}
                >
                  LinkedIn B2B trends
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent"
                  onClick={handleTrendingTopics}
                >
                  Trending topics
                </Badge>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`rounded-lg p-4 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background border'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    
                    {/* Assistant message extras */}
                    {message.role === 'assistant' && (
                      <div className="mt-4 space-y-3">
                        {/* Related Questions */}
                        {message.relatedQuestions && message.relatedQuestions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                              Related Questions
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {message.relatedQuestions.slice(0, 4).map((question, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="text-xs cursor-pointer hover:bg-accent"
                                  onClick={() => searchMutation.mutate(question)}
                                >
                                  {question}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Search Results */}
                        {message.searchResults && message.searchResults.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                              Sources
                            </h4>
                            <div className="space-y-2">
                              {message.searchResults.slice(0, 3).map((result, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded text-xs">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{result.title}</div>
                                    <div className="text-muted-foreground">{result.date}</div>
                                  </div>
                                  <a 
                                    href={result.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-2 hover:text-primary"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Usage Stats */}
                        {message.usage && (
                          <div className="text-xs text-muted-foreground pt-2 border-t">
                            Tokens: {message.usage.total_tokens} ({message.usage.prompt_tokens} + {message.usage.completion_tokens})
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Loading state */}
          {searchMutation.isPending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-background border rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <AIInput onSubmit={handleSubmit}>
          <AIInputTextarea 
            placeholder="Ask me about content ideas, trends, or social media strategies..."
            disabled={searchMutation.isPending}
          />
          <AIInputToolbar>
            <AIInputTools>
              <AIInputButton onClick={handleTrendingTopics} disabled={searchMutation.isPending}>
                <Sparkles size={16} />
                <span>Trending</span>
              </AIInputButton>
              
              <AIInputModelSelect value={selectedModel} onValueChange={setSelectedModel}>
                <AIInputModelSelectTrigger>
                  <AIInputModelSelectValue />
                </AIInputModelSelectTrigger>
                <AIInputModelSelectContent>
                  {perplexityModels.map((model) => (
                    <AIInputModelSelectItem key={model.id} value={model.id}>
                      {model.name}
                    </AIInputModelSelectItem>
                  ))}
                </AIInputModelSelectContent>
              </AIInputModelSelect>
            </AIInputTools>
            
            <AIInputSubmit disabled={searchMutation.isPending}>
              <Sparkles size={16} />
            </AIInputSubmit>
          </AIInputToolbar>
        </AIInput>
      </div>
    </div>
  );
}