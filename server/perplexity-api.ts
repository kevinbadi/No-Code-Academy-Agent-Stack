import { Request, Response } from 'express';

const PERPLEXITY_API_KEY = "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";

/**
 * Search for content ideas using Perplexity API
 */
export async function searchContentIdeas(req: Request, res: Response) {
  try {
    console.log("=== CONTENT SEARCH REQUEST ===");
    console.log("Request body:", req.body);
    
    const { message, niche } = req.body;
    
    if (!message) {
      console.log("No message provided");
      return res.status(400).json({ error: "Message is required" });
    }

    const systemPrompt = "You are a social media content expert. Generate engaging, viral content ideas with specific post types, hooks, and engagement strategies. Be creative and actionable.";
    
    let userPrompt = `Generate 5 creative social media content ideas for: ${message}`;
    if (niche) {
      userPrompt += ` in the ${niche} niche`;
    }
    userPrompt += ". Include specific post types, hooks, and engagement strategies.";

    const requestBody = {
      model: "sonar",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: userPrompt
        }
      ]
    };

    console.log("Making Perplexity API call...");
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log("Perplexity response status:", response.status);
    console.log("Perplexity response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Perplexity API error:", errorText);
      return res.status(response.status).json({ 
        error: "Failed to search for content ideas",
        details: errorText
      });
    }

    const responseText = await response.text();
    console.log("Raw Perplexity response:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed Perplexity data:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.log("JSON parse error:", parseError);
      console.log("Response text that failed to parse:", responseText);
      return res.status(500).json({ 
        error: "Failed to parse API response",
        details: responseText
      });
    }

    const result = {
      content: data.choices?.[0]?.message?.content || "No content generated",
      citations: data.citations || [],
      related_questions: data.related_questions || [],
      usage: data.usage || {}
    };

    console.log("Sending result to frontend:", JSON.stringify(result, null, 2));
    console.log("=== CONTENT SEARCH REQUEST END ===");

    return res.json(result);

  } catch (error) {
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}

/**
 * Get trending topics for content inspiration
 */
export async function getTrendingTopics(req: Request, res: Response) {
  try {
    const { industry } = req.query;

    const systemPrompt = "You are a trend analyst and social media expert. Provide current trending topics and viral content opportunities with specific actionable insights.";
    
    let userPrompt = "What are the top 5 trending topics for social media content creation right now";
    if (industry) {
      userPrompt += ` in the ${industry} industry`;
    }
    userPrompt += "? Include emerging trends and viral topics from the past week.";

    const requestBody = {
      model: "sonar",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: "Failed to get trending topics",
        details: errorText
      });
    }

    const data = await response.json();

    // Format response
    const result = {
      content: data.choices?.[0]?.message?.content || "No trends found",
      citations: data.citations || [],
      related_questions: data.related_questions || [],
      usage: data.usage || {}
    };

    return res.json(result);

  } catch (error) {
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}