/**
 * Libro SDK - Cold Start & Retrieval Accuracy Benchmark
 * 
 * Run: node benchmark.js
 * 
 * Tests:
 * 1. Cold start latency (first ingest call)
 * 2. Warm start latency (subsequent calls, 5 runs)
 * 3. Retrieval accuracy (10 memories, 10 queries, precision/recall)
 */

const { LibroClient } = require("libro-sdk");

const client = new LibroClient({
  apiKey: "libro_sk_zsjekcdivrnplylpcpwpl",
  baseUrl: "http://localhost:3000",
});

// Unique user ID for this benchmark run (isolated from other tests)
const BENCH_USER = `bench-${Date.now()}`;

// ─── Test Dataset ───────────────────────────────────────────────────────────
// 10 memories to ingest
const MEMORIES = [
  { id: "M1",  text: "User prefers dark mode in all applications and IDEs." },
  { id: "M2",  text: "User's favorite programming language is TypeScript." },
  { id: "M3",  text: "User drinks black coffee every morning, no sugar or milk." },
  { id: "M4",  text: "User is building a startup called Libro, an AI memory SDK." },
  { id: "M5",  text: "User deployed their application on Vercel." },
  { id: "M6",  text: "User uses Supabase with pgvector for their database." },
  { id: "M7",  text: "User prefers concise and direct answers without filler words." },
  { id: "M8",  text: "User works best in the evening between 8pm and midnight." },
  { id: "M9",  text: "User is based in India and is building their first startup." },
  { id: "M10", text: "User prefers 2-space indentation and uses VSCode as their IDE." },
];

// 10 queries with which memory IDs they SHOULD retrieve
const QUERIES = [
  { q: "Does the user prefer light or dark mode?",         expect: ["M1"] },
  { q: "What language does the user code in?",            expect: ["M2"] },
  { q: "How does the user take their coffee?",            expect: ["M3"] },
  { q: "What is the user building?",                      expect: ["M4"] },
  { q: "Where is the user's app hosted?",                 expect: ["M5"] },
  { q: "What database is the user using?",                expect: ["M6"] },
  { q: "How does the user like to receive information?",  expect: ["M7"] },
  { q: "When does the user like to work?",                expect: ["M8"] },
  { q: "Where is the user located?",                      expect: ["M9"] },
  { q: "What IDE and code style does the user use?",      expect: ["M10"] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function bar(label, ms, maxMs = 3000) {
  const filled = Math.min(Math.round((ms / maxMs) * 30), 30);
  const empty = 30 - filled;
  const color = ms < 300 ? "\x1b[32m" : ms < 1000 ? "\x1b[33m" : "\x1b[31m";
  return `${color}${"█".repeat(filled)}${"░".repeat(empty)}\x1b[0m ${ms}ms`;
}

function header(title) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"═".repeat(60)}`);
}

// ─── 1. Cold Start Test ───────────────────────────────────────────────────────
async function testColdStart() {
  header("PHASE 1: COLD START LATENCY");
  console.log("  Simulates the very first request after function idle.\n");

  const t0 = Date.now();
  try {
    await client.ingest({
      userId: BENCH_USER,
      text: "Cold start probe memory.",
      metadata: { source: "benchmark" },
    });
    const coldMs = Date.now() - t0;
    console.log(`  First ingest():  ${bar("cold", coldMs)}`);
    
    const verdict = coldMs < 500 
      ? "✅ EXCELLENT - HF API is warm and fast" 
      : coldMs < 1500 
        ? "⚠️  ACCEPTABLE - HF model may have been loading"
        : "❌ SLOW - HF model was cold or network issue";
    console.log(`\n  Verdict: ${verdict}`);
    return coldMs;
  } catch (err) {
    console.error(`  ❌ Cold start failed: ${err.message}`);
    return null;
  }
}

// ─── 2. Warm Start Test ───────────────────────────────────────────────────────
async function testWarmStart() {
  header("PHASE 2: WARM START LATENCY (5 runs)");
  console.log("  HF model is now warmed up. Measuring steady-state performance.\n");

  const times = [];
  for (let i = 1; i <= 5; i++) {
    const t0 = Date.now();
    try {
      await client.ingest({
        userId: BENCH_USER,
        text: `Warm start probe #${i}: user is testing the Libro SDK.`,
        metadata: { source: "benchmark" },
      });
      const ms = Date.now() - t0;
      times.push(ms);
      console.log(`  Run ${i}:  ${bar("warm", ms, 1000)}`);
      await sleep(200);
    } catch (err) {
      console.error(`  Run ${i}: ❌ ${err.message}`);
    }
  }

  if (times.length > 0) {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const p99 = times.sort((a, b) => a - b)[times.length - 1];
    const min = times[0];
    console.log(`\n  ┌─────────────────────────────┐`);
    console.log(`  │ Min:  ${String(min).padEnd(6)}ms               │`);
    console.log(`  │ Avg:  ${String(avg).padEnd(6)}ms               │`);
    console.log(`  │ P99:  ${String(p99).padEnd(6)}ms               │`);
    console.log(`  └─────────────────────────────┘`);
  }

  return times;
}

