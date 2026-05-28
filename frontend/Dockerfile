FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Use cache mount to speed up npm install
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund --legacy-peer-deps

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Use cache mount for .next/cache to speed up builds
RUN --mount=type=cache,target=/app/.next/cache npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Next.js standalone output doesn't need node_modules, just the static files and public
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
# Run using the standalone server.js
CMD ["node", "server.js"]
