import { Request, Response } from "express";

/**
 * Search for content ideas using Perplexity API
 */
export async function searchContentIdeas(req: Request, res: Response) {
  try {
    console.log("=== Content Research API Call Started ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    const { query, platform, niche } = req.body;
    
    if (!query) {
      console.log("ERROR: No query provided");
      return res.status(400).json({ error: "Query is required" });
    }

    // Check if API key exists
    if (!process.env.PERPLEXITY_API_KEY) {
      console.log("ERROR: PERPLEXITY_API_KEY environment variable not found");
      return res.status(500).json({ 
        error: "Perplexity API key not configured",
        message: "Please configure PERPLEXITY_API_KEY environment variable"
      });
    }

    console.log("API Key present:", process.env.PERPLEXITY_API_KEY ? "YES" : "NO");
    console.log("API Key length:", process.env.PERPLEXITY_API_KEY?.length || 0);

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

    console.log("Perplexity request body:", JSON.stringify(requestBody, null, 2));
    console.log("Making request to Perplexity API...");

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log("Perplexity API response status:", response.status);
    console.log("Perplexity API response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== PERPLEXITY API ERROR ===');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Error Response:', errorText);
      console.error('=== END PERPLEXITY API ERROR ===');
      
      return res.status(response.status).json({ 
        error: "Failed to search for content ideas",
        details: errorText,
        status: response.status,
        statusText: response.statusText
      });
    }

    const responseText = await response.text();
    console.log("Raw Perplexity API response:", responseText.substring(0, 500) + "...");

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed Perplexity API response successfully");
      console.log("Response structure:", {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        hasCitations: !!data.citations,
        hasUsage: !!data.usage
      });
    } catch (parseError) {
      console.error("Failed to parse Perplexity API response as JSON:");
      console.error("Parse error:", parseError);
      console.error("Response text:", responseText);
      return res.status(500).json({
        error: "Invalid JSON response from Perplexity API",
        details: "Response was not valid JSON",
        rawResponse: responseText.substring(0, 1000)
      });
    }
    
    const result = {
      success: true,
      content: data.choices?.[0]?.message?.content || "No content generated",
      citations: data.citations || [],
      searchResults: data.search_results || [],
      relatedQuestions: data.choices?.[0]?.related_questions || [],
      usage: data.usage
    };

    console.log("Sending successful response:", {
      contentLength: result.content.length,
      citationsCount: result.citations.length,
      searchResultsCount: result.searchResults.length,
      relatedQuestionsCount: result.relatedQuestions.length
    });
    console.log("=== Content Research API Call Completed Successfully ===");

    res.json(result);

  } catch (error) {
    console.error("=== UNEXPECTED ERROR IN CONTENT RESEARCH ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("=== END UNEXPECTED ERROR ===");
    
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
      type: error?.constructor?.name || "Unknown"
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