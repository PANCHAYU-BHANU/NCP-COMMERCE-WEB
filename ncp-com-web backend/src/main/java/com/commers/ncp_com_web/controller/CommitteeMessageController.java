package com.commers.ncp_com_web.controller;

import com.commers.ncp_com_web.entity.Committee;
import com.commers.ncp_com_web.entity.CommitteeMember;
import com.commers.ncp_com_web.entity.CommitteeMessage;
import com.commers.ncp_com_web.entity.ERole;
import com.commers.ncp_com_web.entity.User;
import com.commers.ncp_com_web.payload.response.CommitteeMessageResponse;
import com.commers.ncp_com_web.payload.response.MessageResponse;
import com.commers.ncp_com_web.repository.CommitteeMemberRepository;
import com.commers.ncp_com_web.repository.CommitteeMessageRepository;
import com.commers.ncp_com_web.repository.CommitteeRepository;
import com.commers.ncp_com_web.repository.UserRepository;
import com.commers.ncp_com_web.security.services.UserDetailsImpl;
import com.commers.ncp_com_web.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/committees")
public class CommitteeMessageController {

    @Autowired
    private CommitteeRepository committeeRepository;

    @Autowired
    private CommitteeMemberRepository committeeMemberRepository;

    @Autowired
    private CommitteeMessageRepository committeeMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Automatic scheduled cleanup: Deletes UNPINNED messages older than 24 hours every hour
     */
    @Scheduled(fixedRate = 3600000)
    public void cleanupExpiredMessages() {
        try {
            LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
            committeeMessageRepository.deleteExpiredUnpinnedMessages(cutoff);
            System.out.println(">>> [PURGE] Auto-deleted unpinned committee messages older than 24 hours.");
        } catch (Exception e) {
            System.err.println("Error cleaning up expired messages: " + e.getMessage());
        }
    }

