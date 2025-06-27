# Use Node.js 18 Alpine for smaller image size
FROM node:20-alpine

# Install specific pnpm version that matches package.json
RUN npm install -g pnpm@10.10.0

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 8080, path: '/', timeout: 2000 }; const req = http.request(options, (res) => { res.statusCode === 200 ? process.exit(0) : process.exit(1) }); req.on('error', () => process.exit(1)); req.end();"

# Start the application
CMD ["pnpm", "start"] 