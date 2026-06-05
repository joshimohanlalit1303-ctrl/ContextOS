#!/usr/bin/env node

const { LibroClient } = require("../dist/index.js");

const MEMORIES = [
  // Personal Preferences (P1-P10)
  { id:"P1",  cat:"pref",     text:"User prefers dark mode in all applications, IDEs, and operating systems." },
  { id:"P2",  cat:"pref",     text:"User uses 2-space indentation and strictly prefers spaces over tabs." },
  { id:"P3",  cat:"pref",     text:"User uses VSCode as their primary IDE with Vim keybindings enabled." },
  { id:"P4",  cat:"pref",     text:"User prefers concise, direct answers without unnecessary filler words." },
  { id:"P5",  cat:"pref",     text:"User prefers async communication (Slack, email) over live meetings." },
  { id:"P6",  cat:"pref",     text:"User always chooses TypeScript over plain JavaScript for any project." },
  { id:"P7",  cat:"pref",     text:"User manages multi-package repos using pnpm workspaces." },
  { id:"P8",  cat:"pref",     text:"User listens to lo-fi hip hop music exclusively while coding." },
  { id:"P9",  cat:"pref",     text:"User uses a standing desk and alternates every hour between sitting and standing." },
  { id:"P10", cat:"pref",     text:"User tracks all tasks in Notion and uses GitHub Issues for bug tracking." },
  // Life & Schedule (L1-L10)
  { id:"L1",  cat:"life",     text:"User is based in India and works in the IST timezone (UTC+5:30)." },
  { id:"L2",  cat:"life",     text:"User drinks black coffee every morning with no sugar or milk added." },
  { id:"L3",  cat:"life",     text:"User is most productive in the evening between 8pm and midnight IST." },
  { id:"L4",  cat:"life",     text:"User is strictly vegetarian and does not eat meat, fish, or eggs." },
  { id:"L5",  cat:"life",     text:"User is building their first startup with no prior founder experience." },
  { id:"L6",  cat:"life",     text:"User exercises every morning for 30 minutes before starting the workday." },
  { id:"L7",  cat:"life",     text:"User works in 90-minute deep work sprints with 15-minute breaks." },
  { id:"L8",  cat:"life",     text:"User speaks both English and Hindi fluently." },
  { id:"L9",  cat:"life",     text:"User is 22 years old and has a computer science degree." },
  { id:"L10", cat:"life",     text:"User works on a MacBook Air M2 with 16GB of RAM." },
  // Tech Stack (T1-T10)
  { id:"T1",  cat:"tech",     text:"User's primary stack is Next.js 15, TypeScript, Tailwind CSS, and Supabase." },
  { id:"T2",  cat:"tech",     text:"User uses Drizzle ORM for all type-safe database access." },
  { id:"T3",  cat:"tech",     text:"User's primary database is PostgreSQL with the pgvector extension." },
  { id:"T4",  cat:"tech",     text:"User deploys all applications on Vercel using a Pro account." },
  { id:"T5",  cat:"tech",     text:"User uses GitHub Actions for all CI/CD pipeline automation." },
  { id:"T6",  cat:"tech",     text:"User sends transactional email through Resend." },
  { id:"T7",  cat:"tech",     text:"User implements API rate limiting with Upstash Redis and @upstash/ratelimit." },
  { id:"T8",  cat:"tech",     text:"User monitors product analytics and errors with PostHog." },
  { id:"T9",  cat:"tech",     text:"User builds Chrome extensions as part of the Libro product suite." },
  { id:"T10", cat:"tech",     text:"User manages a Node.js monorepo with separate packages for SDK and web app." },
  // Libro Product (B1-B10)
  { id:"B1",  cat:"libro",    text:"Libro is an AI memory SDK that provides ingest() and getContext() developer APIs." },
  { id:"B2",  cat:"libro",    text:"Libro uses pgvector with HNSW indexing for all semantic vector searches." },
  { id:"B3",  cat:"libro",    text:"Libro generates embeddings using Xenova/all-MiniLM-L6-v2 running locally." },
  { id:"B4",  cat:"libro",    text:"Libro's primary target market is AI startup developers and indie hackers." },
  { id:"B5",  cat:"libro",    text:"Libro is deployed at https://libro.co.in and published on npm as libro-sdk." },
  { id:"B6",  cat:"libro",    text:"Libro uses cosine similarity with a 0.45 threshold to filter irrelevant memories." },
  { id:"B7",  cat:"libro",    text:"Libro uses API key based multi-tenant isolation between developer projects." },
  { id:"B8",  cat:"libro",    text:"Libro's main competitor is mem0.ai, a YCombinator-backed AI memory startup." },
  { id:"B9",  cat:"libro",    text:"Libro's unique feature is the Context Passport for cross-platform AI context portability." },
  { id:"B10", cat:"libro",    text:"Libro's developer waitlist is promoted on ProductHunt and Twitter." },
  // Goals (G1-G10)
  { id:"G1",  cat:"goal",     text:"User's goal is to reach 100 paying developer customers before Q3 2025." },
  { id:"G2",  cat:"goal",     text:"User wants to raise a $500K pre-seed round to hire two engineers." },
  { id:"G3",  cat:"goal",     text:"User aims to make Libro the default memory layer for all AI applications." },
  { id:"G4",  cat:"goal",     text:"User needs to ship a stable v1.0 SDK release with complete documentation." },
  { id:"G5",  cat:"goal",     text:"User plans to launch on Product Hunt within the next four weeks." },
  { id:"G6",  cat:"goal",     text:"User wants to create official Libro plugins for LangChain and LlamaIndex." },
  { id:"G7",  cat:"goal",     text:"User's revenue target is $1K monthly recurring revenue by the end of the year." },
  { id:"G8",  cat:"goal",     text:"User wants to open source the SDK while monetizing the hosted infrastructure." },
  { id:"G9",  cat:"goal",     text:"User wants to build an active developer community around Libro on Discord." },
  { id:"G10", cat:"goal",     text:"User needs to complete and submit the YCombinator batch application." },
  // Coding Habits (C1-C10)
  { id:"C1",  cat:"code",     text:"User writes unit tests for all public API functions before merging PRs to main." },
  { id:"C2",  cat:"code",     text:"User follows conventional commits (feat:, fix:, chore:) for all git history." },
  { id:"C3",  cat:"code",     text:"User reviews all TypeScript errors manually even when build errors are suppressed." },
  { id:"C4",  cat:"code",     text:"User prefers functional programming patterns and avoids class-based code." },
  { id:"C5",  cat:"code",     text:"User documents all public APIs with JSDoc comments that include usage examples." },
  { id:"C6",  cat:"code",     text:"User validates all API inputs using Zod schemas at runtime." },
  { id:"C7",  cat:"code",     text:"User adds React error boundaries to all components that make async API calls." },
  { id:"C8",  cat:"code",     text:"User stores all secrets in environment variables and never commits them to git." },
  { id:"C9",  cat:"code",     text:"User runs a security and performance checklist before merging any pull request." },
  { id:"C10", cat:"code",     text:"User names all variables and functions descriptively without any abbreviations." },
  // Architecture Decisions (D1-D10)
  { id:"D1",  cat:"decision", text:"Decision: Chose Supabase over Firebase for native PostgreSQL and pgvector support." },
  { id:"D2",  cat:"decision", text:"Decision: Chose Drizzle ORM over Prisma for superior TypeScript inference performance." },
  { id:"D3",  cat:"decision", text:"Decision: Uses HNSW index instead of IVFFlat for better small-dataset query performance." },
  { id:"D4",  cat:"decision", text:"Decision: Uses all-MiniLM-L6-v2 locally instead of OpenAI to eliminate variable API costs." },
  { id:"D5",  cat:"decision", text:"Decision: Uses Next.js App Router over Pages Router for server components and streaming." },
  { id:"D6",  cat:"decision", text:"Decision: Chose Vercel over Railway for zero-configuration Next.js deployment." },
  { id:"D7",  cat:"decision", text:"Decision: Implements API key validation with JWTs for simplicity over OAuth." },
  { id:"D8",  cat:"decision", text:"Decision: Stores embeddings as vector columns in PostgreSQL rather than a dedicated vector DB." },
  { id:"D9",  cat:"decision", text:"Decision: Built a Chrome Extension as the primary user-facing product for the Passport feature." },
  { id:"D10", cat:"decision", text:"Decision: Chose Gemini 2.5 Flash for passport extraction due to its free tier and context window." },
  // Team (TM1-TM10)
  { id:"TM1", cat:"team",     text:"User is a solo founder with no co-founder or employees yet." },
  { id:"TM2", cat:"team",     text:"User's mentor is a YCombinator alum advising on go-to-market strategy." },
  { id:"TM3", cat:"team",     text:"User's advisors recommended focusing solely on developer tools as the primary market." },
  { id:"TM4", cat:"team",     text:"User plans to hire a full-stack engineer after reaching $5K MRR." },
  { id:"TM5", cat:"team",     text:"User actively participates in Buildspace and Indie Hackers communities." },
  { id:"TM6", cat:"team",     text:"User received the first $10K in angel funding from a college professor." },
  { id:"TM7", cat:"team",     text:"User's biggest challenge is marketing and getting developer attention on Twitter." },
  { id:"TM8", cat:"team",     text:"User posts weekly progress updates on Twitter to build in public." },
  { id:"TM9", cat:"team",     text:"User has applied to YCombinator, Antler, and Surge accelerators." },
  { id:"TM10",cat:"team",     text:"User joined an AI founders cohort to gather early product feedback on Libro." },
  // Known Problems (PR1-PR10)
  { id:"PR1", cat:"problem",  text:"Problem: Xenova model causes 2-3 second cold start on first API request after idle." },
  { id:"PR2", cat:"problem",  text:"Problem: Supabase free tier 500MB limit is insufficient for 10K+ stored memories." },
  { id:"PR3", cat:"problem",  text:"Problem: No rate limiting on SDK API endpoints, creating abuse risk." },
  { id:"PR4", cat:"problem",  text:"Problem: match_threshold of 0.2 is too permissive and returns irrelevant memories." },
  { id:"PR5", cat:"problem",  text:"Problem: SDK has no method for deleting or updating existing stored memories." },
  { id:"PR6", cat:"problem",  text:"Problem: TypeScript build errors are silently ignored in next.config.mjs." },
  { id:"PR7", cat:"problem",  text:"Problem: No monitoring or alerting when API routes return 500 errors in production." },
  { id:"PR8", cat:"problem",  text:"Problem: PipelineSingleton had a race condition bug causing double model instantiation." },
  { id:"PR9", cat:"problem",  text:"Problem: No memory deduplication — identical memories can be stored multiple times." },
  { id:"PR10",cat:"problem",  text:"Problem: GDPR compliance is missing — no right to erasure or data export API endpoint." },
];


