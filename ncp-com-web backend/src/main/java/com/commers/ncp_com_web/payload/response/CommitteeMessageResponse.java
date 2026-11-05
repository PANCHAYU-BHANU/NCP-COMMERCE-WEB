package com.commers.ncp_com_web.payload.response;

import java.time.LocalDateTime;

public class CommitteeMessageResponse {
    private Long id;
    private Long committeeId;
    private String committeeName;
    private Long senderId;
    private String senderUsername;
    private String senderRole;
    private String senderPosition;
    private String content;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Boolean isPinned;
    private String pinnedBy;
    private LocalDateTime pinnedAt;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean isOwnMessage;

    public CommitteeMessageResponse() {}

    public CommitteeMessageResponse(Long id, Long committeeId, String committeeName, Long senderId, 
                                    String senderUsername, String senderRole, String senderPosition, 
                                    String content, String fileUrl, String fileName, String fileType, 
                                    Long fileSize, Boolean isPinned, String pinnedBy, LocalDateTime pinnedAt, 
                                    LocalDateTime createdAt, LocalDateTime expiresAt, boolean isOwnMessage) {
        this.id = id;
        this.committeeId = committeeId;
        this.committeeName = committeeName;
        this.senderId = senderId;
        this.senderUsername = senderUsername;
        this.senderRole = senderRole;
        this.senderPosition = senderPosition;
        this.content = content;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.isPinned = isPinned != null ? isPinned : false;
        this.pinnedBy = pinnedBy;
        this.pinnedAt = pinnedAt;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.isOwnMessage = isOwnMessage;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommitteeId() { return committeeId; }
    public void setCommitteeId(Long committeeId) { this.committeeId = committeeId; }

    public String getCommitteeName() { return committeeName; }
    public void setCommitteeName(String committeeName) { this.committeeName = committeeName; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderUsername() { return senderUsername; }
    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getSenderPosition() { return senderPosition; }
    public void setSenderPosition(String senderPosition) { this.senderPosition = senderPosition; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public Boolean getIsPinned() { return isPinned != null ? isPinned : false; }
    public void setIsPinned(Boolean isPinned) { this.isPinned = isPinned != null ? isPinned : false; }

    public String getPinnedBy() { return pinnedBy; }
    public void setPinnedBy(String pinnedBy) { this.pinnedBy = pinnedBy; }

    public LocalDateTime getPinnedAt() { return pinnedAt; }
    public void setPinnedAt(LocalDateTime pinnedAt) { this.pinnedAt = pinnedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public boolean isOwnMessage() { return isOwnMessage; }
    public void setOwnMessage(boolean isOwnMessage) { this.isOwnMessage = isOwnMessage; }
}
