import { LibroClient } from "../packages/libro-sdk/src/index";
import fs from "fs";
import path from "path";
import * as dotenv from 'dotenv';

// Load .env.local for credentials
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.LIBRO_API_KEY || "libro_sk_zi78hkadrsidswbmvsdm79";
const USER_ID = process.env.LIBRO_USER_ID || "cfee11ad-03c8-48a6-bf9b-dc93049aea78";
// Use local server
const BASE_URL = "http://localhost:3000";

const ARTIFACT_DIR = "/Users/lalit/.gemini/antigravity-ide/brain/66d6838e-dc5d-41b0-93e1-a8823219980d/artifacts";

async function ingest() {
  const client = new LibroClient({
    apiKey: API_KEY,
    baseUrl: BASE_URL
  });

  const scriptPath = path.join(ARTIFACT_DIR, "yc-founder-video-script.md");
  const analysisPath = path.join(ARTIFACT_DIR, "yc-selection-analysis.md");

  try {
    const scriptContent = fs.readFileSync(scriptPath, "utf-8");
    console.log("Ingesting YC Video Script...");
    await client.ingest({
      userId: USER_ID,
      text: scriptContent,
      metadata: { source: "yc-application", type: "video-script" }
    });
    console.log("✅ YC Video Script ingested successfully.");
  } catch (err: any) {
    console.error("❌ Failed to ingest YC Video Script:", err.message);
  }

  try {
    const analysisContent = fs.readFileSync(analysisPath, "utf-8");
    console.log("Ingesting YC Selection Analysis...");
    await client.ingest({
      userId: USER_ID,
      text: analysisContent,
      metadata: { source: "yc-application", type: "selection-analysis" }
    });
    console.log("✅ YC Selection Analysis ingested successfully.");
  } catch (err: any) {
    console.error("❌ Failed to ingest YC Selection Analysis:", err.message);
  }
}

ingest().catch(console.error);
