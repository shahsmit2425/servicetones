FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build
FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=3001 DATABASE_PATH=/data/servicetones.sqlite
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && mkdir /data && chown node:node /data
COPY --from=build /app/dist ./dist
COPY server ./server
USER node
VOLUME ["/data"]
EXPOSE 3001
CMD ["node", "server/index.mjs"]
