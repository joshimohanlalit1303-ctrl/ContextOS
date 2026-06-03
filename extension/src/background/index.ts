import { supabase } from '../lib/supabase';

// In production this would be your deployed Next.js URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === 'PROMPT_TRACKED') {
    handlePrompt(message.payload);
  }
});

async function handlePrompt(payload: { text: string; timestamp: string; source: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.log("ContextOS: No active session. Cannot sync context.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/extension/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}` // Send the JWT
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: payload.text }],
        source: payload.source
      })
    });
    
    if (!response.ok) {
      console.error("ContextOS: Failed to ingest context", await response.text());
    } else {
      console.log("ContextOS: Successfully synced context to backend.");
    }
  } catch (error) {
    console.error("ContextOS: Network error during ingestion", error);
  }
}
