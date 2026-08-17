# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install tools needed for remote power management:
# - samba-client: provides 'net rpc shutdown' for Windows RPC shutdown
# - openssh-client: provides 'ssh' for SSH-based shutdown
# - sshpass: allows SSH with password (non-interactive)
RUN apk add --no-cache samba-client openssh-client sshpass

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# Default internal container port
EXPOSE 3000

CMD ["node", "dist/server.cjs"]
