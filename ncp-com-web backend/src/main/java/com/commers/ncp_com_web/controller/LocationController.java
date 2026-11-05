package com.commers.ncp_com_web.controller;

import com.commers.ncp_com_web.entity.District;
import com.commers.ncp_com_web.entity.Division;
import com.commers.ncp_com_web.entity.School;
import com.commers.ncp_com_web.entity.Subject;
import com.commers.ncp_com_web.entity.User;
import com.commers.ncp_com_web.entity.Zone;
import com.commers.ncp_com_web.payload.response.MessageResponse;
import com.commers.ncp_com_web.repository.DistrictRepository;
import com.commers.ncp_com_web.repository.DivisionRepository;
import com.commers.ncp_com_web.repository.SchoolRepository;
import com.commers.ncp_com_web.repository.SubjectRepository;
import com.commers.ncp_com_web.repository.UserRepository;
import com.commers.ncp_com_web.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private DivisionRepository divisionRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/zone")
    @PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addZone(@RequestParam Long districtId, @RequestParam String name) {
        District district = districtRepository.findById(districtId).orElse(null);
        if (district == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: District not found."));
        }
        Zone zone = new Zone();
        zone.setName(name);
        zone.setDistrict(district);
        zoneRepository.save(zone);
        return ResponseEntity.ok(new MessageResponse("Zone added successfully!"));
    }

    @PostMapping("/division")
    @PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addDivision(@RequestParam Long zoneId, @RequestParam String name) {
        Zone zone = zoneRepository.findById(zoneId).orElse(null);
        if (zone == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Zone not found."));
        }
        Division division = new Division();
        division.setName(name);
        division.setZone(zone);
        divisionRepository.save(division);
        return ResponseEntity.ok(new MessageResponse("Division added successfully!"));
    }

    @PostMapping("/school")
    @PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addSchool(@RequestParam Long divisionId, @RequestParam String name) {
        Division division = divisionRepository.findById(divisionId).orElse(null);
        if (division == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Division not found."));
        }
        School school = new School();
        school.setName(name);
        school.setDivision(division);
        schoolRepository.save(school);
        return ResponseEntity.ok(new MessageResponse("School added successfully!"));
    }

    @DeleteMapping("/zone/{id}")
    @PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteZone(@PathVariable Long id) {
        if (!zoneRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Zone not found."));
        }
        try {
            zoneRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Zone deleted successfully!"));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Cannot delete zone: it contains divisions. Please delete them first."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error deleting zone."));
        }
    }

    @DeleteMapping("/division/{id}")
    @PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteDivision(@PathVariable Long id) {
        if (!divisionRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Division not found."));
        }
        try {
            divisionRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Division deleted successfully!"));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Cannot delete division: it contains schools. Please delete them first."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error deleting division."));
        }
    }

    @DeleteMapping("/school/{id}")
    @PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteSchool(@PathVariable Long id) {
        if (!schoolRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: School not found."));
        }
        try {
            schoolRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("School deleted successfully!"));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Cannot delete school: it is linked to users or other records."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error deleting school."));
        }
    }

    @PostMapping("/subject")
    @PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addSubject(@RequestBody(required = false) Subject bodySubject,
                                        @RequestParam(required = false) String name,
                                        @RequestParam(required = false) String type,
                                        @RequestParam(required = false) String medium) {
        String subName = (bodySubject != null && bodySubject.getName() != null) ? bodySubject.getName() : name;
        String subType = (bodySubject != null && bodySubject.getType() != null) ? bodySubject.getType() : type;
        String subMed = (bodySubject != null && bodySubject.getMedium() != null) ? bodySubject.getMedium() : (medium != null ? medium : "All");

        if (subName == null || subName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Subject name is required."));
        }
        String cleanType = (subType != null && subType.toUpperCase().contains("OL")) ? "OL" : "AL";
        Subject subject = new Subject();
        subject.setName(subName.trim());
        subject.setType(cleanType);
        subject.setMedium(subMed != null ? subMed.trim() : "All");

        if (bodySubject != null) {
            if (bodySubject.getCode() != null) subject.setCode(bodySubject.getCode().trim());
            if (bodySubject.getNameSi() != null) subject.setNameSi(bodySubject.getNameSi().trim());
            if (bodySubject.getNameTa() != null) subject.setNameTa(bodySubject.getNameTa().trim());
            if (bodySubject.getDescription() != null) subject.setDescription(bodySubject.getDescription().trim());
            if (bodySubject.getDescriptionSi() != null) subject.setDescriptionSi(bodySubject.getDescriptionSi().trim());
            if (bodySubject.getModules() != null) subject.setModules(bodySubject.getModules().trim());
            if (bodySubject.getModulesSi() != null) subject.setModulesSi(bodySubject.getModulesSi().trim());
            if (bodySubject.getImageUrl() != null) subject.setImageUrl(bodySubject.getImageUrl().trim());
            if (bodySubject.getColor() != null) subject.setColor(bodySubject.getColor().trim());
        }

        subjectRepository.save(subject);
        return ResponseEntity.ok(new MessageResponse("Subject '" + subject.getName() + "' (" + cleanType + ") added successfully!"));
    }

    @PutMapping("/subject/{id}")
    @PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateSubject(@PathVariable Long id, @RequestBody Subject req) {
        Subject subject = subjectRepository.findById(id).orElse(null);
        if (subject == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Subject not found."));
        }
        if (req.getName() != null && !req.getName().trim().isEmpty()) {
            subject.setName(req.getName().trim());
        }
        if (req.getCode() != null) subject.setCode(req.getCode().trim());
        if (req.getNameSi() != null) subject.setNameSi(req.getNameSi().trim());
        if (req.getNameTa() != null) subject.setNameTa(req.getNameTa().trim());
        if (req.getType() != null) {
            subject.setType(req.getType().toUpperCase().contains("OL") ? "OL" : "AL");
        }
        if (req.getMedium() != null) subject.setMedium(req.getMedium().trim());
        if (req.getDescription() != null) subject.setDescription(req.getDescription().trim());
        if (req.getDescriptionSi() != null) subject.setDescriptionSi(req.getDescriptionSi().trim());
        if (req.getModules() != null) subject.setModules(req.getModules().trim());
        if (req.getModulesSi() != null) subject.setModulesSi(req.getModulesSi().trim());
        if (req.getImageUrl() != null) subject.setImageUrl(req.getImageUrl().trim());
        if (req.getColor() != null) subject.setColor(req.getColor().trim());

        subjectRepository.save(subject);
        return ResponseEntity.ok(new MessageResponse("Subject '" + subject.getName() + "' updated successfully!"));
    }

    @DeleteMapping("/subject/{id}")
    @PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        Subject sub = subjectRepository.findById(id).orElse(null);
        if (sub == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Subject not found."));
        }
        try {
            // Safely unlink subject from users who have it assigned before deletion
            List<User> usersWithSubject = userRepository.findAll();
            for (User u : usersWithSubject) {
                if (u.getSubjects() != null && u.getSubjects().contains(sub)) {
                    u.getSubjects().remove(sub);
                    userRepository.save(u);
                }
            }
            subjectRepository.delete(sub);
            return ResponseEntity.ok(new MessageResponse("Subject '" + sub.getName() + "' deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error deleting subject: " + e.getMessage()));
        }
    }
}
