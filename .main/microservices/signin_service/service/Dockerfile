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
RUN npm install -g ts-node typescript nodemon
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
FROM node:20 AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm install --omit=dev
CMD ["npm", "start"]