const QUERIES = [
  { q:"Does the user prefer dark or light mode?",               expect:["P1"] },
  { q:"What code editor does the user use?",                    expect:["P3"] },
  { q:"What is the user's preference for answer style?",        expect:["P4"] },
  { q:"Does the user prefer meetings or async communication?",  expect:["P5"] },
  { q:"What programming language does the user prefer?",        expect:["P6"] },
  { q:"What music does the user listen to while coding?",       expect:["P8"] },
  { q:"What country does the user live in?",                    expect:["L1"] },
  { q:"How does the user take their morning coffee?",           expect:["L2"] },
  { q:"When does the user work best?",                          expect:["L3"] },
  { q:"Is the user vegetarian or do they eat meat?",            expect:["L4"] },
  { q:"What laptop hardware does the user work on?",            expect:["L10"] },
  { q:"What frontend framework does the user use?",             expect:["T1"] },
  { q:"What ORM does the user use for database queries?",       expect:["T2"] },
  { q:"What database technology does the user rely on?",        expect:["T3"] },
  { q:"Where does the user deploy their applications?",         expect:["T4"] },
  { q:"How does the user send transactional emails?",           expect:["T6"] },
  { q:"How does the user implement API rate limiting?",         expect:["T7"] },
  { q:"What does Libro actually do as a product?",              expect:["B1"] },
  { q:"What indexing algorithm does Libro use?",                expect:["B2"] },
  { q:"What embedding model powers Libro?",                     expect:["B3"] },
  { q:"Who are Libro's ideal customers?",                       expect:["B4"] },
  { q:"What makes Libro different from competitors?",           expect:["B9"] },
  { q:"What is Libro's monthly revenue target?",                expect:["G7"] },
  { q:"Does the user plan to open source anything?",            expect:["G8"] },
  { q:"How much funding does the user want to raise?",          expect:["G2"] },
  { q:"Does the user write tests before shipping?",             expect:["C1"] },
  { q:"What git commit style does the user follow?",            expect:["C2"] },
  { q:"Why did the user choose Supabase?",                      expect:["D1"] },
  { q:"Why Drizzle instead of Prisma?",                         expect:["D2"] },
  { q:"Why HNSW over IVFFlat?",                                 expect:["D3"] },
  { q:"Why not use OpenAI for embeddings?",                     expect:["D4"] },
  { q:"Does the user have any co-founders?",                    expect:["TM1"] },
  { q:"When does the user plan to hire?",                       expect:["TM4"] },
  { q:"What accelerators has the user applied to?",             expect:["TM9"] },
  { q:"What book is the user currently reading?",               expect:["R1"] },
  { q:"What is the main performance bottleneck?",               expect:["PR1"] },
  { q:"Is there a problem with the similarity threshold?",      expect:["PR4"] },
  { q:"Is the API rate limited?",                               expect:["PR3"] },
  { q:"What SDK methods are missing?",                          expect:["PR5"] },
  { q:"What GDPR issues does the product have?",                expect:["PR10"] },
  { q:"How does the user track bugs and issues?",               expect:["P10"] },
  { q:"What communities does the user participate in?",         expect:["TM5"] },
  { q:"How often does the user post on social media?",          expect:["TM8"] },
  { q:"What analytics tool does the user use?",                 expect:["T8"] },
  { q:"Who is Libro's main competitor?",                        expect:["B8"] },
  { q:"What CI/CD does the user use?",                          expect:["T5"] },
  { q:"What Chrome extension is being built?",                  expect:["T9"] },
  { q:"What monorepo tool does the user use?",                  expect:["P7"] },
  { q:"What is the user's biggest marketing challenge?",        expect:["TM7"] },
  { q:"Where does the user plan to publicly launch?",           expect:["G5"] },
];


