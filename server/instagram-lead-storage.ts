import { db } from './db';
import { instagramLeads, type InstagramLead, type InsertInstagramLead } from '@shared/instagram-schema';
import { eq, desc, and, between, asc } from 'drizzle-orm';

export class InstagramLeadStorage {
  // Get all leads with optional limit and status filter
  async getInstagramLeads(options?: { 
    limit?: number, 
    status?: 'warm_lead' | 'message_sent' | 'sale_closed' 
  }): Promise<InstagramLead[]> {
    const { limit, status } = options || {};
    
    let query = db.select().from(instagramLeads).orderBy(desc(instagramLeads.dateAdded));
    
    if (status) {
      query = query.where(eq(instagramLeads.status, status));
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }
  
  // Get a single lead by ID
  async getInstagramLeadById(id: number): Promise<InstagramLead | undefined> {
    const [lead] = await db
      .select()
      .from(instagramLeads)
      .where(eq(instagramLeads.id, id));
    
    return lead;
  }
  
  // Get next warm lead (for single-view processing)
  async getNextWarmLead(): Promise<InstagramLead | undefined> {
    const [lead] = await db
      .select()
      .from(instagramLeads)
      .where(eq(instagramLeads.status, 'warm_lead'))
      .orderBy(asc(instagramLeads.dateAdded))
      .limit(1);
    
    return lead;
  }
  
  // Create a new Instagram lead
  async createInstagramLead(data: InsertInstagramLead): Promise<InstagramLead> {
    const [lead] = await db
      .insert(instagramLeads)
      .values(data)
      .returning();
    
    return lead;
  }
  
  // Update lead status (progress through pipeline)
  async updateLeadStatus(id: number, newStatus: 'warm_lead' | 'message_sent' | 'sale_closed', notes?: string): Promise<InstagramLead | undefined> {
    const [updatedLead] = await db
      .update(instagramLeads)
      .set({ 
        status: newStatus, 
        lastUpdated: new Date(),
        ...(notes && { notes }),
      })
      .where(eq(instagramLeads.id, id))
      .returning();
    
    return updatedLead;
  }
  
  // Get count of leads by status
  async getLeadCountsByStatus(): Promise<{ 
    warmLeadCount: number, 
    messageSentCount: number, 
    saleClosedCount: number 
  }> {
    const warmLeads = await db
      .select()
      .from(instagramLeads)
      .where(eq(instagramLeads.status, 'warm_lead'));
    
    const messageSentLeads = await db
      .select()
      .from(instagramLeads)
      .where(eq(instagramLeads.status, 'message_sent'));
    
    const saleClosedLeads = await db
      .select()
      .from(instagramLeads)
      .where(eq(instagramLeads.status, 'sale_closed'));
    
    return {
      warmLeadCount: warmLeads.length,
      messageSentCount: messageSentLeads.length,
      saleClosedCount: saleClosedLeads.length
    };
  }
  
  // Delete a lead (for admin purposes)
  async deleteInstagramLead(id: number): Promise<boolean> {
    const result = await db
      .delete(instagramLeads)
      .where(eq(instagramLeads.id, id));
    
    return result.count > 0;
  }
}

// Export a singleton instance
export const instagramLeadStorage = new InstagramLeadStorage();