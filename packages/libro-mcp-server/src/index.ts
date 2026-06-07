#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import { LibroClient } from "libro-sdk";
import express from "express";
import cors from "cors";

const globalBaseUrl = process.env.LIBRO_BASE_URL || "https://context-os.vercel.app";

/**
 * Creates a unique MCP Server and LibroClient instance for a specific user/API key.
 */
function createMcpServer(apiKey: string, defaultUserId?: string) {
  const libro = new LibroClient({ apiKey, baseUrl: globalBaseUrl });

  const server = new Server(
    {
      name: "libro-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "libro_ingest",
          description: "Save an important fact, architectural decision, or context memory to the shared Libro Hive Mind so that other agents or future sessions can retrieve it.",
          inputSchema: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The detailed context or fact to remember.",
              },
              userId: {
                type: "string",
                description: "The user ID or project ID. If omitted, uses the configured global user ID.",
              },
              metadata: {
                type: "object",
                description: "Optional structured JSON metadata.",
              },
            },
            required: ["text"],
          },
        },
        {
          name: "libro_get_context",
          description: "Query the shared Libro Hive Mind to fetch architectural context, past decisions, or user preferences related to the current task.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "A semantic question or search phrase describing what you need to know (e.g. 'What is our database schema?').",
              },
              userId: {
                type: "string",
                description: "The user ID or project ID. If omitted, uses the configured global user ID.",
              },
              limitTimeline: {
                type: "number",
                description: "Max number of recent timeline events to retrieve. Default 10.",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "libro_forget",
          description: "Delete an outdated memory or context from the Hive Mind.",
          inputSchema: {
            type: "object",
            properties: {
              memoryId: {
                type: "string",
                description: "The specific memory UUID to delete.",
              },
              query: {
                type: "string",
                description: "Delete memories matching this semantic query (if memoryId is not known).",
              },
              userId: {
                type: "string",
                description: "The user ID or project ID. If omitted, uses the configured global user ID.",
              },
            },
          },
        },
      ],
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const args = request.params.arguments as Record<string, any>;
    const userId = args.userId || defaultUserId;

    if (!userId) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "userId is required either as an argument or via the connection config."
      );
    }

    try {
      switch (request.params.name) {
        case "libro_ingest": {
          const { text, metadata } = args;
          if (!text) {
            throw new McpError(ErrorCode.InvalidParams, "text is required for ingest.");
          }
          
          const result = await libro.ingest({ userId, text, metadata });
          return {
            content: [
              {
                type: "text",
                text: `Memory ingested successfully.\nResponse: ${JSON.stringify(result, null, 2)}`
              }
            ]
          };
        }

        case "libro_get_context": {
          const { query, limitTimeline } = args;
          if (!query) {
            throw new McpError(ErrorCode.InvalidParams, "query is required for get_context.");
          }

          const result = await libro.getContext({ userId, query, limitTimeline });
          
          const contextStr = result.context || "No context found.";
          
          return {
            content: [
              {
                type: "text",
                text: `Hive Mind Context:\n\n${contextStr}\n\nRaw Response: ${JSON.stringify(result, null, 2)}`
              }
            ]
          };
        }

        case "libro_forget": {
          const { memoryId, query } = args;
          if (!memoryId && !query) {
            throw new McpError(ErrorCode.InvalidParams, "Either memoryId or query is required for forget.");
          }

          const result = await libro.forget({ userId, memoryId, query });
          return {
            content: [
              {
                type: "text",
                text: `Forget command executed.\nResponse: ${JSON.stringify(result, null, 2)}`
              }
            ]
          };
        }

        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Libro SDK Error: ${error.message}`
          }
        ],
        isError: true,
      };
    }
  });

  return server;
}

async function main() {
  const isSSE = process.argv.includes("--sse");

  if (isSSE) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Health check — Render pings this to confirm the service is alive
    app.get("/health", (_req, res) => {
      res.json({ status: "ok", service: "libro-mcp-server", version: "1.0.0" });
    });

    // Root — friendly info page for developers
    app.get("/", (_req, res) => {
      res.json({
        name: "Libro Hive Mind MCP Server",
        description: "Connect your AI agents to a shared, persistent memory using the Model Context Protocol.",
        usage: {
          sse_endpoint: "/sse?apiKey=YOUR_LIBRO_API_KEY&userId=YOUR_HIVE_NAME",
          tools: ["libro_ingest", "libro_get_context", "libro_forget"],
        },
        docs: "https://github.com/joshimohanlalit1303-ctrl/ContextOS",
      });
    });


    const transports = new Map<string, SSEServerTransport>();

    app.get("/sse", async (req, res) => {
      // Allow users to provide their API Key and User ID in the URL, e.g. ?apiKey=xxx&userId=yyy
      const apiKey = (req.query.apiKey as string) || process.env.LIBRO_API_KEY;
      const userId = (req.query.userId as string) || process.env.LIBRO_USER_ID;

      if (!apiKey) {
        res.status(401).send("API Key is required. Pass ?apiKey=... in the URL.");
        return;
      }

      console.log(`New SSE Connection established. UserID: ${userId}`);

      // Create a dedicated server instance for this connection
      const server = createMcpServer(apiKey, userId);
      const transport = new SSEServerTransport("/messages", res);
      
      await server.connect(transport);
      
      // Store the transport so we can route POST requests to it later
      transports.set(transport.sessionId, transport);

      // Remove from map when connection closes
      res.on("close", () => {
        console.log(`SSE Connection closed: ${transport.sessionId}`);
        transports.delete(transport.sessionId);
      });
    });

    app.post("/messages", async (req, res) => {
      const sessionId = req.query.sessionId as string;
      const transport = transports.get(sessionId);

      if (transport) {
        await transport.handlePostMessage(req, res);
      } else {
        res.status(404).send("Session not found or disconnected");
      }
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Libro Multi-Tenant MCP Server running on HTTP SSE (Port ${PORT})`);
      console.log(`SSE Endpoint: http://localhost:${PORT}/sse`);
    });
  } else {
    // StdIO mode for CLI usage
    const apiKey = process.env.LIBRO_API_KEY;
    const userId = process.env.LIBRO_USER_ID;

    if (!apiKey) {
      console.error("LIBRO_API_KEY environment variable is required");
      process.exit(1);
    }

    const server = createMcpServer(apiKey, userId);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Libro MCP Server running on stdio`);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
