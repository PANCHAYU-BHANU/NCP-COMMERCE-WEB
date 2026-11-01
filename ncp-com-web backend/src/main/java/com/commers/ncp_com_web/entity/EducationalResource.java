package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "educational_resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EducationalResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column
    private String fileUrl; // Path to stored file or external URL

    @Column
    private String resourceType; // PAST_PAPER, TERM_TEST, UNIT_TEST, MARKING_SCHEME

    @Column
    private String examLevel; // AL, OL

    @Column
    private Integer examYear;

    @Column(name = "target_audience")
    private String targetAudience = "PUBLIC"; // "PUBLIC" or "TEACHERS_ONLY"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    private LocalDateTime uploadedAt = LocalDateTime.now();

    public String getTargetAudience() {
        return targetAudience != null ? targetAudience : "PUBLIC";
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }
}
