# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
