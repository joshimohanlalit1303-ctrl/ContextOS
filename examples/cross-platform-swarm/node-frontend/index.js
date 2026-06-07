const { LibroClient } = require('libro-sdk');
require('dotenv').config();

// Initialize the JS SDK (Frontend/Web Server)
const libro = new LibroClient({
  apiKey: process.env.LIBRO_API_KEY,
  // Using localhost for development, point to your production URL in real apps
  baseUrl: 'http://localhost:3000' 
});

async function runWebHandoff() {
  console.log("🌐 [Web Frontend] User finished planning session in the browser.");
  
  // Simulate a context generated on a web UI
  const contextToSave = {
    userId: "demo_user_123",
    content: "I have drafted the database schema for the new e-commerce app. We need a 'users' table and an 'orders' table. Please write the SQL migrations for this locally.",
    metadata: {
      source: "web_planning_dashboard",
      project: "ecommerce_v2",
      requires_local_execution: true
    }
  };

  console.log("📦 [Web Frontend] Packaging Context Passport...");
  
  try {
    // Save the context to the Libro cloud
    const result = await libro.ingest({
      userId: contextToSave.userId,
      text: contextToSave.content,
      metadata: contextToSave.metadata
    });
    
    console.log("✅ [Web Frontend] Context Passport securely saved to Libro!");
    console.log(`\n=================================================`);
    console.log(`🔑 PASSPORT SAVED FOR USER: ${contextToSave.userId}`);
    console.log(`=================================================\n`);
    console.log("To see the Swarm in action, now run the Python local agent to download and execute this memory.");

  } catch (error) {
    console.error("❌ Failed to save context:", error.message);
  }
}

runWebHandoff();
