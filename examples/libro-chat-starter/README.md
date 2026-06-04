# Libro Chat Starter 🧠

A beautiful, open-source Next.js chatbot template powered by [Libro.co.in](https://libro.co.in). 
This starter template demonstrates how to give your LLMs **infinite memory** and context retention with just two lines of code using the Libro SDK.

![Libro Chat Starter](https://libro.co.in/logo.png)

## Why use this?
If you build AI applications with standard RAG or context windows, your bot will forget who the user is, what their preferences are, and what happened 5 minutes ago unless you build a complex Vector DB pipeline.
This template uses **Libro**—the drop-in User Context Layer—to automatically extract, deduplicate, and inject semantic user memory into the prompt.

## Tech Stack
- **Framework:** Next.js 14 App Router
- **AI SDK:** Vercel AI SDK (`ai` & `@ai-sdk/openai`)
- **Memory Layer:** Libro SDK
- **Styling:** Tailwind CSS

## Quickstart

### 1. Clone & Install
```bash
git clone https://github.com/your-username/libro-chat-starter.git
cd libro-chat-starter
npm install
```

### 2. Configure API Keys
Rename `.env.example` to `.env.local` and add your keys:
```env
OPENAI_API_KEY=sk-your-openai-key
LIBRO_API_KEY=your-libro-api-key # Get this free from https://libro.co.in
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and say "My name is John". Then open a new incognito window, start a new chat, and ask "What is my name?" The bot will remember you!

## How it works
Look inside `app/api/chat/route.ts`. The magic happens before we call OpenAI:

```typescript
// 1. Ingest the user's message so Libro can extract facts
await libro.ingest({ userId, text: message });

// 2. Retrieve the user's long-term profile
const context = await libro.getContext({ userId });

// 3. Inject it into the system prompt!
```

## Contributing
Pull requests are welcome! If you want to integrate Anthropic or Google Gemini, the `ai` SDK makes it trivial to swap out the provider.