const args = process.argv.slice(2);
let libroKey = null;
let mem0Key = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--libro-key" && args[i+1]) {
    libroKey = args[i+1];
  }
  if (args[i] === "--mem0-key" && args[i+1]) {
    mem0Key = args[i+1];
  }
}

if (!libroKey) {
  libroKey = "libro_sk_zsjekcdivrnplylpcpwpl";
}

const USER_ID = "compare_user_123";

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testLibro(client) {
  console.log("\n=== 📘 Testing Libro ===");
  console.log("Ingesting 100 memories...");
  const startIngest = Date.now();
  let errors = 0;
  for (const m of MEMORIES) {
    try {
      await client.ingest({ userId: USER_ID, text: m.text, metadata: { id: m.id } });
    } catch(e) {
      errors++;
    }
  }
  const ingestTime = Date.now() - startIngest;
  console.log(`Ingest Complete: ${ingestTime}ms (${errors} errors)`);

  console.log("\nRunning 20 Retrieval Queries...");
  let correct = 0;
  let totalLatency = 0;
  
  for (const q of QUERIES) {
    const startQ = Date.now();
    try {
      const res = await client.getContext({ userId: USER_ID, query: q.q });
      const lat = Date.now() - startQ;
      totalLatency += lat;
      
      const found = res.memories && res.memories.length > 0 && res.memories[0].metadata?.id === q.expect[0];
      if (found) correct++;
      
      const status = found ? "✅" : "❌";
      console.log(`  ${status} [${lat}ms] "${q.q}"`);
    } catch(e) {
      console.log(`  ⚠️ Error on query: ${q.q}`);
    }
  }

  const avgLatency = Math.round(totalLatency / QUERIES.length);
  const precision = (correct / QUERIES.length) * 100;
  
  return { ingestTime, avgLatency, precision };
}

