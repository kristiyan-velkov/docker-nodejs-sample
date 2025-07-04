# ----------------------------------------
# Stage 1: Base Layer for Reuse
# Installs dependencies using npm ci
# ----------------------------------------
    ARG NODE_VERSION=22.14.0-alpine
    FROM node:${NODE_VERSION} AS base
    
    # Set working directory inside the container
    WORKDIR /app
    
    # Copy dependency definitions
    COPY package.json package-lock.json ./
    
    # Install exact dependencies (clean, deterministic install)
    RUN --mount=type=cache,target=/root/.npm npm ci
    
    
    # ----------------------------------------
    # Stage 2: Development Environment
    # Includes devDependencies and nodemon
    # ----------------------------------------
    FROM base AS development
    
    ENV NODE_ENV=development
    
    # Install all deps including dev tools like nodemon and jest
    RUN --mount=type=cache,target=/root/.npm npm install
    
    # Copy source code after deps to optimize caching
    COPY . .
    
    # Expose app and debugger ports
    EXPOSE 8080 9229
    
    # Start the app in develop mode with inspector enabled
    CMD ["npm", "run", "dev"]
    
    
    # ----------------------------------------
    # Stage 3: Production Build
    # Installs only production dependencies
    # ----------------------------------------
    FROM base AS production
    
    ENV NODE_ENV=production
    
    # Install only production dependencies
    RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev
    
    # Copy entire source codebase
    COPY . .
    
    # Drop root privileges for security
    USER node
    
    # Expose application port
    EXPOSE 8080
    
   # Start the app in production mode with inspector enabled
   CMD ["npm", "run", "prod"]
    
    
    # ----------------------------------------
    # Stage 4: Testing Environment
    # Runs tests with devDependencies (e.g. jest)
    # ----------------------------------------
    FROM base AS test
    
    ENV NODE_ENV=test
    
    # Install dependencies including devDependencies (for testing)
    RUN --mount=type=cache,target=/root/.npm npm ci --include=dev
    
    # Copy source files and tests
    COPY . .
    
    # Drop privileges for safer test execution
    USER node
    
    # Run tests
    CMD ["npm", "run", "test"]
    