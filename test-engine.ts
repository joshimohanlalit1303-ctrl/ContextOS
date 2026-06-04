import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { ProfileExtractionEngine } from './lib/engines/ProfileExtractionEngine';
import { SemanticDeduplicationEngine } from './lib/engines/SemanticDeduplicationEngine';

async function run() {
  console.log("Testing Semantic Deduplication Engine...");
  try {
    const embedding = await SemanticDeduplicationEngine.generateEmbedding("i lova chicken, i am a enginner");
    console.log("Embedding length:", embedding.length);
  } catch (err) {
    console.error("Semantic Error:", err);
  }

  console.log("Testing Profile Extraction Engine...");
  try {
    const extracted = await ProfileExtractionEngine.extract("i lova chicken, i am a enginner");
    console.log("Extracted Profile:", JSON.stringify(extracted, null, 2));
  } catch (err) {
    console.error("Extraction Error:", err);
  }
}

run();
