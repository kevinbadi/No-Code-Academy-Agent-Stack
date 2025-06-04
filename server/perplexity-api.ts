import { Request, Response } from "express";

/**
 * Search for content ideas using Perplexity API
 */
export async function searchContentIdeas(req: Request, res: Response) {
  try {
    const { query, platform, niche } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Construct a targeted prompt for content idea generation
    const systemPrompt = "You are a social media content strategist. Provide creative, engaging content ideas with specific actionable suggestions. Be precise and practical.";
    
    let userPrompt = `Generate creative content ideas for ${platform || 'social media'} about: ${query}`;
    if (niche) {
      userPrompt += ` in the ${niche} niche`;
    }
    userPrompt += ". Include specific post types, hooks, and engagement strategies.";

    const requestBody = {
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: userPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.9,
      return_images: false,
      return_related_questions: true,
      search_recency_filter: "month",
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: "Failed to search for content ideas",
        details: errorText 
      });
    }

    const data = await response.json();
    
    res.json({
      success: true,
      content: data.choices[0]?.message?.content || "No content generated",
      citations: data.citations || [],
      searchResults: data.search_results || [],
      relatedQuestions: data.choices[0]?.related_questions || [],
      usage: data.usage
    });

  } catch (error) {
    console.error("Error in content research:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Get trending topics for content inspiration
 */
export async function getTrendingTopics(req: Request, res: Response) {
  try {
    const { platform = "social media", industry } = req.query;

    const systemPrompt = "You are a trend analyst. Provide current trending topics and hashtags that are gaining traction. Be specific and actionable.";
    
    let userPrompt = `What are the current trending topics and hashtags for ${platform}`;
    if (industry) {
      userPrompt += ` in the ${industry} industry`;
    }
    userPrompt += "? Include emerging trends and viral topics from the past week.";

    const requestBody = {
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 800,
      temperature: 0.3,
      search_recency_filter: "week",
      return_related_questions: true,
      stream: false
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: "Failed to get trending topics",
        details: errorText 
      });
    }

    const data = await response.json();
    
    res.json({
      success: true,
      trends: data.choices[0]?.message?.content || "No trends found",
      citations: data.citations || [],
      searchResults: data.search_results || [],
      relatedQuestions: data.choices[0]?.related_questions || []
    });

  } catch (error) {
    console.error("Error getting trending topics:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}