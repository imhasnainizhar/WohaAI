# syntax=docker/dockerfile:1.4
# ---------------------
# Base
# ---------------------
    FROM node:22-alpine AS base
    WORKDIR /app/services/ms/auth_service
    COPY package*.json .
    
    # ---------------------
    # Development
    # ---------------------
    FROM base AS development
    ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
    ENV npm_config_lifecycle_event=""
    
    # Copy packages from additional context to /packages
    COPY --from=packages / /packages           
    
    # Install shared package dependencies
    RUN cd /packages/shared && npm install --ignore-scripts
    
    # Install service dependencies
    RUN npm install --ignore-scripts

    # Copy Prisma schema and TS config
    COPY prisma .
    COPY tsconfig.json .  
    
    # Generate Prisma client
    RUN npx prisma generate
    
    # Copy all service source code
    COPY . .
    
    # Start dev server
    CMD ["npm", "run", "dev"]
    
    # ---------------------
    # Build
    # ---------------------
    FROM base AS build
    COPY --from=packages / /packages
    
    # Install shared package dependencies
    RUN cd /packages/shared && npm install
    
    # Copy service code for build
    COPY . .
    
    # Install service dependencies and build
    RUN npm install
    RUN npm run build
    
    # ---------------------
    # Production
    # ---------------------
    FROM node:22-alpine AS production
    WORKDIR /app/services/ms/auth_service
    COPY --from=build /app/services/ms/auth_service/dist ./dist
    COPY package*.json .
    RUN npm install --omit=dev
    
    # Security: run app as non-root user
    RUN useradd -m appuser
    USER appuser
    
    CMD ["npm", "start"]
    