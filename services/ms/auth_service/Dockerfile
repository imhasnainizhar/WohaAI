# ---------------------
# Base
# ---------------------
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------------------
# Development
# ---------------------
FROM base AS development
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
ENV npm_config_lifecycle_event=""
RUN npm install --ignore-scripts
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
CMD ["npm", "run", "dev"]

# ---------------------
# Build
# ---------------------
FROM base AS build
COPY . .
RUN npm install
RUN npm run build

# ---------------------
# Production
# ---------------------
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /src/dist ./dist
COPY package*.json ./
RUN npm install --omit=dev

# Security best practice
RUN useradd -m appuser
USER appuser

CMD ["npm", "start"]