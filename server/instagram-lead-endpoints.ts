import { Request, Response } from 'express';
import { instagramLeadStorage } from './instagram-lead-storage';
import { insertInstagramLeadSchema } from '@shared/instagram-schema';
import { z } from 'zod';

// Get all Instagram leads with optional status filter
export async function getInstagramLeads(req: Request, res: Response) {
  try {
    const status = req.query.status as 'warm_lead' | 'message_sent' | 'sale_closed' | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const leads = await instagramLeadStorage.getInstagramLeads({ 
      status, 
      limit 
    });
    
    return res.status(200).json(leads);
  } catch (error) {
    console.error('Error fetching Instagram leads:', error);
    return res.status(500).json({ error: 'Failed to fetch Instagram leads' });
  }
}

// Get the next warm lead for processing
export async function getNextWarmLead(req: Request, res: Response) {
  try {
    const lead = await instagramLeadStorage.getNextWarmLead();
    
    if (!lead) {
      return res.status(404).json({ message: 'No warm leads available' });
    }
    
    return res.status(200).json(lead);
  } catch (error) {
    console.error('Error fetching next warm lead:', error);
    return res.status(500).json({ error: 'Failed to fetch next warm lead' });
  }
}

// Get lead counts by status
export async function getLeadCountsByStatus(req: Request, res: Response) {
  try {
    const counts = await instagramLeadStorage.getLeadCountsByStatus();
    return res.status(200).json(counts);
  } catch (error) {
    console.error('Error fetching lead counts:', error);
    return res.status(500).json({ error: 'Failed to fetch lead counts' });
  }
}

// Create a new Instagram lead
export async function createInstagramLead(req: Request, res: Response) {
  try {
    const validatedData = insertInstagramLeadSchema.parse(req.body);
    const newLead = await instagramLeadStorage.createInstagramLead(validatedData);
    
    return res.status(201).json(newLead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error('Error creating Instagram lead:', error);
    return res.status(500).json({ error: 'Failed to create Instagram lead' });
  }
}

// Update lead status (move through pipeline)
export async function updateLeadStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    if (!['warm_lead', 'message_sent', 'sale_closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const updatedLead = await instagramLeadStorage.updateLeadStatus(
      parseInt(id), 
      status as 'warm_lead' | 'message_sent' | 'sale_closed',
      notes
    );
    
    if (!updatedLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    return res.status(200).json(updatedLead);
  } catch (error) {
    console.error('Error updating lead status:', error);
    return res.status(500).json({ error: 'Failed to update lead status' });
  }
}

// Create sample Instagram leads (for testing)
export async function createSampleInstagramLeads(req: Request, res: Response) {
  try {
    const sampleLeads = [
      {
        username: "tech.entrepreneur",
        fullName: "Alex Chen",
        profileUrl: "https://instagram.com/tech.entrepreneur",
        profilePictureUrl: "",
        instagramID: "12345678",
        isVerified: false,
        bio: "Founder of 3 tech startups. Looking for innovative solutions for my latest venture.",
        followers: 5680,
        following: 847,
        status: "warm_lead" as const,
        tags: "tech,startup,investor"
      },
      {
        username: "digital.marketer",
        fullName: "Maria Johnson",
        profileUrl: "https://instagram.com/digital.marketer",
        profilePictureUrl: "",
        instagramID: "87654321",
        isVerified: true,
        bio: "Digital marketing consultant helping businesses scale. Open to new tools and platforms.",
        followers: 12500,
        following: 952,
        status: "warm_lead" as const,
        tags: "marketing,digital,consultant"
      },
      {
        username: "startup.ceo",
        fullName: "James Wilson",
        profileUrl: "https://instagram.com/startup.ceo",
        profilePictureUrl: "",
        instagramID: "23456789",
        isVerified: false,
        bio: "CEO of a growing fintech startup. Always looking for ways to improve our operations.",
        followers: 3420,
        following: 521,
        status: "message_sent" as const,
        notes: "Interested in enterprise plan, follow up next week",
        tags: "fintech,ceo,startup"
      },
      {
        username: "e.commerce.expert",
        fullName: "Sophie Taylor",
        profileUrl: "https://instagram.com/e.commerce.expert",
        profilePictureUrl: "",
        instagramID: "34567890",
        isVerified: true,
        bio: "Helping brands grow online. E-commerce consultant with 10+ years experience.",
        followers: 28700,
        following: 1024,
        status: "sale_closed" as const,
        notes: "Purchased premium plan. Very satisfied with onboarding process.",
        tags: "ecommerce,retail,consultant"
      }
    ];
    
    const createdLeads = await Promise.all(
      sampleLeads.map(lead => instagramLeadStorage.createInstagramLead(lead))
    );
    
    return res.status(201).json(createdLeads);
  } catch (error) {
    console.error('Error creating sample Instagram leads:', error);
    return res.status(500).json({ error: 'Failed to create sample Instagram leads' });
  }
}

// Handle webhook from Instagram lead generation service
export async function handleInstagramWebhook(req: Request, res: Response) {
  try {
    const webhookData = req.body;
    
    // Validate webhook data structure
    if (!webhookData || !webhookData.username) {
      return res.status(400).json({ error: 'Invalid webhook data format' });
    }
    
    // Format webhook data to match our schema
    const leadData = {
      username: webhookData.username,
      fullName: webhookData.fullName || webhookData.username,
      profileUrl: webhookData.profileUrl || `https://instagram.com/${webhookData.username}`,
      profilePictureUrl: webhookData.profilePictureUrl || "",
      instagramID: webhookData.instagramID || webhookData.id || "",
      isVerified: webhookData.isVerified || false,
      bio: webhookData.bio || webhookData.biography || "",
      followers: webhookData.followers || webhookData.followerCount || 0,
      following: webhookData.following || webhookData.followingCount || 0,
      status: "warm_lead" as const, // New leads always start as warm leads
      tags: webhookData.tags || "",
    };
    
    // Create the new lead
    const newLead = await instagramLeadStorage.createInstagramLead(leadData);
    
    return res.status(201).json({
      message: 'Instagram lead created successfully',
      lead: newLead
    });
  } catch (error) {
    console.error('Error processing Instagram webhook:', error);
    return res.status(500).json({ error: 'Failed to process Instagram webhook' });
  }
}