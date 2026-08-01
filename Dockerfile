# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci --only=production

# Copy application source code
COPY . .

# Stage 2: Production Lightweight Image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S cloudops -u 1001 -G nodejs

# Copy built application and node_modules from builder stage
COPY --from=builder /app /app

# Change permissions to non-root user
USER cloudops

# Expose port
EXPOSE 5000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/cloud/overview || exit 1

# Start server
CMD ["node", "src/backend/server.js"]
