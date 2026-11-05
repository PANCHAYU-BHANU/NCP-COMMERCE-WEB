package com.commers.ncp_com_web.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    private String username;

    private String name;
    private String firstName;
    private String lastName;

    private String email;

    @NotBlank
    private String password;

    private String role;
    
    // Optional fields for mapping to specific hierarchies
    private Long provinceId;
    private Long districtId;
    private Long zoneId;
    private Long divisionId;
    private Long schoolId;
    private java.util.List<Long> subjectIds;
    private String examLevel;
    private Boolean isSectionHead;
}
