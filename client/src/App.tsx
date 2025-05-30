import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import NewsletterAgent from "@/pages/newsletter-agent";
import NewsletterStats from "@/pages/newsletter-stats";
import InstagramAgent from "@/pages/instagram-agent";
import LinkedInAgentPage from "@/pages/linkedin-agent";
import FacebookAgentPage from "@/pages/facebook-agent";
import ColdEmailAgentPage from "@/pages/cold-email-agent";
import SeoArticleWriterPage from "@/pages/seo-article-writer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/agent/newsletter" component={NewsletterAgent} />
      <Route path="/agent/newsletter-analytics" component={NewsletterStats} />
      <Route path="/agent/instagram" component={InstagramAgent} />
      <Route path="/agent/linkedin" component={LinkedInAgentPage} />
      <Route path="/agent/facebook" component={FacebookAgentPage} />
      <Route path="/agent/cold-email" component={ColdEmailAgentPage} />
      <Route path="/agent/seo-writer" component={SeoArticleWriterPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