    private User getAuthenticatedUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return null;
            }
            if (auth.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                User u = userRepository.findById(userDetails.getId()).orElse(null);
                if (u != null) return u;
            }
            if (auth.getName() != null) {
                return userRepository.findByUsername(auth.getName()).orElse(null);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private boolean canAccessCommittee(User user, Committee committee) {
        if (user == null || committee == null) {
            return false;
        }

        // Provincial Director and Administrator have full access to all committees
        if (user.getRole() == ERole.ROLE_PROVINCIAL_DIRECTOR || user.getRole() == ERole.ROLE_ADMIN) {
            return true;
        }

        // Check if user is an appointed member of this committee
        return committeeMemberRepository.existsByCommitteeIdAndUserId(committee.getId(), user.getId());
    }

    private String resolveSenderPosition(User user, Long committeeId) {
        if (user == null) return "Member";
        Optional<CommitteeMember> memberOpt = committeeMemberRepository.findByCommitteeIdAndUserId(committeeId, user.getId());
        if (memberOpt.isPresent() && memberOpt.get().getPosition() != null && !memberOpt.get().getPosition().isBlank()) {
            return memberOpt.get().getPosition();
        }

        if (user.getRole() == ERole.ROLE_PROVINCIAL_DIRECTOR) return "Provincial Director";
        if (user.getRole() == ERole.ROLE_ADMIN) return "Administrator";
        if (user.getRole() == ERole.ROLE_ZONAL_DIRECTOR) return "Zonal Director";
        if (user.getRole() == ERole.ROLE_DIVISIONAL_DIRECTOR) return "Divisional Director";
        if (user.getRole() == ERole.ROLE_PRINCIPAL) return "Principal";
        if (user.getRole() == ERole.ROLE_SECTION_HEAD) return "Section Head";
        if (user.getRole() == ERole.ROLE_TEACHER) return "Commerce Teacher";
        return "Member";
    }

    private CommitteeMessageResponse mapToResponse(CommitteeMessage msg, Long currentUserId) {
        String roleStr = msg.getSender() != null && msg.getSender().getRole() != null 
                ? msg.getSender().getRole().name().replace("ROLE_", "") 
                : "USER";

        boolean isOwn = currentUserId != null && msg.getSender() != null && currentUserId.equals(msg.getSender().getId());
        boolean isPinned = Boolean.TRUE.equals(msg.getIsPinned());
        LocalDateTime expiresAt = isPinned ? null : (msg.getCreatedAt() != null ? msg.getCreatedAt().plusHours(24) : null);

        return new CommitteeMessageResponse(
                msg.getId(),
                msg.getCommittee() != null ? msg.getCommittee().getId() : null,
                msg.getCommittee() != null ? msg.getCommittee().getName() : null,
                msg.getSender() != null ? msg.getSender().getId() : null,
                msg.getSender() != null ? msg.getSender().getUsername() : "Unknown User",
                roleStr,
                msg.getSenderPosition() != null ? msg.getSenderPosition() : "Member",
                msg.getContent(),
                msg.getFileUrl(),
                msg.getFileName(),
                msg.getFileType(),
                msg.getFileSize(),
                isPinned,
                msg.getPinnedBy(),
                msg.getPinnedAt(),
                msg.getCreatedAt(),
                expiresAt,
                isOwn
        );
    }

    /**
     * Get all messages for a specific committee (pinned messages + unpinned from the last 24 hours)
     */
    @GetMapping("/{committeeId}/messages")
    public ResponseEntity<?> getCommitteeMessages(@PathVariable Long committeeId) {
        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User is not authenticated"));
            }

            Committee committee = committeeRepository.findById(committeeId).orElse(null);
            if (committee == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Committee not found"));
            }

            if (!canAccessCommittee(user, committee)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Access Denied: Only members of this committee can view messages."));
            }

            // Purge unpinned messages older than 24 hours
            LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
            try {
                committeeMessageRepository.deleteExpiredUnpinnedMessages(cutoff);
            } catch (Exception ignored) {}

            List<CommitteeMessage> messages = committeeMessageRepository.findActiveMessages(committeeId, cutoff);
            List<CommitteeMessageResponse> result = messages.stream()
                    .map(msg -> mapToResponse(msg, user.getId()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new MessageResponse("Error retrieving messages: " + e.getMessage()));
        }
    }

    /**
     * Post a new message with optional PDF/image attachment (Supports Multipart FormData, URL-Encoded, and JSON)
     */
    @PostMapping(value = "/{committeeId}/messages")
    public ResponseEntity<?> postCommitteeMessage(
            @PathVariable Long committeeId,
            @RequestParam(value = "content", required = false) String paramContent,
            @RequestParam(value = "message", required = false) String paramMessage,
            @RequestParam(value = "file", required = false) MultipartFile file,
            HttpServletRequest request) {

        String content = (paramContent != null && !paramContent.trim().isEmpty()) ? paramContent : paramMessage;

        // If content is empty and file is not provided, check if client sent a JSON body
        if ((content == null || content.trim().isEmpty()) && file == null) {
            String ct = request.getContentType();
            if (ct != null && ct.toLowerCase().contains("application/json")) {
                try {
                    String json = new String(request.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                    java.util.regex.Matcher m = java.util.regex.Pattern.compile("\"(?:content|message)\"\\s*:\\s*\"([^\"]*)\"").matcher(json);
                    if (m.find()) {
                        content = m.group(1);
                    }
                } catch (Exception ignored) {}
            }
        }

        return handleCreateMessage(committeeId, content, file);
    }

    private ResponseEntity<?> handleCreateMessage(Long committeeId, String content, MultipartFile file) {
        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User is not authenticated"));
            }

            Committee committee = committeeRepository.findById(committeeId).orElse(null);
            if (committee == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Committee not found"));
            }

            if (!canAccessCommittee(user, committee)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Access Denied: Only members of this committee can send messages."));
            }

            boolean hasFile = file != null && !file.isEmpty();

            if ((content == null || content.trim().isEmpty()) && !hasFile) {
                return ResponseEntity.badRequest().body(new MessageResponse("Please write a message or attach a file."));
            }

            String position = resolveSenderPosition(user, committeeId);

            CommitteeMessage msg = new CommitteeMessage();
            msg.setCommittee(committee);
            msg.setSender(user);
            msg.setSenderPosition(position);
            msg.setContent(content != null ? content.trim() : "");
            msg.setIsPinned(false);
            msg.setCreatedAt(LocalDateTime.now());

            // Handle file upload (Images, PDFs)
            if (hasFile) {
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null || originalFilename.isBlank()) {
                    originalFilename = "attachment";
                }
                String storedFilename = fileStorageService.storeFile(file);

                String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/uploads/")
                        .path(storedFilename)
                        .toUriString();

                msg.setFileUrl(fileDownloadUri);
                msg.setFileName(originalFilename);
                msg.setFileSize(file.getSize());

                // Detect file type
                String lowerName = originalFilename.toLowerCase();
                String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
                if (contentType.startsWith("image/") || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".png") || lowerName.endsWith(".webp") || lowerName.endsWith(".gif")) {
                    msg.setFileType("image");
                } else if (contentType.contains("pdf") || lowerName.endsWith(".pdf")) {
                    msg.setFileType("pdf");
                } else {
                    msg.setFileType("file");
                }
            }

            CommitteeMessage saved = committeeMessageRepository.save(msg);
            return ResponseEntity.ok(mapToResponse(saved, user.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new MessageResponse("Error sending message: " + e.getMessage()));
        }
    }

    /**
     * Toggle Pin status of a message. Pinned messages NEVER auto-delete until unpinned.
     */
    @PutMapping("/{committeeId}/messages/{messageId}/pin")
    public ResponseEntity<?> togglePinMessage(
            @PathVariable Long committeeId,
            @PathVariable Long messageId) {

        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User is not authenticated"));
            }

            Committee committee = committeeRepository.findById(committeeId).orElse(null);
            if (committee == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Committee not found"));
            }

            if (!canAccessCommittee(user, committee)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Access Denied: Only members of this committee can pin messages."));
            }

            CommitteeMessage message = committeeMessageRepository.findById(messageId).orElse(null);
            if (message == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Message not found"));
            }

            boolean currentlyPinned = Boolean.TRUE.equals(message.getIsPinned());
            if (currentlyPinned) {
                message.setIsPinned(false);
                message.setPinnedBy(null);
                message.setPinnedAt(null);
            } else {
                message.setIsPinned(true);
                String pinAuthor = user.getUsername();
                if (user.getRole() == ERole.ROLE_PROVINCIAL_DIRECTOR) {
                    pinAuthor = "Provincial Director";
                }
                message.setPinnedBy(pinAuthor);
                message.setPinnedAt(LocalDateTime.now());
            }

            CommitteeMessage updated = committeeMessageRepository.save(message);
            return ResponseEntity.ok(mapToResponse(updated, user.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new MessageResponse("Error updating pin status: " + e.getMessage()));
        }
    }

    /**
     * Delete a message (Sender or Provincial Director / Admin only)
     */
    @DeleteMapping("/{committeeId}/messages/{messageId}")
    public ResponseEntity<?> deleteCommitteeMessage(
            @PathVariable Long committeeId,
            @PathVariable Long messageId) {

        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User is not authenticated"));
            }

            CommitteeMessage message = committeeMessageRepository.findById(messageId).orElse(null);
            if (message == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Message not found"));
            }

            boolean isSender = message.getSender() != null && message.getSender().getId().equals(user.getId());
            boolean isMasterAdmin = user.getRole() == ERole.ROLE_PROVINCIAL_DIRECTOR || user.getRole() == ERole.ROLE_ADMIN;

            if (!isSender && !isMasterAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("You are not authorized to delete this message."));
            }

            committeeMessageRepository.delete(message);
            return ResponseEntity.ok(new MessageResponse("Message deleted successfully."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new MessageResponse("Error deleting message: " + e.getMessage()));
        }
    }

    /**
     * Get list of committees the current user belongs to
     */
    @GetMapping("/my-committees")
    public ResponseEntity<?> getMyCommittees() {
        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User is not authenticated"));
            }

            if (user.getRole() == ERole.ROLE_PROVINCIAL_DIRECTOR || user.getRole() == ERole.ROLE_ADMIN) {
                return ResponseEntity.ok(committeeRepository.findAll());
            }

            List<CommitteeMember> memberships = committeeMemberRepository.findByUserId(user.getId());
            List<Committee> committees = memberships.stream()
                    .map(CommitteeMember::getCommittee)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());

            return ResponseEntity.ok(committees);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
