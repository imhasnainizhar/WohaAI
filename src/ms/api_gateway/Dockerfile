# ---------------------
# Base Stage
# ---------------------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------------------
# Development Stage
# ---------------------
FROM base AS development

CMD ["npm", "run", "dev"]

# ---------------------
# Production Build Stage
# ---------------------
FROM base AS build
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# ---------------------
# Production Runtime Stage
# ---------------------
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Non-sensitive defaults
ENV NODE_ENV=${NODE_ENV}    
ENV API_GATEWAY_PORT=${API_GATEWAY_PORT}

EXPOSE ${API_GATEWAY_PORT}
CMD ["npm", "run", "start"]
