# --- Stage 1: build React client ---
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# --- Stage 2: production server ---
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY server ./server
# copy built client
COPY --from=client-build /app/client/dist ./client/dist
# copy public fallback if any
COPY public ./public
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "server/server.js"]
