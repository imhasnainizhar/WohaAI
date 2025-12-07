FROM mcp-base:latest

# ---------------------
# Base
# ---------------------
FROM node:20 AS base
WORKDIR /app
COPY package*.json ./

# ---------------------
# Development
# ---------------------
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]