async function testMem0(apiKey) {
  console.log("\n=== 🧠 Testing Mem0 ===");
  console.log("Ingesting 100 memories...");
  
  const headers = {
    "Authorization": `Token ${apiKey}`,
    "Content-Type": "application/json"
  };
  
  const startIngest = Date.now();
  let errors = 0;
  for (const m of MEMORIES) {
    try {
      const res = await fetch("https://api.mem0.ai/v1/memories/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [{ role: "user", content: m.text }],
          user_id: USER_ID,
          metadata: { id: m.id }
        })
      });
      if (!res.ok) errors++;
    } catch(e) {
      errors++;
    }
    await wait(50);
  }
  const ingestTime = Date.now() - startIngest;
  console.log(`Ingest Complete: ${ingestTime}ms (${errors} errors)`);

  console.log("\nRunning 20 Retrieval Queries...");
  let correct = 0;
  let totalLatency = 0;
  
  for (const q of QUERIES) {
    const startQ = Date.now();
    try {
      const res = await fetch("https://api.mem0.ai/v1/memories/search/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: q.q,
          user_id: USER_ID
        })
      });
      const data = await res.json();
      const lat = Date.now() - startQ;
      totalLatency += lat;
      
      const found = data && data.length > 0 && data[0].metadata?.id === q.expect[0];
      if (found) correct++;
      
      const status = found ? "✅" : "❌";
      console.log(`  ${status} [${lat}ms] "${q.q}"`);
    } catch(e) {
      console.log(`  ⚠️ Error on query: ${q.q}`);
    }
    await wait(100);
  }

  const avgLatency = Math.round(totalLatency / QUERIES.length);
  const precision = (correct / QUERIES.length) * 100;
  
  return { ingestTime, avgLatency, precision };
}

