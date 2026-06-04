export const exploreData: Record<string, { title: string, subtitle: string, description: string, codeSnippet: string }> = {
  "ai-chatbots": {
    title: "AI Chatbots",
    subtitle: "Give your chatbot a persistent personality.",
    description: "Connect Libro to your AI chatbot to instantly give it long-term memory. It remembers user preferences, past topics, and communication styles across every single conversation.",
    codeSnippet: `// 1. Initialize Libro
import { Libro } from '@libro/sdk';
const ctx = new Libro({ apiKey: process.env.CTX_KEY });

// 2. Chatbot receives a message
const userMessage = "Remember that I prefer concise answers.";
await ctx.ingest({
  userId: "user_123",
  content: userMessage
});

// 3. Next session, fetch context before responding
const context = await ctx.getContext("user_123", "How do I invert a binary tree?");
console.log(context); // "User prefers concise answers..."
`
  },
  "coding-assistants": {
    title: "Coding Assistants",
    subtitle: "Project-aware context for your IDE.",
    description: "Build a coding assistant that remembers the user's tech stack, coding style, active bugs, and architectural decisions across sessions. Share context seamlessly across team members.",
    codeSnippet: `// Retrieve context for a coding query
const context = await ctx.getContext(
  "dev_456", 
  "Write a React component for a button."
);
// Libro automatically injects:
// "User uses TailwindCSS, prefers functional components, and uses TypeScript."
`
  },
  "tutors": {
    title: "AI Tutors",
    subtitle: "Adaptive learning paths for every student.",
    description: "Track what each student knows, what confused them, and what worked. Pick up exactly where the last session ended, no re-explaining needed. Personalize every single lesson.",
    codeSnippet: `// Store a student's learning milestone
await ctx.ingest({
  userId: "student_89",
  content: "Struggled with the concept of Mitosis, but understood Meiosis perfectly.",
  metadata: { subject: "Biology 101" }
});

// Generate next lesson plan using context
const learningContext = await ctx.getContext("student_89", "Generate next lesson");
`
  },
  "customer-support": {
    title: "Customer Support",
    subtitle: "Full case history at your fingertips.",
    description: "Every past issue, resolution, and preference available instantly. When a ticket escalates, all memory travels with it. No more asking customers to repeat themselves.",
    codeSnippet: `// Pull full ticket history context for an escalation
const history = await ctx.getContext(
  "customer_12", 
  "User is asking for a refund on order #9999"
);
// AI Support Bot can now respond with full awareness 
// of their previous 3 complaints.
`
  },
  "sales-ai": {
    title: "Sales AI",
    subtitle: "Relationship memory for the full sales cycle.",
    description: "Track every interaction, objection, decision-maker, and milestone across the full sales cycle. Surface the right context at the right moment in the pipeline.",
    codeSnippet: `// Ingest call transcript summary
await ctx.ingest({
  userId: "lead_777",
  content: "Lead objected to pricing. Budget opens up in Q3. Decision maker is Sarah."
});

// AI generates follow-up email in Q3 referencing Sarah and the budget
const emailContext = await ctx.getContext("lead_777", "Draft check-in email");
`
  }
};
