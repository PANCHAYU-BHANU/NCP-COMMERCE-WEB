# ==========================================
# NCP Commerce Web - Backend Dockerfile
# Optimized Production Runtime (Java 21)
# ==========================================

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Ensure uploads folder exists
RUN mkdir -p /app/uploads

# Copy precompiled production JAR
COPY target/ncp-com-web-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