async function main() {
  console.log("🚀 Starting Comparative Benchmark Suite...");
  
  const libroClient = new LibroClient({ apiKey: libroKey, baseUrl: "http://localhost:3000" });
  
  console.log("Cleaning up previous test data for clean slate...");
  try { await libroClient.forget({ userId: USER_ID }); } catch(e){}

  const libroStats = await testLibro(libroClient);
  
  let mem0Stats = null;
  if (mem0Key) {
    try {
      await fetch(`https://api.mem0.ai/v1/memories/?user_id=${USER_ID}`, {
        method: "DELETE",
        headers: { "Authorization": `Token ${mem0Key}` }
      });
    } catch(e){}
    mem0Stats = await testMem0(mem0Key);
  } else {
    console.log("\n⚠️ Skipping Mem0 test. Provide --mem0-key to run comparative test.");
  }
  
  console.log("\n=======================================================");
  console.log("                 🏆 FINAL SCORECARD                  ");
  console.log("=======================================================");
  console.log(`Metric              │ Libro (Local)      │ Mem0 (Managed)    `);
  console.log(`--------------------┼--------------------┼-------------------`);
  console.log(`Ingest Time (100)   │ ${libroStats.ingestTime}ms            │ ${mem0Stats ? mem0Stats.ingestTime+"ms" : "N/A"}`);
  console.log(`Avg Query Latency   │ ${libroStats.avgLatency}ms              │ ${mem0Stats ? mem0Stats.avgLatency+"ms" : "N/A"}`);
  console.log(`Precision@1 (Acc)   │ ${libroStats.precision}%                │ ${mem0Stats ? mem0Stats.precision+"%" : "N/A"}`);
  console.log("=======================================================\n");

}

main();