// ─── 3. Ingest All Test Memories ─────────────────────────────────────────────
async function ingestTestMemories() {
  header("PHASE 3: INGESTING 10 TEST MEMORIES");
  console.log("  Populating the vector database for retrieval testing...\n");

  const memoryIds = {};
  for (const mem of MEMORIES) {
    const t0 = Date.now();
    try {
      const res = await client.ingest({
        userId: BENCH_USER,
        text: mem.text,
        metadata: { memoryId: mem.id },
      });
      const ms = Date.now() - t0;
      memoryIds[mem.id] = res.memory?.id;
      console.log(`  [${mem.id.padEnd(3)}] ${ms}ms  "${mem.text.slice(0, 55)}..."`);
      await sleep(150); // slight pause to avoid rate limiting
    } catch (err) {
      console.error(`  [${mem.id}] ❌ ${err.message}`);
    }
  }
  return memoryIds;
}

// ─── 4. Retrieval Accuracy Test ───────────────────────────────────────────────
async function testRetrievalAccuracy() {
  header("PHASE 4: RETRIEVAL ACCURACY");
  console.log("  Running 10 semantic queries and checking if correct memories are returned.\n");

  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  const results = [];

  for (const test of QUERIES) {
    const t0 = Date.now();
    try {
      const res = await client.getContext({
        userId: BENCH_USER,
        query: test.q,
      });
      const ms = Date.now() - t0;
      
      // Check what was returned
      const returnedMemories = res.memories || [];
      const returnedTexts = returnedMemories.map(m => m.content);
      
      // Check if expected memory content is in the results
      const expectedText = MEMORIES.find(m => m.id === test.expect[0])?.text || "";
      const hit = returnedTexts.some(t => t.includes(expectedText.slice(0, 40)));
      
      if (hit) {
        truePositives++;
        console.log(`  ✅ [${ms}ms] "${test.q.slice(0, 50)}"`);
        console.log(`       → Hit: "${returnedTexts[0]?.slice(0, 60)}..."\n`);
      } else {
        falseNegatives++;
        console.log(`  ❌ [${ms}ms] "${test.q.slice(0, 50)}"`);
        if (returnedTexts.length > 0) {
          falsePositives++;
          console.log(`       → Got: "${returnedTexts[0]?.slice(0, 60)}..." (wrong)`);
        } else {
          console.log(`       → Got: nothing (empty results)`);
        }
        console.log(`       → Expected: "${expectedText.slice(0, 60)}..."\n`);
      }

      results.push({ query: test.q, hit, ms });
      await sleep(150);
    } catch (err) {
      console.error(`  ❌ Query failed: ${err.message}`);
      falseNegatives++;
    }
  }

  const total = QUERIES.length;
  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1 = 2 * (precision * recall) / (precision + recall) || 0;

  console.log(`\n  ┌──────────────────────────────────────┐`);
  console.log(`  │ Correct retrievals: ${truePositives}/${total}               │`);
  console.log(`  │ Precision:          ${(precision * 100).toFixed(1).padEnd(5)}%            │`);
  console.log(`  │ Recall:             ${(recall * 100).toFixed(1).padEnd(5)}%            │`);
  console.log(`  │ F1 Score:           ${(f1 * 100).toFixed(1).padEnd(5)}%            │`);
  console.log(`  │ False Positives:    ${falsePositives}                      │`);
  console.log(`  │ False Negatives:    ${falseNegatives}                      │`);
  console.log(`  └──────────────────────────────────────┘`);

  const grade = f1 > 0.8 ? "🏆 PRODUCTION READY" 
              : f1 > 0.6 ? "⚠️  ACCEPTABLE (threshold tuning needed)"
              : "❌ NEEDS WORK (check threshold in get-context route)";
  console.log(`\n  Retrieval Grade: ${grade}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n\x1b[1m╔══════════════════════════════════════════════════════╗\x1b[0m");
  console.log("\x1b[1m║        LIBRO SDK - PRODUCTION BENCHMARK SUITE        ║\x1b[0m");
  console.log("\x1b[1m╚══════════════════════════════════════════════════════╝\x1b[0m");
  console.log(`  Server:  http://localhost:3000`);
  console.log(`  User ID: ${BENCH_USER}`);
  console.log(`  Time:    ${new Date().toLocaleTimeString()}`);

  const coldMs = await testColdStart();
  await sleep(500);

  const warmTimes = await testWarmStart();
  await sleep(500);

  await ingestTestMemories();
  console.log("\n  ⏳ Waiting 2s for HNSW index to stabilize...");
  await sleep(2000);

  await testRetrievalAccuracy();

  console.log("\n\x1b[1m╔══════════════════════════════════════════════════════╗\x1b[0m");
  console.log("\x1b[1m║                  BENCHMARK COMPLETE                  ║\x1b[0m");
  console.log("\x1b[1m╚══════════════════════════════════════════════════════╝\x1b[0m\n");
}

main().catch(console.error);
