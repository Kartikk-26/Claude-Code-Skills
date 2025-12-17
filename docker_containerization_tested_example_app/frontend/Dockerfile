# Multi-stage Dockerfile for React.js Production
# Based on docker-containerization skill - optimized for minimal size and security

# Stage 1: Dependencies
FROM node:18-alpine AS deps
LABEL stage=deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder
LABEL stage=builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Set environment variables for build
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Stage 3: Runner with Nginx
FROM nginx:alpine AS runner
LABEL maintainer="your-email@example.com"
LABEL description="React.js Frontend - Production"

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
