# syntax=docker/dockerfile:1.4

# ======================================================
# BASE IMAGE
# ======================================================
FROM node:22-slim AS base

WORKDIR /app

# COPY MONOREPO ROOT MANIFESTS FIRST (CACHE LAYER)
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY turbo.json ./

# Copy workspace packages and service
COPY packages ./packages
COPY services/auth ./services/auth

## PNPM Install
RUN corepack enable && corepack prepare pnpm@latest --activate

# INSTALL DEPENDENCIES (WORKSPACE WIDE)
RUN pnpm install --frozen-lockfile

# ======================================================
# DEVELOPMENT STAGE
# ======================================================
FROM base AS development

ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Put packages on dev mode
RUN pnpm packages:dev

# Generate Prisma client
RUN pnpm run prisma:generate
RUN pnpm run prisma:migrate:dev

WORKDIR /app/services/auth

CMD ["pnpm", "run", "dev"]

# ======================================================
# BUILD STAGE
# ======================================================
FROM base AS build

WORKDIR /app

# Build shared packages first
RUN pnpm run packages:build

WORKDIR /app/services/auth

# Build only auth service
RUN pnpm run build

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
COPY --from=build /app/services/auth/dist ./services/auth/dist

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Switch user
USER appuser

WORKDIR /app/services/auth

CMD ["pnpm", "run", "start"]