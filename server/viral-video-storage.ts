import { db } from "./db";
import { viralVideoAgent, type ViralVideoAgent, type InsertViralVideoAgent } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export class ViralVideoStorage {
  async getViralVideos(limit?: number): Promise<ViralVideoAgent[]> {
    const query = db.select().from(viralVideoAgent).orderBy(desc(viralVideoAgent.timestamp));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async getViralVideoById(id: number): Promise<ViralVideoAgent | undefined> {
    const [video] = await db.select().from(viralVideoAgent).where(eq(viralVideoAgent.id, id));
    return video;
  }

  async createViralVideo(data: InsertViralVideoAgent): Promise<ViralVideoAgent> {
    const [video] = await db
      .insert(viralVideoAgent)
      .values(data)
      .returning();
    return video;
  }

  async updateViralVideo(id: number, data: Partial<InsertViralVideoAgent>): Promise<ViralVideoAgent | undefined> {
    const [video] = await db
      .update(viralVideoAgent)
      .set(data)
      .where(eq(viralVideoAgent.id, id))
      .returning();
    return video;
  }

  async deleteViralVideo(id: number): Promise<boolean> {
    const result = await db
      .delete(viralVideoAgent)
      .where(eq(viralVideoAgent.id, id));
    return result.rowCount > 0;
  }

  async getVideoStats(): Promise<{
    totalVideos: number;
    publishedVideos: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
  }> {
    const videos = await this.getViralVideos();
    
    return {
      totalVideos: videos.length,
      publishedVideos: videos.filter(v => v.status === 'published').length,
      totalViews: videos.reduce((sum, v) => sum + (v.views || 0), 0),
      totalLikes: videos.reduce((sum, v) => sum + (v.likes || 0), 0),
      totalShares: videos.reduce((sum, v) => sum + (v.shares || 0), 0)
    };
  }
}

export const viralVideoStorage = new ViralVideoStorage();