const { LibroClient } = require("libro-sdk");
const client = new LibroClient({ apiKey: process.env.LIBRO_API_KEY || "libro_sk_...", baseUrl: "http://localhost:3000" });

async function run() {
  console.log("Forgetting ALL memories for gdpr-user...");
  const forgetRes = await client.forget({ userId: "gdpr-user" });
  console.log("Forget response:", forgetRes.success ? `Deleted ${forgetRes.deletedCount} memories` : forgetRes);

  console.log("Checking context after forgetting all...");
  const contextRes = await client.getContext({ userId: "gdpr-user", query: "GDPR" });
  console.log("Context found:", contextRes.memories.length);
}
run();
