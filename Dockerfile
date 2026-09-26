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

# Server source. Copying the whole tree (minus .dockerignore entries such as
# node_modules, .env and the client build output) means a new server folder
# can never be forgotten; an earlier version listed folders one by one and
# broke when services/ was added.
COPY . .

# Compiled client from stage 1, where app.js expects it.
COPY --from=client-build /app/client/dist ./client/dist

# Run as the unprivileged user the base image provides.
USER node
EXPOSE 5000
CMD ["node", "server.js"]
