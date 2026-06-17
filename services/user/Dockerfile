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
COPY services/user ./services/user/

RUN find packages -name package*.json

# Install ALL dependencies
RUN pnpm install --frozen-lockfile

# ======================================================
# DEVELOPMENT STAGE
# ======================================================
FROM base AS development

# Copy workspace packages and service
COPY packages ./packages
COPY services/user ./services/user

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages/ ./packages/
COPY --from=base /app/services/user/ ./services/user/

# Put packages
RUN pnpm --filter user-service... build

WORKDIR /app/services/user

CMD ["pnpm", "dev"]

# ======================================================
# BUILD STAGE
# ======================================================
FROM base AS build

WORKDIR /app

# Build shared packages first
RUN pnpm --filter user-service... build

WORKDIR /app/services/user

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
COPY --from=build /app/services/user/dist ./services/user/dist

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Switch user
USER appuser

WORKDIR /app/services/user

CMD ["pnpm", "start"]