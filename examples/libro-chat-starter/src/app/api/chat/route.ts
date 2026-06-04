import { openai } from '@ai-sdk/openai';
import { streamText, Message } from 'ai';
import { LibroClient } from '@/lib/libro-sdk';

export const maxDuration = 30;

// Initialize Libro Client (You would get this API Key from the Libro Dashboard)
const libro = new LibroClient({
  apiKey: process.env.LIBRO_API_KEY || 'demo-key',
  baseUrl: process.env.LIBRO_API_URL || 'https://api.libro.co.in',
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // We use a dummy user ID for the starter template
  const userId = 'demo-user-123';
  const latestMessage = messages[messages.length - 1];

  let systemContext = "You are a helpful AI assistant.";

  try {
    // 1. INGEST: Send the user's latest message to Libro to be semantically stored
    if (latestMessage.role === 'user') {
      await libro.ingest({
        userId: userId,
        text: latestMessage.content,
      });
    }

    // 2. RETRIEVE: Fetch the updated context for this user
    const contextRes = await libro.getContext({ userId });
    
    if (contextRes?.profile) {
      systemContext += `\n\nHere is what you currently know about the user:\n${contextRes.profile}`;
    }
  } catch (error) {
    console.error("Libro SDK Error:", error);
    // Even if Libro fails (e.g. no API key), we still allow the chat to continue gracefully.
  }

  // 3. STREAM: Call OpenAI with the injected Libro context
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemContext,
    messages,
  });

  return result.toDataStreamResponse();
}
