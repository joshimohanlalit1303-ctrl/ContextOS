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

// Read from env
const apiKey = process.env.LIBRO_API_KEY;
const baseUrl = process.env.LIBRO_BASE_URL || "http://localhost:3000";
const defaultUserId = process.env.LIBRO_USER_ID;

if (!apiKey) {
  console.error("LIBRO_API_KEY environment variable is required");
  process.exit(1);
}

const libro = new LibroClient({ apiKey, baseUrl });

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
              description: "The user ID or project ID. If omitted, uses the LIBRO_USER_ID env variable.",
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
              description: "The user ID or project ID. If omitted, uses the LIBRO_USER_ID env variable.",
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
              description: "The user ID or project ID. If omitted, uses the LIBRO_USER_ID env variable.",
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
      "userId is required either as an argument or via LIBRO_USER_ID environment variable."
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
        
        // Extract context string or formatted string
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

// Start the server
async function main() {
  const isSSE = process.argv.includes("--sse");

  if (isSSE) {
    const app = express();
    app.use(cors());
    
    let transport: SSEServerTransport;

    app.get("/sse", async (req, res) => {
      transport = new SSEServerTransport("/messages", res);
      await server.connect(transport);
    });

    app.post("/messages", async (req, res) => {
      if (transport) {
        await transport.handlePostMessage(req, res);
      } else {
        res.status(400).send("No active SSE connection");
      }
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Libro MCP Server running on HTTP SSE (Port ${PORT})`);
      console.log(`SSE Endpoint: http://localhost:${PORT}/sse`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Libro MCP Server running on stdio`);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
