package com.commers.ncp_com_web.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            java.nio.file.Files.createDirectories(uploadDir);
        } catch (Exception ignored) {}

        String uploadUri = uploadDir.toUri().toString();
        if (!uploadUri.endsWith("/")) {
            uploadUri += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadUri);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.ApplicationRunner alterRoleColumnRunner(javax.sql.DataSource dataSource) {
        return args -> {
            try (java.sql.Connection conn = dataSource.getConnection();
                 java.sql.Statement stmt = conn.createStatement()) {
                stmt.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(50)");
                System.out.println("Role column successfully altered to VARCHAR(50)");
            } catch (Exception e) {
                System.err.println("Failed to alter role column: " + e.getMessage());
            }
        };
    }
}
