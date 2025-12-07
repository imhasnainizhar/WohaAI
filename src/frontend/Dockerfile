# ---------------------
# Base Stage
# ---------------------
FROM node:22-alpine AS base
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# ---------------------
# Development Stage
# ---------------------
FROM base AS development

# Installing Build tools for native modules
RUN apk update && apk add python3 build-base gcc g++ make git

# Installing Modules
RUN npm ci

# Copying Source Code, Ignoring node modules.
COPY . .

# Default command for development
CMD ["npm", "run", "dev"]

# ---------------------
# Production Build Stage
# ---------------------
FROM base AS build
RUN npm ci --omit=dev
RUN npm run build

# ---------------------
# Production Runtime Stage
# ---------------------
FROM node:22-alpine AS production
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

# Non-sensitive defaults
ENV NODE_ENV=${NODE_ENV}
ENV APP_PUBLIC_RECAPTCHA_SITE_KEY=${APP_PUBLIC_RECAPTCHA_SITE_KEY}
ENV APP_PUBLIC_GATEWAY_BASE_URL_01=${APP_PUBLIC_GATEWAY_BASE_URL_01}

EXPOSE 3000
CMD ["npm", "run", "start"]
