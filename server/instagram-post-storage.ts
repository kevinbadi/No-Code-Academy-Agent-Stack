import { db } from "./db";
import { instagramPosts, type InstagramPost, type InsertInstagramPost } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

/**
 * Storage class for managing Instagram posts
 */
export class InstagramPostStorage {
  /**
   * Get all Instagram posts with optional filtering for those not yet added to warm leads
   */
  async getInstagramPosts(onlyNotAddedToWarmLeads: boolean = false): Promise<InstagramPost[]> {
    try {
      let query = db.select().from(instagramPosts).orderBy(desc(instagramPosts.postDate));
      
      if (onlyNotAddedToWarmLeads) {
        query = query.where(eq(instagramPosts.addedToWarmLeads, false));
      }
      
      return await query;
    } catch (error) {
      console.error("Error fetching Instagram posts:", error);
      return [];
    }
  }

  /**
   * Get a specific Instagram post by ID
   */
  async getInstagramPostById(id: number): Promise<InstagramPost | undefined> {
    try {
      const [post] = await db.select().from(instagramPosts).where(eq(instagramPosts.id, id));
      return post;
    } catch (error) {
      console.error(`Error fetching Instagram post with ID ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Create a new Instagram post
   */
  async createInstagramPost(data: InsertInstagramPost): Promise<InstagramPost> {
    try {
      const [post] = await db.insert(instagramPosts).values(data).returning();
      return post;
    } catch (error) {
      console.error("Error creating Instagram post:", error);
      throw error;
    }
  }

  /**
   * Update an Instagram post's warm lead status
   */
  async markPostsAsAddedToWarmLeads(postIds: number[]): Promise<number> {
    try {
      if (postIds.length === 0) return 0;
      
      const result = await db
        .update(instagramPosts)
        .set({
          addedToWarmLeads: true,
          addedToWarmLeadsDate: new Date()
        })
        .where(sql`${instagramPosts.id} IN (${postIds.join(',')})`)
        .returning();
      
      return result.length;
    } catch (error) {
      console.error("Error marking Instagram posts as added to warm leads:", error);
      return 0;
    }
  }

  /**
   * Update engagement stats for a post
   */
  async updateEngagementStats(id: number, engagementStats: Record<string, unknown>): Promise<InstagramPost | undefined> {
    try {
      const [updatedPost] = await db
        .update(instagramPosts)
        .set({ engagementStats })
        .where(eq(instagramPosts.id, id))
        .returning();
      
      return updatedPost;
    } catch (error) {
      console.error(`Error updating engagement stats for Instagram post ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Delete an Instagram post
   */
  async deleteInstagramPost(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(instagramPosts)
        .where(eq(instagramPosts.id, id))
        .returning({ id: instagramPosts.id });
      
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting Instagram post ${id}:`, error);
      return false;
    }
  }
}

export const instagramPostStorage = new InstagramPostStorage();