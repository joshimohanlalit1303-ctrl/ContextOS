import os
import time
from dotenv import load_dotenv
from libro import LibroClient

# Load environment variables
load_dotenv()

# Initialize the Python SDK (Local Execution Agent)
libro = LibroClient(
    api_key=os.getenv("LIBRO_API_KEY"),
    base_url="http://localhost:3000" # Point to your production URL in real apps
)

def run_local_agent():
    print("🤖 [Local Agent] Waking up. Checking Libro for new context passports...")
    
    user_id = "demo_user_123"
    
    try:
        # Fetch the memory that the JS frontend just saved
        print(f"📥 [Local Agent] Downloading passport for {user_id}...")
        passport = libro.get_context(user_id=user_id, query="What database schema or tasks did I request recently?")
        
        if not passport or "context" not in passport:
            print("❌ No context found. Did you run the JS script first?")
            return
            
        print("\n=================================================")
        print(f"📖 CONTEXT LOADED FROM CLOUD")
        print(f"Context: {passport['context']}")
        print("=================================================\n")
        
        # Simulate autonomous execution
        print("⚙️ [Local Agent] Local execution flag detected!")
        print("⚙️ [Local Agent] Generating SQL migrations based on web schema...")
        time.sleep(2) # Simulate work
        print("✅ [Local Agent] Created 0001_initial_schema.sql on local machine.")
        print("✅ [Local Agent] Task complete. State synchronized across JS and Python via Libro.")
            
    except Exception as e:
        print(f"❌ Failed to load context: {str(e)}")

if __name__ == "__main__":
    run_local_agent()
