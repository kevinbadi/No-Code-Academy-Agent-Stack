import { linkedinAgent2, type LinkedinAgent2, type InsertLinkedinAgent2 } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export class LinkedinAgent2Storage {
  async getLinkedinAgent2Data(limit?: number): Promise<LinkedinAgent2[]> {
    return await db
      .select()
      .from(linkedinAgent2)
      .orderBy(desc(linkedinAgent2.timestamp))
      .limit(limit || 50);
  }

  async getLatestLinkedinAgent2Data(): Promise<LinkedinAgent2 | undefined> {
    const [latest] = await db
      .select()
      .from(linkedinAgent2)
      .orderBy(desc(linkedinAgent2.timestamp))
      .limit(1);
    
    return latest || undefined;
  }

  async createLinkedinAgent2Data(data: InsertLinkedinAgent2): Promise<LinkedinAgent2> {
    const [result] = await db
      .insert(linkedinAgent2)
      .values(data)
      .returning();
    
    return result;
  }

  async getLinkedinAgent2DataById(id: number): Promise<LinkedinAgent2 | undefined> {
    const [result] = await db
      .select()
      .from(linkedinAgent2)
      .where(eq(linkedinAgent2.id, id));
    
    return result || undefined;
  }
}

export const linkedinAgent2Storage = new LinkedinAgent2Storage();