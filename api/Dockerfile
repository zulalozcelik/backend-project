# ---------- builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

# Disable husky so prepare/postinstall scripts don't fail inside Docker
ENV HUSKY=0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm prune --prod --ignore-scripts

# ---------- production ----------
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
