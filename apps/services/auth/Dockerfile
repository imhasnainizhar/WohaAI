# syntax=docker/dockerfile:1.4

# ======================================================
# BASE IMAGE
# ======================================================
FROM node:22-slim AS base

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# COPY MONOREPO ROOT MANIFESTS FIRST (CACHE LAYER)
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY turbo.json ./

COPY packages ./packages
COPY apps/services/auth/package.json ./apps/services/auth/package.json

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
COPY apps/services/auth ./apps/services/auth

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages/ ./packages/
COPY --from=base /app/apps/services/auth/ ./apps/services/auth/

# Build all packages first (for type checking)
RUN pnpm packages:build

WORKDIR /app/apps/services/auth

CMD ["pnpm", "dev"]

# ======================================================
# BUILD STAGE
# ======================================================
FROM base AS build

WORKDIR /app

# Build shared packages first
RUN pnpm --filter auth-service... build

WORKDIR /app/apps/services/auth

# Build only auth service
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
COPY --from=build /app/apps/services/auth/dist ./apps/services/auth/dist

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Switch user
USER appuser

WORKDIR /app/apps/services/auth

CMD ["pnpm", "start"]