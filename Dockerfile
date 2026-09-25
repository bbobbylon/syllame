# Multi-stage build: compile the React client, then ship only what the
# server needs at runtime.
#
# Analogy: stage 1 is the workshop where the furniture is built; stage 2 is
# the showroom that receives just the finished piece, not the sawdust.

# ---- Stage 1: build the client -------------------------------------------
FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- Stage 2: runtime image -----------------------------------------------
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

# Server dependencies only. --ignore-scripts skips the postinstall that would
# try to install the client (already built above).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Server source.
COPY app.js server.js ./
COPY config/ ./config/
COPY models/ ./models/
COPY routes/ ./routes/
COPY validation/ ./validation/
COPY scripts/ ./scripts/

# Compiled client from stage 1, where app.js expects it.
COPY --from=client-build /app/client/dist ./client/dist

# Run as the unprivileged user the base image provides.
USER node
EXPOSE 5000
CMD ["node", "server.js"]
