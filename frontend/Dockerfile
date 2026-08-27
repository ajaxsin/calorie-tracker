# ============================================
# Base Image
# ============================================
ARG NODE_VERSION=20-alpine

# ============================================
# Stage 1: Install Dependencies
# ============================================
FROM node:${NODE_VERSION} AS deps

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

# ============================================
# Stage 2: Build Next.js App
# ============================================
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

RUN npm run build

# ============================================
# Stage 3: Production Runner
# ============================================
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
