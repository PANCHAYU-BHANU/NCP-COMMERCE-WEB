# ==========================================
# NCP Commerce Web - Frontend Dockerfile
# Optimized Production Nginx Server
# ==========================================

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy prebuilt distribution assets
COPY dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
