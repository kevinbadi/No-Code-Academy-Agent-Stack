import { Request, Response } from "express";
import { instagramPostStorage } from "./instagram-post-storage";
import { insertInstagramPostSchema } from "@shared/schema";
import { z } from "zod";

/**
 * Get all Instagram posts with optional filtering
 */
export async function getInstagramPosts(req: Request, res: Response) {
  try {
    const onlyUnprocessed = req.query.onlyUnprocessed === 'true';
    const posts = await instagramPostStorage.getInstagramPosts(onlyUnprocessed);
    res.json(posts);
  } catch (error) {
    console.error("Error in getInstagramPosts:", error);
    res.status(500).json({ message: "Failed to fetch Instagram posts" });
  }
}

/**
 * Get a specific Instagram post by ID
 */
export async function getInstagramPostById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const post = await instagramPostStorage.getInstagramPostById(id);
    if (!post) {
      return res.status(404).json({ message: "Instagram post not found" });
    }
    
    res.json(post);
  } catch (error) {
    console.error(`Error in getInstagramPostById:`, error);
    res.status(500).json({ message: "Failed to fetch Instagram post" });
  }
}

/**
 * Create a new Instagram post
 */
export async function createInstagramPost(req: Request, res: Response) {
  try {
    const validatedData = insertInstagramPostSchema.parse(req.body);
    const post = await instagramPostStorage.createInstagramPost(validatedData);
    res.status(201).json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid Instagram post data", errors: error.errors });
    } else {
      console.error("Error in createInstagramPost:", error);
      res.status(500).json({ message: "Failed to create Instagram post" });
    }
  }
}

/**
 * Update an Instagram post's status to added to warm leads
 */
export async function markPostsAsAddedToWarmLeads(req: Request, res: Response) {
  try {
    const postIds = req.body.postIds;
    
    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ message: "Invalid or empty post IDs array" });
    }
    
    const numUpdated = await instagramPostStorage.markPostsAsAddedToWarmLeads(postIds);
    
    res.json({ 
      message: `${numUpdated} Instagram posts marked as added to warm leads`,
      updatedCount: numUpdated
    });
  } catch (error) {
    console.error("Error in markPostsAsAddedToWarmLeads:", error);
    res.status(500).json({ message: "Failed to mark Instagram posts as added to warm leads" });
  }
}

/**
 * Update engagement stats for a post
 */
export async function updateEngagementStats(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const { engagementStats } = req.body;
    if (!engagementStats || typeof engagementStats !== 'object') {
      return res.status(400).json({ message: "Invalid engagement stats data" });
    }
    
    const post = await instagramPostStorage.updateEngagementStats(id, engagementStats);
    if (!post) {
      return res.status(404).json({ message: "Instagram post not found" });
    }
    
    res.json(post);
  } catch (error) {
    console.error("Error in updateEngagementStats:", error);
    res.status(500).json({ message: "Failed to update engagement stats" });
  }
}

/**
 * Delete an Instagram post
 */
export async function deleteInstagramPost(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const success = await instagramPostStorage.deleteInstagramPost(id);
    if (!success) {
      return res.status(404).json({ message: "Instagram post not found or could not be deleted" });
    }
    
    res.json({ message: "Instagram post deleted successfully" });
  } catch (error) {
    console.error("Error in deleteInstagramPost:", error);
    res.status(500).json({ message: "Failed to delete Instagram post" });
  }
}

/**
 * Create sample Instagram posts for testing
 */
export async function createSampleInstagramPosts(req: Request, res: Response) {
  try {
    const samplePosts = [
      {
        postUrl: "https://www.instagram.com/p/CdE123AbCdE/",
        postDescription: "Check out our new summer collection! #fashion #summer",
        engagementStats: {
          likes: 243,
          comments: 56,
          shares: 12,
          saves: 89
        }
      },
      {
        postUrl: "https://www.instagram.com/p/CfG456DeFgH/",
        postDescription: "Behind the scenes at our photoshoot today! #behindthescenes",
        engagementStats: {
          likes: 186,
          comments: 32,
          shares: 8,
          saves: 41
        }
      },
      {
        postUrl: "https://www.instagram.com/p/ChI789JkLmN/",
        postDescription: "New product alert! Our latest skincare line drops next week. #skincare #beauty",
        engagementStats: {
          likes: 452,
          comments: 98,
          shares: 65,
          saves: 201
        }
      },
      {
        postUrl: "https://www.instagram.com/p/CjK012MnOpQ/",
        postDescription: "Meet our team! The people behind the brand. #teamwork #company",
        engagementStats: {
          likes: 167,
          comments: 43,
          shares: 5,
          saves: 22
        }
      },
      {
        postUrl: "https://www.instagram.com/p/ClM345RsTuV/",
        postDescription: "Customer feature: @johndoe loving our products! #customerlove #testimonial",
        engagementStats: {
          likes: 312,
          comments: 74,
          shares: 28,
          saves: 113
        }
      }
    ];
    
    const createdPosts = [];
    for (const post of samplePosts) {
      const createdPost = await instagramPostStorage.createInstagramPost(post);
      createdPosts.push(createdPost);
    }
    
    res.status(201).json({
      message: `Created ${createdPosts.length} sample Instagram posts`,
      posts: createdPosts
    });
  } catch (error) {
    console.error("Error in createSampleInstagramPosts:", error);
    res.status(500).json({ message: "Failed to create sample Instagram posts" });
  }
}

/**
 * Handle webhook for new Instagram posts
 */
export async function handleInstagramPostWebhook(req: Request, res: Response) {
  try {
    const { postUrl, postDescription, engagementStats } = req.body;
    
    if (!postUrl) {
      return res.status(400).json({ message: "Missing required field: postUrl" });
    }
    
    const post = await instagramPostStorage.createInstagramPost({
      postUrl,
      postDescription,
      engagementStats: engagementStats || {}
    });
    
    // Log the activity
    console.log(`New Instagram post received via webhook: ${postUrl}`);
    
    res.status(201).json({
      message: "Instagram post received and stored successfully",
      post
    });
  } catch (error) {
    console.error("Error in handleInstagramPostWebhook:", error);
    res.status(500).json({ message: "Failed to process Instagram post webhook" });
  }
}