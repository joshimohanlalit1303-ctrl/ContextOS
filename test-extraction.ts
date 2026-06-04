import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { PassportExtractionEngine } from "./lib/engines/PassportExtractionEngine";

async function run() {
  const history = [
    { role: "user", content: "Can you explain merge sort?" },
    { role: "assistant", content: "Merge sort is a divide and conquer algorithm..." }
  ];
  
  try {
    const result = await PassportExtractionEngine.extract(history);
    console.log("Success:", result);
  } catch (error: any) {
    console.error("Error details:", error);
  }
}
run();
