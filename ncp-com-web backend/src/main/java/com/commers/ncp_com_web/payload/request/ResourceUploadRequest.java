package com.commers.ncp_com_web.payload.request;

import lombok.Data;

@Data
public class ResourceUploadRequest {
    private String title;
    private String resourceType; // PAST_PAPER, TERM_TEST, UNIT_TEST, MARKING_SCHEME
    private String examLevel; // AL, OL
    private Integer examYear;
    private Long subjectId;
    
    // Optional, if user wants to just save an external link
    private String externalLink;

    // "PUBLIC" or "TEACHERS_ONLY"
    private String targetAudience = "PUBLIC";

    public String getTargetAudience() {
        return targetAudience != null && !targetAudience.trim().isEmpty() ? targetAudience : "PUBLIC";
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }
}
