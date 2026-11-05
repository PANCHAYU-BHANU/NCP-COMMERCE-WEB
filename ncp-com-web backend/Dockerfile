# ==========================================
# NCP Commerce Web - Backend Dockerfile
# Multi-stage build with Java 21 & Maven
# ==========================================

# Stage 1: Build the Application
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Cache dependencies
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B || true

# Build production JAR
COPY src src
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Ensure uploads folder exists
RUN mkdir -p /app/uploads

# Copy compiled JAR
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

