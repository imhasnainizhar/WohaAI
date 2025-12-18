# ---------------------
# Base
# ---------------------
FROM node:22-bookworm AS base
WORKDIR /app
COPY package*.json ./

# ---------------------
# Development
# ---------------------
FROM base AS development
RUN npm install
RUN npx playwright install chromium --with-deps
COPY . .
CMD ["npm", "run", "dev"]
