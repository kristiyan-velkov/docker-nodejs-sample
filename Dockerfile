# ========================================
# Multi-stage Dockerfile for TypeScript Node.js App
# Optimized for production with separate client/server builds
# ========================================

ARG NODE_VERSION=22.19.0-alpine
FROM node:${NODE_VERSION} AS base

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Copy package files for dependency installation
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# ========================================
# Dependencies stage
# ========================================
FROM base AS deps

# Install all dependencies (including dev dependencies for building)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

# ========================================
# Build stage
# ========================================
FROM deps AS build

# Copy source code
COPY src/ ./src/
COPY eslint.config.js ./
COPY vitest.config.ts ./

# Build both client and server
RUN npm run build

# ========================================
# Production dependencies stage
# ========================================
FROM base AS prod-deps

# Install only production dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --omit=optional

# ========================================
# Development stage
# ========================================
FROM deps AS development

ENV NODE_ENV=development

# Copy source code
COPY src/ ./src/
COPY eslint.config.js ./
COPY vitest.config.ts ./

# Create non-root user for development
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose development ports
EXPOSE 3000 5173 9229

# Start development servers
CMD ["npm", "run", "dev"]

# ========================================
# Production stage
# ========================================
FROM node:${NODE_VERSION} AS production

ENV NODE_ENV=production

WORKDIR /app

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package*.json ./

# Copy built application
COPY --from=build /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Expose application port
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]

# ========================================
# Testing stage
# ========================================
FROM deps AS test

ENV NODE_ENV=test

# Copy source and test files
COPY src/ ./src/
COPY eslint.config.js ./
COPY vitest.config.ts ./

# Create test user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

# Run tests
CMD ["npm", "test"]
