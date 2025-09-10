# ========================================
# Production-Grade Multi-Stage Dockerfile
# Optimized for Node.js TypeScript Applications
# ========================================

# ========================================
# Build Arguments & Base Image
# ========================================
ARG NODE_VERSION=22.11.0
ARG ALPINE_VERSION=3.20

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app directory and non-root user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    mkdir -p /app/data && \
    chown nodejs:nodejs /app/data

# ========================================
# Dependencies Stage - Install packages
# ========================================
FROM base AS dependencies

# Copy package files first for better layer caching
COPY --chown=nodejs:nodejs package*.json ./

# Install dependencies with security best practices
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# ========================================
# Build Dependencies Stage
# ========================================
FROM base AS build-dependencies

# Copy package files
COPY --chown=nodejs:nodejs package*.json ./

# Install all dependencies including dev dependencies
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --include=dev --ignore-scripts && \
    npm cache clean --force

# ========================================
# Build Stage - Compile TypeScript
# ========================================
FROM build-dependencies AS build

# Copy configuration files
COPY --chown=nodejs:nodejs tsconfig*.json ./
COPY --chown=nodejs:nodejs vite.config.ts ./
COPY --chown=nodejs:nodejs tailwind.config.js ./
COPY --chown=nodejs:nodejs postcss.config.js ./
COPY --chown=nodejs:nodejs eslint.config.js ./
COPY --chown=nodejs:nodejs vitest.config.ts ./

# Copy source code
COPY --chown=nodejs:nodejs src/ ./src/

# Switch to nodejs user for build
USER nodejs

# Build the application
RUN npm run build && \
    npm prune --production

# ========================================
# Development Stage
# ========================================
FROM build-dependencies AS development

# Development environment variables
ENV NODE_ENV=development
ENV NPM_CONFIG_LOGLEVEL=warn

# Copy configuration files
COPY --chown=nodejs:nodejs tsconfig*.json ./
COPY --chown=nodejs:nodejs vite.config.ts ./
COPY --chown=nodejs:nodejs tailwind.config.js ./
COPY --chown=nodejs:nodejs postcss.config.js ./
COPY --chown=nodejs:nodejs eslint.config.js ./
COPY --chown=nodejs:nodejs vitest.config.ts ./

# Copy source code
COPY --chown=nodejs:nodejs src/ ./src/

# Switch to nodejs user
USER nodejs

# Expose development ports
EXPOSE 3000 5173 9229

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Development command
CMD ["dumb-init", "npm", "run", "dev"]

# ========================================
# Production Stage
# ========================================
FROM base AS production

# Production environment variables
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=error
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Copy production dependencies
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=dependencies --chown=nodejs:nodejs /app/package*.json ./

# Copy built application
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Switch to nodejs user for security
USER nodejs

# Expose application port
EXPOSE 3000

# Health check with shorter intervals for production
HEALTHCHECK --interval=20s --timeout=5s --start-period=30s --retries=5 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
CMD ["dumb-init", "node", "dist/server/index.js"]

# ========================================
# Testing Stage
# ========================================
FROM build-dependencies AS test

# Test environment variables
ENV NODE_ENV=test
ENV CI=true

# Copy all necessary files for testing
COPY --chown=nodejs:nodejs tsconfig*.json ./
COPY --chown=nodejs:nodejs vite.config.ts ./
COPY --chown=nodejs:nodejs vitest.config.ts ./
COPY --chown=nodejs:nodejs eslint.config.js ./
COPY --chown=nodejs:nodejs src/ ./src/

# Switch to nodejs user
USER nodejs

# Run tests and generate coverage
CMD ["npm", "run", "test:coverage"]
