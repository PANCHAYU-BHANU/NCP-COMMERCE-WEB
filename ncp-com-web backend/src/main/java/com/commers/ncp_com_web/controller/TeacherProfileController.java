package com.commers.ncp_com_web.controller;

import com.commers.ncp_com_web.entity.ERole;
import com.commers.ncp_com_web.entity.Subject;
import com.commers.ncp_com_web.entity.TeacherProfile;
import com.commers.ncp_com_web.entity.User;
import com.commers.ncp_com_web.payload.response.MessageResponse;
import com.commers.ncp_com_web.repository.TeacherProfileRepository;
import com.commers.ncp_com_web.repository.UserRepository;
import com.commers.ncp_com_web.security.services.UserDetailsImpl;
import com.commers.ncp_com_web.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/teacher-profile")
public class TeacherProfileController {

    @Autowired
    private TeacherProfileRepository teacherProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            return userRepository.findByUsername(username).orElse(null);
        }
        return null;
    }

    private List<String> detectMissingFields(TeacherProfile p) {
        List<String> missing = new ArrayList<>();
        if (isEmpty(p.getFullName())) missing.add("Full Name (සම්පූර්ණ නම)");
        if (isEmpty(p.getNameWithInitials())) missing.add("Name with Initials (මුලකුරු සමඟ නම)");
        if (isEmpty(p.getNic())) missing.add("NIC (ජාතික හැඳුනුම්පත් අංකය)");
        if (isEmpty(p.getWhatsappNumber())) missing.add("WhatsApp Number (වට්ස්ඇප් අංකය)");
        if (isEmpty(p.getOfficialAddress())) missing.add("Official Address (රාජකාරි ලිපිනය)");
        if (isEmpty(p.getPersonalAddress())) missing.add("Personal Address (පෞද්ගලික ලිපිනය)");
        if (isEmpty(p.getEducationalQualifications())) missing.add("Educational Qualifications (අධ්‍යාපන සුදුසුකම්)");
        if (isEmpty(p.getProfessionalQualifications())) missing.add("Professional Qualifications (වෘත්තීය සුදුසුකම්)");
        if (isEmpty(p.getCurrentSchoolName())) missing.add("Current School (වත්මන් සේවා ස්ථානය)");
        if (isEmpty(p.getTeachingSubjects())) missing.add("Teaching Subjects (උගන්වන විෂයයන්)");
        if (p.getPaperMarking() == null) missing.add("Paper Marking Participation (ප්‍රශ්න පත්‍ර ඇගයීම් සහභාගීත්වය)");
        if (isEmpty(p.getFirstAppointmentDate())) missing.add("First Appointment Date (මුල් පත්වීම් දිනය)");
        if (isEmpty(p.getAppointmentType())) missing.add("Appointment Type (පත්වීම් වර්ගය)");
        if (isEmpty(p.getServiceGrade())) missing.add("SLTS Grade (ශ්‍රී ලංකා ගුරු සේවයේ ශ්‍රේණිය)");
        if (isEmpty(p.getEmail())) missing.add("Email Address (විද්‍යුත් තැපෑල)");
        if (isEmpty(p.getTrainingNeeded())) missing.add("Training Needed (අවශ්‍ය පුහුණුව)");
        if (isEmpty(p.getServiceNature())) missing.add("Service Nature (සේවයේ ස්වභාවය)");
        return missing;
    }

    private boolean isEmpty(String s) {
        return s == null || s.trim().isEmpty();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        }

        TeacherProfile profile = teacherProfileRepository.findByUserId(user.getId()).orElse(null);
        if (profile == null) {
            // Prepopulate draft profile from user data
            profile = new TeacherProfile();
            profile.setUser(user);
            profile.setNic(user.getUsername());
            profile.setNameWithInitials(user.getName());
            profile.setEmail(user.getEmail());
            profile.setProfilePic(user.getProfilePic());
            if (user.getSchool() != null) {
                profile.setCurrentSchoolName(user.getSchool().getName());
            }
            if (user.getSubjects() != null && !user.getSubjects().isEmpty()) {
                String subStr = user.getSubjects().stream().map(Subject::getName).collect(Collectors.joining(", "));
                profile.setTeachingSubjects(subStr);
            }
            profile.calculateCompletion();
            profile = teacherProfileRepository.save(profile);
        } else {
            // Keep current school & subjects synced if user has official placement
            if (isEmpty(profile.getCurrentSchoolName()) && user.getSchool() != null) {
                profile.setCurrentSchoolName(user.getSchool().getName());
            }
            if (isEmpty(profile.getTeachingSubjects()) && user.getSubjects() != null && !user.getSubjects().isEmpty()) {
                String subStr = user.getSubjects().stream().map(Subject::getName).collect(Collectors.joining(", "));
                profile.setTeachingSubjects(subStr);
            }
            if (isEmpty(profile.getNic())) {
                profile.setNic(user.getUsername());
            }
            if (isEmpty(profile.getProfilePic()) && user.getProfilePic() != null) {
                profile.setProfilePic(user.getProfilePic());
            }
        }

        List<String> missing = detectMissingFields(profile);
        profile.setIsCompleted(missing.isEmpty());

        Map<String, Object> resp = new HashMap<>();
        resp.put("profile", profile);
        resp.put("isCompleted", profile.getIsCompleted());
        resp.put("missingFields", missing);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/me")
    public ResponseEntity<?> saveMyProfile(@RequestBody TeacherProfile input) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        }

        TeacherProfile profile = teacherProfileRepository.findByUserId(user.getId()).orElse(new TeacherProfile());
        profile.setUser(user);
        profile.setFullName(input.getFullName());
        profile.setNameWithInitials(input.getNameWithInitials());
        profile.setNic(input.getNic() != null ? input.getNic() : user.getUsername());
        profile.setWhatsappNumber(input.getWhatsappNumber());
        profile.setOfficialAddress(input.getOfficialAddress());
        profile.setPersonalAddress(input.getPersonalAddress());
        profile.setEducationalQualifications(input.getEducationalQualifications());
        profile.setProfessionalQualifications(input.getProfessionalQualifications());

        if (input.getCurrentSchoolName() != null && !input.getCurrentSchoolName().trim().isEmpty()) {
            profile.setCurrentSchoolName(input.getCurrentSchoolName());
        } else if (user.getSchool() != null) {
            profile.setCurrentSchoolName(user.getSchool().getName());
        }

        profile.setPreviousSchools(input.getPreviousSchools());
        profile.setTeachingSubjects(input.getTeachingSubjects());
        profile.setPaperMarking(input.getPaperMarking() != null ? input.getPaperMarking() : false);
        profile.setPaperMarkingLevel(input.getPaperMarkingLevel() != null ? input.getPaperMarkingLevel() : "NONE");
        profile.setFirstAppointmentDate(input.getFirstAppointmentDate());
        profile.setAppointmentType(input.getAppointmentType());
        profile.setServiceGrade(input.getServiceGrade());
        profile.setEmail(input.getEmail());
        profile.setTrainingNeeded(input.getTrainingNeeded());
        profile.setServiceNature(input.getServiceNature());
        if (input.getProfilePic() != null) {
            profile.setProfilePic(input.getProfilePic());
        }

        List<String> missing = detectMissingFields(profile);
        profile.setIsCompleted(missing.isEmpty());

        teacherProfileRepository.save(profile);

        // Sync display name, email, and photo to User record
        if (profile.getNameWithInitials() != null && !profile.getNameWithInitials().trim().isEmpty()) {
            user.setName(profile.getNameWithInitials().trim());
        }
        if (profile.getEmail() != null && !profile.getEmail().trim().isEmpty()) {
            user.setEmail(profile.getEmail().trim());
        }
        if (profile.getProfilePic() != null && !profile.getProfilePic().trim().isEmpty()) {
            user.setProfilePic(profile.getProfilePic().trim());
        }
        userRepository.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("message", profile.getIsCompleted() 
                ? "Teacher Profile fully completed and saved successfully!" 
                : "Profile details saved. Some mandatory fields are still pending.");
        resp.put("profile", profile);
        resp.put("isCompleted", profile.getIsCompleted());
        resp.put("missingFields", missing);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/upload-photo")
    public ResponseEntity<?> uploadProfilePhoto(@RequestParam("photo") MultipartFile photo) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        }

        if (photo == null || photo.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("No file provided"));
        }

        try {
            String fileName = fileStorageService.storeFile(photo);
            String photoUrl = "/uploads/" + fileName;

            // Update user record
            user.setProfilePic(photoUrl);
            userRepository.save(user);

            // Update teacher profile if exists
            teacherProfileRepository.findByUserId(user.getId()).ifPresent(p -> {
                p.setProfilePic(photoUrl);
                teacherProfileRepository.save(p);
            });

            Map<String, Object> resp = new HashMap<>();
            resp.put("url", photoUrl);
            resp.put("message", "Profile photo uploaded successfully!");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Failed to upload photo: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getTeacherProfileByUserId(@PathVariable Long userId) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        }

        User targetTeacher = userRepository.findById(userId).orElse(null);
        if (targetTeacher == null) {
            return ResponseEntity.notFound().build();
        }

        // Authorization check:
        // Provincial Director, Admin, Zonal Director, Divisional Director, Principal, Section Head can view
        // Target teacher can view themselves
        boolean authorized = false;
        if (currentUser.getRole() == ERole.ROLE_PROVINCIAL_DIRECTOR 
                || currentUser.getRole() == ERole.ROLE_ADMIN
                || currentUser.getRole() == ERole.ROLE_ZONAL_DIRECTOR
                || currentUser.getRole() == ERole.ROLE_DIVISIONAL_DIRECTOR
                || currentUser.getRole() == ERole.ROLE_PRINCIPAL
                || currentUser.getRole() == ERole.ROLE_SECTION_HEAD) {
            authorized = true;
        } else if (currentUser.getId().equals(userId)) {
            authorized = true;
        }

        if (!authorized) {
            return ResponseEntity.status(403).body(new MessageResponse("Access denied: You do not have authority to view this teacher's dossier."));
        }

        TeacherProfile profile = teacherProfileRepository.findByUserId(userId).orElse(null);
        if (profile == null) {
            // Generate clean dossier projection from user data
            profile = new TeacherProfile();
            profile.setUser(targetTeacher);
            profile.setNic(targetTeacher.getUsername());
            profile.setNameWithInitials(targetTeacher.getName());
            profile.setEmail(targetTeacher.getEmail());
            profile.setProfilePic(targetTeacher.getProfilePic());
            if (targetTeacher.getSchool() != null) {
                profile.setCurrentSchoolName(targetTeacher.getSchool().getName());
            }
            if (targetTeacher.getSubjects() != null && !targetTeacher.getSubjects().isEmpty()) {
                String subStr = targetTeacher.getSubjects().stream().map(Subject::getName).collect(Collectors.joining(", "));
                profile.setTeachingSubjects(subStr);
            }
            profile.setIsCompleted(false);
        }

        List<String> missing = detectMissingFields(profile);
        profile.setIsCompleted(missing.isEmpty());

        Map<String, Object> resp = new HashMap<>();
        resp.put("profile", profile);
        resp.put("teacher", targetTeacher);
        resp.put("isCompleted", profile.getIsCompleted());
        resp.put("missingFields", missing);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/all-status")
    public ResponseEntity<?> getAllTeacherStatuses() {
        List<TeacherProfile> all = teacherProfileRepository.findAll();
        Map<Long, Map<String, Object>> map = new HashMap<>();
        for (TeacherProfile p : all) {
            if (p.getUser() != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("userId", p.getUser().getId());
                item.put("isCompleted", Boolean.TRUE.equals(p.getIsCompleted()));
                item.put("profilePic", p.getProfilePic());
                item.put("serviceGrade", p.getServiceGrade());
                item.put("serviceNature", p.getServiceNature());
                item.put("appointmentType", p.getAppointmentType());
                item.put("paperMarking", Boolean.TRUE.equals(p.getPaperMarking()));
                item.put("paperMarkingLevel", p.getPaperMarkingLevel());
                map.put(p.getUser().getId(), item);
            }
        }
        return ResponseEntity.ok(map);
    }
}
