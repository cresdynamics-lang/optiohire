FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Use cache mount to speed up npm ci
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy package.json to get scripts/version but we'll use a pre-installed node_modules
COPY package.json package-lock.json* ./
# Use cache mount for production node_modules
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --no-audit --no-fund

COPY --from=build /app/dist ./dist
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/src ./src
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/newrelic.cjs ./newrelic.cjs

EXPOSE 3001
CMD ["npm", "run", "start"]
