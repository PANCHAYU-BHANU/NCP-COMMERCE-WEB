package com.commers.ncp_com_web.payload.response;

import java.util.List;

public class UserResponse {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String role;
    private String location;
    private String status;

    private Long schoolId;
    private String schoolName;
    private Long divisionId;
    private String divisionName;
    private Long zoneId;
    private String zoneName;
    private Long districtId;
    private String districtName;
    private String examLevel;
    private Boolean isSectionHead;
    private List<String> subjects;
    private String profilePic;
    private Boolean isProfileComplete;

    public UserResponse() {}

    public UserResponse(Long id, String name, String email, String role, String location, String status) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.location = location;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getSchoolId() { return schoolId; }
    public void setSchoolId(Long schoolId) { this.schoolId = schoolId; }

    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }

    public Long getDivisionId() { return divisionId; }
    public void setDivisionId(Long divisionId) { this.divisionId = divisionId; }

    public String getDivisionName() { return divisionName; }
    public void setDivisionName(String divisionName) { this.divisionName = divisionName; }

    public Long getZoneId() { return zoneId; }
    public void setZoneId(Long zoneId) { this.zoneId = zoneId; }

    public String getZoneName() { return zoneName; }
    public void setZoneName(String zoneName) { this.zoneName = zoneName; }

    public Long getDistrictId() { return districtId; }
    public void setDistrictId(Long districtId) { this.districtId = districtId; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public String getExamLevel() { return examLevel; }
    public void setExamLevel(String examLevel) { this.examLevel = examLevel; }

    public Boolean getIsSectionHead() { return isSectionHead; }
    public void setIsSectionHead(Boolean isSectionHead) { this.isSectionHead = isSectionHead; }

    public List<String> getSubjects() { return subjects; }
    public void setSubjects(List<String> subjects) { this.subjects = subjects; }

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }

    public Boolean getIsProfileComplete() { return isProfileComplete; }
    public void setIsProfileComplete(Boolean isProfileComplete) { this.isProfileComplete = isProfileComplete; }
}
