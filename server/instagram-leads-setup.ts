import { pool } from './db';

/**
 * Run this file directly to set up the Instagram leads table and sample data
 */
async function setupInstagramLeadsTable() {
  try {
    console.log("Setting up Instagram leads table...");
    
    // Create the instagram_leads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS instagram_leads (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        profile_url VARCHAR(255),
        profile_picture_url VARCHAR(255),
        instagram_id VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        bio TEXT,
        followers INTEGER,
        following INTEGER,
        status VARCHAR(20) DEFAULT 'warm_lead' NOT NULL,
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        notes TEXT,
        tags TEXT
      )
    `);
    
    // Check if we already have sample data
    const checkResult = await pool.query(`SELECT COUNT(*) FROM instagram_leads`);
    const count = parseInt(checkResult.rows[0].count);
    
    if (count === 0) {
      console.log("Adding sample Instagram leads...");
      
      // Sample leads data
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
          status: "warm_lead",
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
          status: "warm_lead",
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
          status: "message_sent",
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
          status: "sale_closed",
          notes: "Purchased premium plan. Very satisfied with onboarding process.",
          tags: "ecommerce,retail,consultant"
        },
        {
          username: "growth.hacker",
          fullName: "Daniel Brown",
          profileUrl: "https://instagram.com/growth.hacker",
          profilePictureUrl: "",
          instagramID: "98765432",
          isVerified: false,
          bio: "Growth marketing specialist. Data-driven approach to scaling businesses.",
          followers: 9400,
          following: 780,
          status: "warm_lead",
          tags: "growth,marketing,data"
        },
        {
          username: "product.designer",
          fullName: "Olivia White",
          profileUrl: "https://instagram.com/product.designer",
          profilePictureUrl: "",
          instagramID: "34567891",
          isVerified: true,
          bio: "Product Designer with 8+ years of experience. Creating intuitive user experiences.",
          followers: 18300,
          following: 640,
          status: "warm_lead",
          tags: "design,UX,product"
        }
      ];
      
      // Insert sample leads
      for (const lead of sampleLeads) {
        await pool.query(`
          INSERT INTO instagram_leads (
            username, full_name, profile_url, profile_picture_url, instagram_id,
            is_verified, bio, followers, following, status, notes, tags
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          lead.username,
          lead.fullName,
          lead.profileUrl,
          lead.profilePictureUrl,
          lead.instagramID,
          lead.isVerified,
          lead.bio,
          lead.followers,
          lead.following,
          lead.status,
          lead.notes || null,
          lead.tags || null
        ]);
      }
      
      console.log(`Added ${sampleLeads.length} sample Instagram leads`);
    } else {
      console.log(`Instagram leads table already has ${count} records`);
    }
    
    return true;
  } catch (error) {
    console.error("Error setting up Instagram leads table:", error);
    return false;
  }
}

// Run the setup function
setupInstagramLeadsTable()
  .then(() => {
    console.log("Instagram leads setup complete");
    process.exit(0);
  })
  .catch(err => {
    console.error("Instagram leads setup failed:", err);
    process.exit(1);
  });