package com.commers.ncp_com_web.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    private static final java.util.Set<String> ALLOWED_EXTENSIONS = java.util.Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "svg",
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv",
            "mp4", "webm", "mp3", "wav", "zip", "rar"
    );

    private static final java.util.Set<String> BLOCKED_EXTENSIONS = java.util.Set.of(
            "exe", "bat", "cmd", "sh", "jsp", "jspx", "html", "htm", "php", "pl", "py", "cgi", "dll", "so", "vbs", "js", "jar", "war"
    );

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Cannot store an empty file.");
        }

        String rawName = (file.getOriginalFilename() != null && !file.getOriginalFilename().isBlank())
                ? file.getOriginalFilename()
                : "attachment";
        String cleanName = StringUtils.cleanPath(rawName).replaceAll("[^a-zA-Z0-9.\\-_]", "_");

        // Validate file extension
        String extension = "";
        int extIndex = cleanName.lastIndexOf('.');
        if (extIndex > 0 && extIndex < cleanName.length() - 1) {
            extension = cleanName.substring(extIndex + 1).toLowerCase();
        }

        if (BLOCKED_EXTENSIONS.contains(extension) || (!extension.isEmpty() && !ALLOWED_EXTENSIONS.contains(extension))) {
            throw new RuntimeException("Security Error: Uploading file type '." + extension + "' is not permitted.");
        }

        String fileName = UUID.randomUUID().toString() + "_" + cleanName;

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Security Error: Filename contains invalid path sequence " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName).normalize();
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                throw new RuntimeException("Security Error: Target location is outside storage directory.");
            }

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            if (fileName == null || fileName.contains("..")) {
                throw new RuntimeException("Security Error: Invalid file name requested: " + fileName);
            }
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new RuntimeException("Security Error: Path traversal attempt detected: " + fileName);
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }
}
