import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const CapsuleSchema = z.object({
  name: z.string().describe("A concise, memorable name for this chat capsule (e.g., 'React Auth Flow Context')"),
  description: z.string().describe("A brief 1-2 sentence summary of what this chat conversation is about"),
  system: z.string().describe("A system prompt that tells the next AI agent exactly how to continue this conversation and what its role is."),
});

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Validate JWT
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ error: "Invalid JWT" }, { status: 401 });
    }

    const payload = await request.json();
    const history = payload.history;

    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json({ error: "No chat history provided" }, { status: 400 });
    }

    // Convert history to string for Gemini
    const historyString = history.map((msg: any) => `[${msg.role.toUpperCase()}]: ${msg.content}`).join("\n\n");
    // Limit to prevent huge token costs for the summary (take the last 15,000 chars roughly)
    const truncatedHistory = historyString.slice(-15000);

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"), // Fixed model name
      schema: CapsuleSchema,
      system: `You are an AI assistant helping a user export their chat history into a "Capsule". 
A Capsule is a JSON prompt payload that will be fed to a NEW AI agent so it can seamlessly continue the conversation.
Your job is to read the attached chat history, generate a short title, a description, and a 'system' prompt that instructs the next AI on how to act.`,
      prompt: `Chat History:\n\n${truncatedHistory}\n\nGenerate the capsule metadata.`
    });

    // Construct the final JSON capsule matching the user's requested format
    const capsule = {
      name: object.name,
      description: object.description,
      model: "claude-3-5-sonnet-20241022", // Default placeholder
      max_tokens: 8192,
      system: object.system,
      prompt: "I am continuing a previous session. Below is our chat history so far. Please acknowledge and ask me what I want to do next.\n\n" + historyString,
      output_format: {
        type: "text",
        structure: []
      },
      meta: {
        exported_via: "ContextOS",
        message_count: history.length,
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json({ capsule });

  } catch (error: any) {
    console.error("Export Chat Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}
