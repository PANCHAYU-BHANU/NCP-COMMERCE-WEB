package com.commers.ncp_com_web.controller;

import com.commers.ncp_com_web.entity.EducationalResource;
import com.commers.ncp_com_web.entity.Subject;
import com.commers.ncp_com_web.payload.request.ResourceUploadRequest;
import com.commers.ncp_com_web.payload.response.MessageResponse;
import com.commers.ncp_com_web.repository.EducationalResourceRepository;
import com.commers.ncp_com_web.repository.SubjectRepository;
import com.commers.ncp_com_web.repository.UserRepository;
import com.commers.ncp_com_web.security.services.UserDetailsImpl;
import com.commers.ncp_com_web.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private EducationalResourceRepository resourceRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('PRINCIPAL') or hasRole('SECTION_HEAD') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> uploadResource(
            @ModelAttribute ResourceUploadRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        EducationalResource resource = new EducationalResource();
        resource.setTitle(request.getTitle());
        resource.setResourceType(request.getResourceType());
        resource.setExamLevel(request.getExamLevel());
        resource.setExamYear(request.getExamYear());
        resource.setTargetAudience(request.getTargetAudience() != null ? request.getTargetAudience() : "PUBLIC");
        
        if(request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId()).orElse(null);
            resource.setSubject(subject);
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        resource.setUploadedBy(userRepository.findById(userDetails.getId()).orElse(null));

        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/resources/download/")
                    .path(fileName)
                    .toUriString();
            resource.setFileUrl(fileDownloadUri);
        } else if (request.getExternalLink() != null && !request.getExternalLink().isEmpty()) {
            resource.setFileUrl(request.getExternalLink());
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Please provide a file or an external link!"));
        }

        resourceRepository.save(resource);

        return ResponseEntity.ok(new MessageResponse("Resource uploaded successfully!"));
    }

    @GetMapping("/list")
    public ResponseEntity<List<EducationalResource>> getAllResources() {
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth != null ? auth.getPrincipal() : null;

        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            com.commers.ncp_com_web.entity.User user = userRepository.findById(userDetails.getId()).orElse(null);
            if (user != null) {
                // If provincial, zonal, divisional director, principal, or admin - can access all resources
                if (user.getRole() == com.commers.ncp_com_web.entity.ERole.ROLE_PROVINCIAL_DIRECTOR ||
                    user.getRole() == com.commers.ncp_com_web.entity.ERole.ROLE_ADMIN ||
                    user.getRole() == com.commers.ncp_com_web.entity.ERole.ROLE_ZONAL_DIRECTOR ||
                    user.getRole() == com.commers.ncp_com_web.entity.ERole.ROLE_DIVISIONAL_DIRECTOR ||
                    user.getRole() == com.commers.ncp_com_web.entity.ERole.ROLE_PRINCIPAL) {
                    return ResponseEntity.ok(resourceRepository.findAllOrdered());
                }

                // If Section Head or Teacher:
                // Can see all PUBLIC resources + TEACHERS_ONLY resources matching taught subjects (or all if general commerce)
                java.util.Set<Long> userSubjectIds = user.getSubjects().stream()
                        .map(com.commers.ncp_com_web.entity.Subject::getId)
                        .collect(java.util.stream.Collectors.toSet());

                List<EducationalResource> all = resourceRepository.findAllOrdered();
                List<EducationalResource> filtered = all.stream().filter(r -> {
                    if ("PUBLIC".equalsIgnoreCase(r.getTargetAudience()) || r.getTargetAudience() == null) {
                        return true;
                    }
                    // TEACHERS_ONLY: visible to subject teacher or section head
                    if (userSubjectIds.isEmpty()) {
                        return true;
                    }
                    return r.getSubject() != null && userSubjectIds.contains(r.getSubject().getId());
                }).collect(java.util.stream.Collectors.toList());

                return ResponseEntity.ok(filtered);
            }
        }

        return ResponseEntity.ok(resourceRepository.findPublicResources());
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        // Load file as Resource
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        // Try to determine file's content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Ignored
        }

        // Fallback to the default content type if type could not be determined
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
