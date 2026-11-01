package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "media_gallery")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MediaGallery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type; // e.g., 'photo', 'video'
    
    @Column(nullable = false)
    private String url;

    private String description;
    
    private String album;

    private String examLevel = "GENERAL"; // AL, OL, GENERAL

    private LocalDateTime uploadedAt = LocalDateTime.now();
}
