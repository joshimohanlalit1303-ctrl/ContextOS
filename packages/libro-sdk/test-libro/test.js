const { LibroClient } = require("libro-sdk");

// Replace this with the API Key you generated in the dashboard!
const client = new LibroClient({
  apiKey: process.env.LIBRO_API_KEY || "libro_sk_...",
  baseUrl: "http://localhost:3000",
});

async function runTest() {
  console.log("🚀 Testing Libro SDK (Free Embeddings)...\n");

  const userId = "user-123";

  // 1. Ingest a memory
  console.log("📝 Ingesting memory...");
  try {
    const ingestRes = await client.ingest({
      userId: userId,
      text: "My favorite color is neon green and I love building Next.js apps.",
      metadata: { source: "test_script" }
    });
    console.log("✅ Ingest success:", ingestRes);
  } catch (err) {
    console.error("❌ Ingest failed:", err.message);
  }

  console.log("\n-----------------------------------\n");

  // 2. Retrieve Context via Semantic Search
  console.log("🧠 Retrieving context for a question...");
  try {
    const contextRes = await client.getContext({
      userId: userId,
      query: "What is my favorite color?",
    });
    console.log("✅ Context result:");
    console.log(contextRes.context);
  } catch (err) {
    console.error("❌ Context retrieval failed:", err.message);
  }
}

runTest();
