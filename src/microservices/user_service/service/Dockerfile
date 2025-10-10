# ---------------------
# Base
# ---------------------
FROM node:20-slim AS base
WORKDIR /src
COPY package*.json ./

# ---------------------
# Development
# ---------------------
FROM base AS development
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# ---------------------
# Build
# ---------------------
FROM base AS build
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------------------
# Production
# ---------------------
FROM node:20-slim AS production
WORKDIR /app
COPY --from=build /src/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev

# Security best practice
RUN useradd -m appuser
USER appuser

CMD ["npm", "start"]
