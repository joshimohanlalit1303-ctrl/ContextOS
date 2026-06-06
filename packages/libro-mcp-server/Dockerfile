# Use Node.js 20 Alpine as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy the pre-built dist folder and package metadata
COPY package.json ./
COPY dist ./dist

# Install only production dependencies
RUN npm install --omit=dev

# Expose the HTTP port the Express server runs on
EXPOSE 3001

# Start the MCP server in SSE mode
CMD ["node", "dist/index.js", "--sse"]
