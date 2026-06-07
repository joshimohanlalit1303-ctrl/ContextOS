import { LibroClient } from "libro-sdk";
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local for credentials
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.LIBRO_API_KEY || "libro_sk_zi78hkadrsidswbmvsdm79";
const USER_ID = process.env.LIBRO_USER_ID || "cfee11ad-03c8-48a6-bf9b-dc93049aea78";
const BASE_URL = process.env.LIBRO_BASE_URL || "http://localhost:3000";

const ITERATIONS = 20;

async function runBenchmark() {
  console.log(`Starting SDK Benchmark on ${BASE_URL} for ${ITERATIONS} iterations...\n`);
  
  const client = new LibroClient({
    apiKey: API_KEY,
    baseUrl: BASE_URL
  });

  const times: number[] = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    try {
      await client.getContext({
        userId: USER_ID,
        query: "What is the benchmark doing?",
        limitTimeline: 5
      });
      const end = performance.now();
      const duration = end - start;
      times.push(duration);
      process.stdout.write(`✅ [Run ${i + 1}/${ITERATIONS}] Success: ${duration.toFixed(2)}ms\n`);
    } catch (error: any) {
      process.stdout.write(`❌ [Run ${i + 1}/${ITERATIONS}] Failed: ${error.message}\n`);
    }
    
    // Slight artificial delay to prevent rate limit blocks during benchmark
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (times.length === 0) {
    console.log("\nAll requests failed.");
    return;
  }

  // Calculate stats
  const sum = times.reduce((a, b) => a + b, 0);
  const avg = sum / times.length;
  times.sort((a, b) => a - b);
  const p95Index = Math.floor(times.length * 0.95);
  const p95 = times[p95Index];
  
  console.log(`\n=== Benchmark Results ===`);
  console.log(`Success Rate: ${((times.length / ITERATIONS) * 100).toFixed(1)}%`);
  console.log(`Average Latency: ${avg.toFixed(2)}ms`);
  console.log(`P95 Latency: ${p95.toFixed(2)}ms`);
  console.log(`Min Latency: ${times[0].toFixed(2)}ms`);
  console.log(`Max Latency: ${times[times.length - 1].toFixed(2)}ms`);
}

runBenchmark().catch(console.error);
