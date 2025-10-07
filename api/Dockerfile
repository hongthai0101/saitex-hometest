# Backend Dockerfile for NestJS API

# ---------- Build stage ----------
FROM node:20-alpine AS builder

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Verify build output
RUN ls -la dist/

# Remove dev dependencies for smaller image
RUN pnpm prune --prod


# ---------- Production stage ----------
FROM node:20-alpine

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy package and lock files
COPY --chown=nestjs:nodejs package.json pnpm-lock.yaml* ./

# Copy production deps from builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built app
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Check files exist
RUN ls -la && ls -la dist/

# Switch user
USER nestjs

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Entrypoint for clean signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start app
CMD ["node", "dist/src/main.js"]
