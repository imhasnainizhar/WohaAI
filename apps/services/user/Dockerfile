# syntax=docker/dockerfile:1.4

# ======================================================
# BASE IMAGE
# ======================================================
FROM node:22-slim AS base

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Install protoc for proto generation
RUN apt-get update && \
    apt-get install -y unzip wget && \
    wget https://github.com/protocolbuffers/protobuf/releases/download/v25.1/protoc-25.1-linux-x86_64.zip -O /tmp/protoc.zip && \
    unzip /tmp/protoc.zip -d /usr/local && \
    rm /tmp/protoc.zip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# COPY MONOREPO ROOT MANIFESTS FIRST (CACHE LAYER)
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY turbo.json ./

COPY packages ./packages
COPY apps/services/user/package.json ./apps/services/user/package.json

RUN find packages -name package*.json

# Install ALL dependencies
RUN pnpm install --frozen-lockfile

# ======================================================
# DEVELOPMENT STAGE
# ======================================================
FROM base AS development

WORKDIR /app

# Copy workspace packages and service
COPY packages ./packages
COPY apps/services/user ./apps/services/user

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages/ ./packages/
COPY --from=base /app/apps/services/user/ ./apps/services/user/

# Build all packages first (for type checking)
RUN pnpm run packages:build

# Generate proto files
WORKDIR /app/packages/proto
RUN pnpm generate

WORKDIR /app/apps/services/user

CMD ["pnpm", "dev"]

# ======================================================
# BUILD STAGE
# ======================================================
FROM base AS build

WORKDIR /app

# Generate proto files
WORKDIR /app/packages/proto
RUN pnpm generate

WORKDIR /app

# Build shared packages first
RUN pnpm --filter user-service... build

WORKDIR /app/apps/services/user

# Build only user service
RUN pnpm build

# Keep production deps tree only
RUN pnpm prune --prod

# ======================================================
# PRODUCTION STAGE
# ======================================================
FROM build AS production

WORKDIR /app

# Copy only production dependencies + built output
COPY --from=build /app/package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/services/user/dist ./apps/services/user/dist

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Switch user
USER appuser

WORKDIR /app/apps/services/user

CMD ["pnpm", "start"]