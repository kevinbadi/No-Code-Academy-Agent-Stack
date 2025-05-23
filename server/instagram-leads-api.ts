import { Request, Response } from "express";
import { pool } from "./db";

/**
 * Get all Instagram leads with optional status filtering
 */
export async function getInstagramLeads(req: Request, res: Response) {
  try {
    const status = req.query.status as 'warm_lead' | 'message_sent' | 'sale_closed' | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    // Query for Instagram leads with optional status filter
    let query = `
      SELECT * FROM instagram_leads 
      ${status ? `WHERE status = '${status}'` : ''} 
      ORDER BY date_added DESC
      ${limit ? `LIMIT ${limit}` : ''}
    `;
    
    const results = await pool.query(query);
    
    // Convert snake_case to camelCase for frontend
    const leads = results.rows.map(row => ({
      id: row.id,
      username: row.username,
      fullName: row.full_name,
      profileUrl: row.profile_url,
      profilePictureUrl: row.profile_picture_url,
      instagramID: row.instagram_id,
      isVerified: row.is_verified,
      bio: row.bio,
      followers: row.followers,
      following: row.following,
      status: row.status,
      dateAdded: row.date_added,
      lastUpdated: row.last_updated,
      notes: row.notes,
      tags: row.tags ? row.tags.split(',') : []
    }));
    
    res.json(leads);
  } catch (error) {
    console.error("Error fetching Instagram leads:", error);
    res.status(500).json({ error: "Failed to fetch Instagram leads" });
  }
}

/**
 * Get the next warm lead for processing
 */
export async function getNextWarmLead(req: Request, res: Response) {
  try {
    // Get the next warm lead for processing
    const result = await pool.query(`
      SELECT * FROM instagram_leads 
      WHERE status = 'warm_lead' 
      ORDER BY date_added ASC
      LIMIT 1
    `);
    
    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      const lead = {
        id: row.id,
        username: row.username,
        fullName: row.full_name,
        profileUrl: row.profile_url,
        profilePictureUrl: row.profile_picture_url,
        instagramID: row.instagram_id,
        isVerified: row.is_verified,
        bio: row.bio,
        followers: row.followers,
        following: row.following,
        status: row.status,
        dateAdded: row.date_added,
        lastUpdated: row.last_updated,
        notes: row.notes,
        tags: row.tags ? row.tags.split(',') : []
      };
      
      res.json(lead);
    } else {
      res.status(404).json({ message: "No warm leads available" });
    }
  } catch (error) {
    console.error("Error fetching next warm lead:", error);
    res.status(500).json({ error: "Failed to fetch next warm lead" });
  }
}

/**
 * Get count of leads by status
 */
export async function getLeadCountsByStatus(req: Request, res: Response) {
  try {
    // Get count of leads for each status
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'warm_lead') AS warm_lead_count,
        COUNT(*) FILTER (WHERE status = 'message_sent') AS message_sent_count,
        COUNT(*) FILTER (WHERE status = 'sale_closed') AS sale_closed_count,
        COUNT(*) AS total_count
      FROM instagram_leads
    `);
    
    if (result.rows && result.rows.length > 0) {
      res.json({
        warmLeadCount: parseInt(result.rows[0].warm_lead_count) || 0,
        messageSentCount: parseInt(result.rows[0].message_sent_count) || 0,
        saleClosedCount: parseInt(result.rows[0].sale_closed_count) || 0,
        totalCount: parseInt(result.rows[0].total_count) || 0
      });
    } else {
      res.json({
        warmLeadCount: 0,
        messageSentCount: 0,
        saleClosedCount: 0,
        totalCount: 0
      });
    }
  } catch (error) {
    console.error("Error fetching lead counts:", error);
    res.status(500).json({ error: "Failed to fetch lead counts" });
  }
}

/**
 * Update lead status (move through pipeline)
 */
export async function updateLeadStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    if (!['warm_lead', 'message_sent', 'sale_closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // Update the lead status
    const result = await pool.query(`
      UPDATE instagram_leads
      SET 
        status = $1,
        last_updated = CURRENT_TIMESTAMP,
        notes = COALESCE($2, notes)
      WHERE id = $3
      RETURNING *
    `, [status, notes, id]);
    
    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      res.json({
        id: row.id,
        username: row.username,
        fullName: row.full_name,
        profileUrl: row.profile_url,
        profilePictureUrl: row.profile_picture_url,
        instagramID: row.instagram_id,
        isVerified: row.is_verified,
        bio: row.bio,
        followers: row.followers,
        following: row.following,
        status: row.status,
        dateAdded: row.date_added,
        lastUpdated: row.last_updated,
        notes: row.notes,
        tags: row.tags ? row.tags.split(',') : []
      });
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    console.error("Error updating lead status:", error);
    res.status(500).json({ error: "Failed to update lead status" });
  }
}

/**
 * Create sample Instagram leads
 */
export async function createSampleInstagramLeads(req: Request, res: Response) {
  try {
    // Import the setup function and run it
    const { setupInstagramLeadsTable } = await import('./db-setup');
    await setupInstagramLeadsTable();
    
    res.json({ message: "Sample Instagram leads created successfully" });
  } catch (error) {
    console.error("Error creating sample Instagram leads:", error);
    res.status(500).json({ error: "Failed to create sample Instagram leads" });
  }
}