package com.commers.ncp_com_web.controller;

import com.commers.ncp_com_web.entity.District;
import com.commers.ncp_com_web.entity.Division;
import com.commers.ncp_com_web.entity.School;
import com.commers.ncp_com_web.entity.Zone;
import com.commers.ncp_com_web.payload.response.MessageResponse;
import com.commers.ncp_com_web.repository.DistrictRepository;
import com.commers.ncp_com_web.repository.DivisionRepository;
import com.commers.ncp_com_web.repository.SchoolRepository;
import com.commers.ncp_com_web.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;

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
    @PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('ADMIN')")
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
}
