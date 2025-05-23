import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  FileSearch, 
  Edit3, 
  PenTool, 
  Clock, 
  CheckCircle, 
  BarChart3,
  Bookmark,
  List,
  ListChecks,
  ArrowUpRight
} from "lucide-react";
import Sidebar from "../components/sidebar";
import MetricCard from "../components/metric-card";

export default function SeoArticleWriterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("in-progress");
  
  // Sample SEO Article Writing data
  const seoWritingData = {
    metrics: {
      articlesWritten: 156,
      averageWordCount: 1850,
      averageReadingTime: 8.2,
      keywordsRanked: 78,
      backlinks: 423
    },
    projects: {
      inProgress: [
        {
          id: 1,
          title: "Ultimate Guide to Content Marketing in 2025",
          status: "writing",
          progress: 65,
          keywords: ["content marketing", "digital marketing strategy", "content ROI"],
          wordCount: 2400,
          deadline: "2025-05-28",
          writer: "AI Agent"
        },
        {
          id: 2,
          title: "10 SEO Tools Every Small Business Should Use",
          status: "research",
          progress: 30,
          keywords: ["SEO tools", "small business SEO", "affordable SEO"],
          wordCount: 1200,
          deadline: "2025-05-26",
          writer: "AI Agent"
        }
      ],
      completed: [
        {
          id: 3,
          title: "How to Build a Successful Email Marketing Campaign",
          status: "published",
          progress: 100,
          keywords: ["email marketing", "campaign strategy", "email automation"],
          wordCount: 2100,
          publishDate: "2025-05-18",
          performance: {
            traffic: 1245,
            conversions: 28,
            ranking: 3
          },
          writer: "AI Agent"
        },
        {
          id: 4,
          title: "The Complete Guide to Local SEO",
          status: "published",
          progress: 100,
          keywords: ["local SEO", "Google My Business", "local search ranking"],
          wordCount: 2800,
          publishDate: "2025-05-10",
          performance: {
            traffic: 2150,
            conversions: 43,
            ranking: 2
          },
          writer: "AI Agent"
        }
      ]
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      
      <main className="flex-1 md:ml-56 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">SEO Article Writing Agent</h2>
              <p className="mt-1 text-sm text-gray-600">Create and monitor SEO-optimized content</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button className="bg-teal-600 hover:bg-teal-700">
                <FileText className="mr-2 h-4 w-4" />
                New Article
              </Button>
            </div>
          </div>
        </div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600 mr-3"></div>
              <span className="text-gray-700">Loading data...</span>
            </div>
          </div>
        )}
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard
            title="Articles Written"
            value={seoWritingData.metrics.articlesWritten}
            icon="paper-plane"
            change={12.5}
            color="#0D9488"
            progressValue={85}
            isLoading={isLoading}
          />
          
          <MetricCard
            title="Avg Word Count"
            value={seoWritingData.metrics.averageWordCount}
            icon="user-check"
            change={3.2}
            color="#0D9488"
            progressValue={75}
            isLoading={isLoading}
          />
          
          <MetricCard
            title="Avg Reading Time"
            value={seoWritingData.metrics.averageReadingTime}
            suffix=" min"
            icon="percentage"
            change={0.8}
            color="#0D9488"
            progressValue={65}
            isLoading={isLoading}
          />
          
          <MetricCard
            title="Keywords Ranked"
            value={seoWritingData.metrics.keywordsRanked}
            icon="paper-plane"
            change={15.3}
            color="#0D9488"
            progressValue={78}
            isLoading={isLoading}
          />
          
          <MetricCard
            title="Backlinks Generated"
            value={seoWritingData.metrics.backlinks}
            icon="paper-plane"
            change={22.7}
            color="#0D9488"
            progressValue={92}
            isLoading={isLoading}
          />
        </div>
        
        {/* Article Projects */}
        <div className="mb-8">
          <Tabs defaultValue="in-progress" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="new">New Article</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="in-progress" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {seoWritingData.projects.inProgress.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription className="mt-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              Due: {project.deadline}
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            project.status === 'writing' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {project.status === 'writing' ? 'Writing' : 'Research'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex justify-between mb-1 text-xs text-gray-500">
                          <span>Progress: {project.progress}%</span>
                          <span>{project.wordCount} words</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">Target Keywords:</p>
                        <div className="flex flex-wrap gap-2">
                          {project.keywords.map((keyword, i) => (
                            <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <Button size="sm" variant="outline" className="w-full mt-2">
                        Continue Writing
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {seoWritingData.projects.completed.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription className="mt-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Published: {project.publishDate}
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex items-center">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs text-gray-500">Traffic</p>
                            <p className="font-semibold">{project.performance.traffic}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs text-gray-500">Conversions</p>
                            <p className="font-semibold">{project.performance.conversions}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs text-gray-500">Ranking</p>
                            <p className="font-semibold">#{project.performance.ranking}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">Target Keywords:</p>
                        <div className="flex flex-wrap gap-2">
                          {project.keywords.map((keyword, i) => (
                            <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          View Live
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="new" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Create New SEO Article</CardTitle>
                  <CardDescription>Fill in the details to generate an SEO-optimized article</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Article Title</label>
                        <Input placeholder="Enter a compelling title" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Target Keyword</label>
                        <Input placeholder="Main keyword to target" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Secondary Keywords (comma separated)</label>
                      <Input placeholder="keyword1, keyword2, keyword3" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Word Count Target</label>
                        <Input type="number" defaultValue={1500} min={500} step={100} />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Deadline</label>
                        <Input type="date" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Content Type</label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                          <option>How-to Guide</option>
                          <option>Listicle</option>
                          <option>Product Review</option>
                          <option>Case Study</option>
                          <option>Expert Roundup</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Brief/Outline</label>
                      <Textarea placeholder="Provide details about what should be covered in the article" className="h-32" />
                    </div>
                    
                    <div className="flex items-center pt-2 space-x-4">
                      <Button type="button" className="bg-teal-600 hover:bg-teal-700">Generate Article</Button>
                      <Button type="button" variant="outline">Generate Outline Only</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Writing Guidelines */}
        {activeTab !== "new" && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SEO Writing Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <ListChecks className="h-4 w-4 mr-2 text-teal-600" />
                      Content Structure
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="bg-teal-100 text-teal-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</div>
                        <span>Use descriptive H2 and H3 headings with target keywords</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 text-teal-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</div>
                        <span>Keep paragraphs under 3-4 sentences for readability</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 text-teal-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</div>
                        <span>Include introduction, body sections, and conclusion</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 text-teal-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">4</div>
                        <span>Use bullet points and numbered lists for scannable content</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FileSearch className="h-4 w-4 mr-2 text-teal-600" />
                      Keyword Usage
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="bg-teal-100 text-teal-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</div>
                        <span>Include primary keyword in title, H1, and first paragraph</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 text-teal-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</div>
                        <span>Use secondary keywords naturally throughout content</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 text-teal-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</div>
                        <span>Maintain keyword density of 1-2% to avoid over-optimization</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-teal-100 text-teal-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">4</div>
                        <span>Optimize meta description with primary keyword</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Attribution */}
        <div className="mt-8 text-xs text-gray-500 text-center">
          <p>© 2025 AI Agent Team Dashboard. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}