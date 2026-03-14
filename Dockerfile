# ── site-auditor Dockerfile ───────────────────────────────────────────────────
# Isolated deployment — do NOT run on the same container as jenninexus.com.
# Audits make outbound HTTP requests per-request; keep this on its own instance.
#
# Build:  docker build -t site-auditor .
# Run:    docker run -p 3847:3847 -e NODE_ENV=production site-auditor
# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine AS builder

WORKDIR /app

# Install ALL deps (including dev) for the build step
COPY package*.json ./
RUN npm ci

# Copy source and compile TypeScript → dist/
COPY tsconfig.json ./
COPY src/ ./src/

# Compile (tsconfig outDir = dist/)
RUN npm run build


# ── Production image ──────────────────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Non-root user for security
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3847

ENV NODE_ENV=production
ENV SITE_AUDITOR_PORT=3847

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3847/api/health || exit 1

CMD ["node", "dist/src/server.js"]
