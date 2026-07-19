# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

# LibreOffice headless (for PDF<->Word) + CJK/Latin fonts so Korean text
# renders correctly during conversion instead of falling back to tofu boxes.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    fonts-noto-cjk \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# On Linux `soffice` is expected to be on PATH (see resolveSofficeBinary in
# src/lib/convertWithLibreOffice.ts) - the apt packages above put it there.
ENV LIBREOFFICE_PATH=soffice

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
