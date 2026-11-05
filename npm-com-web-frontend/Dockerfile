# ==========================================
# NCP Commerce Web - Frontend Dockerfile
# Multi-stage build with Node 20 & Nginx
# ==========================================

# Stage 1: Build Application
FROM node:20-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY package*.json ./
RUN npm install

# Build production bundle
COPY . .
RUN npm run build

# Stage 2: Production Web Server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

