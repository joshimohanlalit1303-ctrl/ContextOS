# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /build

# Copy the entire monorepo context (docker context is the root of contextOS)
# We need both libro-sdk and libro-mcp-server
COPY packages/libro-sdk ./packages/libro-sdk
COPY packages/libro-mcp-server ./packages/libro-mcp-server

# Build libro-sdk first (it's a file: dependency)
WORKDIR /build/packages/libro-sdk
RUN npm install && npm run build

# Now build the MCP server - it bundles libro-sdk via tsup, so no file: dep needed at runtime
WORKDIR /build/packages/libro-mcp-server
RUN npm install && npm run build

# ---- Runtime Stage ----
FROM node:20-alpine

WORKDIR /app

# Copy only the built dist and package metadata
COPY --from=builder /build/packages/libro-mcp-server/dist ./dist
COPY --from=builder /build/packages/libro-mcp-server/package.json ./package.json

# Install only production runtime deps (express, cors, @modelcontextprotocol/sdk)
# tsup bundled everything else, so we only need what's in dependencies, not devDependencies
RUN npm install --omit=dev

# Expose the port
EXPOSE 3001

# Start in SSE mode
CMD ["node", "dist/index.js", "--sse"]
