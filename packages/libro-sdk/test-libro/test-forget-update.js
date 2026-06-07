const { LibroClient } = require("libro-sdk");
const client = new LibroClient({ apiKey: process.env.LIBRO_API_KEY || "libro_sk_...", baseUrl: "http://localhost:3000" });

async function run() {
  console.log("Ingesting a test memory...");
  const ingestRes = await client.ingest({ userId: "gdpr-user", text: "This is a secret GDPR memory." });
  const memoryId = ingestRes.memory?.id;
  console.log("Ingested memory ID:", memoryId);
  
  if (!memoryId) {
    console.error("Failed to ingest memory");
    return;
  }

  console.log("Updating memory...");
  const updateRes = await client.update({ userId: "gdpr-user", memoryId, text: "This is an updated public memory." });
  console.log("Update response:", updateRes.success ? "Success" : updateRes);

  console.log("Checking context...");
  const contextRes = await client.getContext({ userId: "gdpr-user", query: "updated public memory" });
  console.log("Context found:", contextRes.memories.length > 0 ? contextRes.memories[0].content : "None");

  console.log("Forgetting memory...");
  const forgetRes = await client.forget({ userId: "gdpr-user", memoryId });
  console.log("Forget response:", forgetRes.success ? `Deleted ${forgetRes.deletedCount} memories` : forgetRes);

  console.log("Checking context after forget...");
  const contextRes2 = await client.getContext({ userId: "gdpr-user", query: "updated public memory" });
  console.log("Context found after forget:", contextRes2.memories.length > 0 ? contextRes2.memories[0].content : "None");
}
run();
