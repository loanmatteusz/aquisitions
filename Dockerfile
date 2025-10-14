FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY . .

FROM base AS build

RUN npm run build

FROM node:18-alpine AS development
WORKDIR /app

COPY --from=base /app ./

RUN npm ci && npm cache clean --force

EXPOSE 3333
CMD ["npm", "run", "dev"]

FROM node:18-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=build /app/dist ./dist
COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

USER nodejs

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3333/health', res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["npm", "run", "start"]
