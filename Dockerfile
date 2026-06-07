FROM node:20-alpine

WORKDIR /app

# Copy package json and lock files
COPY package.json package-lock.json ./
# Copy workspace packages to ensure npm install succeeds
COPY packages ./packages

# Install all dependencies (including workspace dependencies)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "start"]
