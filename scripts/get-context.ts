import { LibroClient } from "../packages/libro-sdk/src/index";
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local for credentials
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.LIBRO_API_KEY || "libro_sk_zi78hkadrsidswbmvsdm79";
const USER_ID = process.env.LIBRO_USER_ID || "cfee11ad-03c8-48a6-bf9b-dc93049aea78";
// Use production endpoint
const BASE_URL = "https://www.libro.co.in";

async function fetchContext() {
  const client = new LibroClient({
    apiKey: API_KEY,
    baseUrl: BASE_URL
  });

  try {
    console.log("Searching Hive Mind for: 'What is the color palette for our app?'...");
    const result = await client.getContext({
      userId: USER_ID,
      query: "What is the color palette for our app?"
    });
    
    console.log("\n=== CONTEXT RETRIEVED ===");
    console.log(result.context || "No context found.");
    console.log("=========================\n");
  } catch (err: any) {
    console.error("❌ Failed to retrieve context:", err.message);
  }
}

fetchContext().catch(console.error);
