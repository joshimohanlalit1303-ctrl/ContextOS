import { db } from '../lib/db';
import { sql } from 'drizzle-orm';
import { generateEmbedding } from '../utils/embeddings';

async function run() {
  const keys = await db.execute(sql`SELECT id FROM api_keys LIMIT 1`);
  if (!keys.rows.length) {
    console.log("No API keys found.");
    return;
  }
  
  const users = await db.execute(sql`SELECT id FROM end_users LIMIT 1`);
  if (!users.rows.length) {
    console.log("No End Users found.");
    return;
  }

  const content = `Since Libro is an open-source AI infrastructure and developer tool (competing with the likes of Pinecone, LangChain, etc.), the way you raise capital should be highly strategic. 

Here is a breakdown of whether you should apply for Y Combinator or Antler, followed by a list of VCs perfectly suited for your stage and domain.

### Y Combinator vs. Antler: Which should you choose?

**Short Answer:** You should **100% prioritize Y Combinator.** 

**Why Y Combinator is better for Libro:**
1. **The Ultimate Initial Customer Base:** YC funds hundreds of startups per batch, and almost all of them are building AI agents right now. When you get into YC, the other YC founders become your beta testers and early paying customers. For a B2B Developer Tool like Libro, the YC network is an incredible go-to-market cheat code.
2. **Deal Terms:** YC offers $500k ($125k for 7% and $375k on an uncapped SAFE with an MFN). It provides far more runway.
3. **Prestige for Open Source:** DevTools and open-source infrastructure heavily benefit from the "YC backed" badge. It instantly gives you credibility with developers.

**When does Antler make sense?**
Antler is an excellent program, but it is fundamentally an "incubator/company builder." It is best for people who *want* to start a company but don't have an idea or a co-founder yet. 
- They take higher equity for less money (typically ~10% for $100k-$250k, depending on your region). 
- Because you have already built a deeply technical product, shipped it, and launched it on Product Hunt, you have outgrown Antler's primary value proposition. 

### Top VCs for AI Developer Tools & Infra (Pre-Seed / Seed)

**Tier 1: The DevTool & Infra Heavyweights**
* **a16z (Andreessen Horowitz) - Open Source / AI Track:** They have published extensive theses on the "Modern AI Stack" and understand vector databases perfectly.
* **Sequoia Capital (Arc Program):** Sequoia backed Langchain and heavily invests in the AI agent ecosystem. Their Arc program is great for early-stage.
* **CRV (Charles River Ventures):** Excellent track record in developer infrastructure (Vercel, Postman). 
* **Bain Capital Ventures (BCV):** Very active in the open-source and developer-led growth spaces.

**Tier 2: Elite Early-Stage / Pre-Seed AI Funds**
* **Pear VC:** Known for backing technical founders at the absolute earliest stages (often pre-revenue). 
* **Basis Set Ventures:** They focus purely on AI/ML and technical infrastructure.
* **Race Capital:** Extremely active in data infrastructure and developer tools. 
* **Pioneer Fund:** A network of YC alumni that invests in highly technical early-stage startups.

**Angel Investors to Target**
For a product like Libro, angels are often better than VCs for your first $250k because they understand the tech immediately. Look for founders of other DevTools (e.g., founders of Supabase, Vercel, Prisma) or early engineers at OpenAI, Anthropic, or Pinecone.`;

  console.log("Generating embedding...");
  const embedding = await generateEmbedding(content, 'search_document');
  const embString = JSON.stringify(embedding);

  console.log("Inserting memory into DB...");
  await db.execute(sql`
    INSERT INTO memories (api_key_id, end_user_id, content, embedding, metadata)
    VALUES (${keys.rows[0].id}, ${users.rows[0].id}, ${content}, ${embString}::vector, '{"source": "Antigravity Research", "topic": "VC Fundraising", "categories": ["Y Combinator", "Antler"]}'::jsonb)
  `);

  console.log("Ingested successfully! Check your dashboard.");
}

run().catch(console.error).finally(() => process.exit(0));
