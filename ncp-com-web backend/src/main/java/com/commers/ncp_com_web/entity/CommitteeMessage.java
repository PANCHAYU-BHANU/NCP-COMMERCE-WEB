package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "committee_messages")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CommitteeMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "committee_id", nullable = false)
    private Committee committee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "sender_position")
    private String senderPosition;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String content;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_type")
    private String fileType; // image, pdf, file

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned = false;

    @Column(name = "pinned_by")
    private String pinnedBy;

    @Column(name = "pinned_at")
    private LocalDateTime pinnedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public CommitteeMessage() {}

    public CommitteeMessage(Long id, Committee committee, User sender, String senderPosition, 
                            String content, String fileUrl, String fileName, String fileType, 
                            Long fileSize, Boolean isPinned, String pinnedBy, LocalDateTime pinnedAt, 
                            LocalDateTime createdAt) {
        this.id = id;
        this.committee = committee;
        this.sender = sender;
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
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Committee getCommittee() { return committee; }
    public void setCommittee(Committee committee) { this.committee = committee; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

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
}
