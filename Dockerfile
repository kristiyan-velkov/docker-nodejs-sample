# =========================================
# Stage 1: Build the React (Vite) + Node.js application
# =========================================
ARG NODE_VERSION=24.22.1-alpine

# Use a lightweight Node.js image for building (customizable via ARG)
FROM node:${NODE_VERSION} AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json package-lock.json* ./

# Install project dependencies using npm ci (ensures a clean, reproducible install)
RUN npm ci

# Copy the rest of the application source code into the container
COPY . .

# Build the application (client → dist/client, API bundle → dist/server.js)
RUN npm run build

# Remove devDependencies so the runner stage can copy production node_modules only
RUN npm prune --omit=dev

# =========================================
# Stage 2: Run the Node.js server (Express + built client)
# =========================================
FROM node:${NODE_VERSION} AS runner

# Set the working directory
WORKDIR /app

# Set environment variable for production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy lockfiles, pruned node_modules, and build output from the builder stage
COPY --from=builder --chown=node:node /app/package.json /app/package-lock.json* ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

# Switch to the non-root user
USER node

# Expose the application port
EXPOSE 3000

ENTRYPOINT ["node", "dist/server.js"]
