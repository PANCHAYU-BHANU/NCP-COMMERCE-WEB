package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "teacher_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TeacherProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User user;

    // 1. Full name (සම්පූර්ණ නම)
    private String fullName;

    // 2. Name with initials (මුලකුරු සමග නම)
    private String nameWithInitials;

    // 3. NIC (ජාතික හැඳුනුම්පත් අංකය)
    private String nic;

    // 4. WhatsApp number (වට්ස්ඇප් අංකය)
    private String whatsappNumber;

    // 5. Official address (රාජකාරි ලිපිනය)
    @Column(columnDefinition = "TEXT")
    private String officialAddress;

    // 6. Personal address (පෞද්ගලික ලිපිනය)
    @Column(columnDefinition = "TEXT")
    private String personalAddress;

    // 7. Educational qualifications (අධ්‍යාපන සුදුසුකම්)
    @Column(columnDefinition = "TEXT")
    private String educationalQualifications;

    // 8. Professional qualifications (වෘත්තීය සුදුසුකම්)
    @Column(columnDefinition = "TEXT")
    private String professionalQualifications;

    // 9. Current School (වත්මන් සේවා ස්ථානය)
    private String currentSchoolName;

    // 10. Previous schools served (පෙර සේවය කළ පාසල්)
    @Column(columnDefinition = "TEXT")
    private String previousSchools;

    // 11. Teaching subjects (උගන්වන විෂයයන්)
    private String teachingSubjects;

    // 12. Paper marking participation (ප්‍රශ්න පත්‍ර ඇගයීම් සහභාගීත්වය)
    private Boolean paperMarking = false;

    // Paper marking level: AL, OL, BOTH, NONE
    private String paperMarkingLevel = "NONE";

    // 13. First appointment date (මුල් පත්වීම් දිනය: YYYY-MM-DD)
    private String firstAppointmentDate;

    // 14. Appointment type (පත්වීම් වර්ගය - Graduate / Trained / SLTS / Dip in Edu / Other)
    private String appointmentType;

    // 15. Sri Lanka Teacher Service Grade/Class (ශ්‍රී ලංකා ගුරු සේවයේ ශ්‍රේණිය)
    private String serviceGrade;

    // 16. Email (විද්‍යුත් තැපෑල)
    private String email;

    // 17. Training needed (ඔබට අවශ්‍ය පුහුණුව)
    @Column(columnDefinition = "TEXT")
    private String trainingNeeded;

    // 18. Service nature (සේවයේ ස්වභාවය: Permanent / Temporary / Development Officer / Other)
    private String serviceNature;

    // 19. Profile picture (ඡායාරූපය)
    @Column(columnDefinition = "TEXT")
    private String profilePic;

    // 20. Whether profile is completely filled
    private Boolean isCompleted = false;

    public boolean calculateCompletion() {
        boolean complete = isNotEmpty(fullName)
                && isNotEmpty(nameWithInitials)
                && isNotEmpty(nic)
                && isNotEmpty(whatsappNumber)
                && isNotEmpty(officialAddress)
                && isNotEmpty(personalAddress)
                && isNotEmpty(educationalQualifications)
                && isNotEmpty(professionalQualifications)
                && isNotEmpty(currentSchoolName)
                && isNotEmpty(teachingSubjects)
                && (paperMarking != null)
                && isNotEmpty(firstAppointmentDate)
                && isNotEmpty(appointmentType)
                && isNotEmpty(serviceGrade)
                && isNotEmpty(email)
                && isNotEmpty(trainingNeeded)
                && isNotEmpty(serviceNature);
        this.isCompleted = complete;
        return complete;
    }

    private boolean isNotEmpty(String s) {
        return s != null && !s.trim().isEmpty();
    }
}

