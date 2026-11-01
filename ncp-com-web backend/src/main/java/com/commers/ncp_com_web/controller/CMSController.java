package com.commers.ncp_com_web.controller;

import com.commers.ncp_com_web.entity.MediaGallery;
import com.commers.ncp_com_web.entity.News;
import com.commers.ncp_com_web.entity.Event;
import com.commers.ncp_com_web.payload.response.MessageResponse;
import com.commers.ncp_com_web.repository.MediaGalleryRepository;
import com.commers.ncp_com_web.repository.NewsRepository;
import com.commers.ncp_com_web.repository.EventRepository;
import com.commers.ncp_com_web.repository.CommitteeMemberRepository;
import com.commers.ncp_com_web.repository.ZoneRepository;
import com.commers.ncp_com_web.repository.CommitteeRepository;
import com.commers.ncp_com_web.repository.UserRepository;
import com.commers.ncp_com_web.entity.CommitteeMember;
import com.commers.ncp_com_web.entity.Committee;
import com.commers.ncp_com_web.entity.User;
import com.commers.ncp_com_web.entity.Zone;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.commers.ncp_com_web.service.FileStorageService;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cms")
public class CMSController {

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private MediaGalleryRepository mediaGalleryRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private CommitteeMemberRepository committeeMemberRepository;

    @Autowired
    private CommitteeRepository committeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ZoneRepository zoneRepository;

    // --- News Endpoints ---

    @GetMapping("/news")
    public ResponseEntity<List<News>> getAllNews() {
        return ResponseEntity.ok(newsRepository.findAll());
    }

    @PostMapping("/news")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR')")
    public ResponseEntity<?> addNews(@RequestBody News news) {
        if(news.getStatus() == null) {
            news.setStatus("Draft");
        }
        if(news.getCreatedAt() == null) {
            news.setCreatedAt(LocalDateTime.now());
        }
        newsRepository.save(news);
        return ResponseEntity.ok(new MessageResponse("News added successfully!"));
    }

    @PutMapping("/news/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR')")
    public ResponseEntity<?> updateNews(@PathVariable Long id, @RequestBody News newsDetails) {
        return newsRepository.findById(id).map(news -> {
            news.setTitle(newsDetails.getTitle());
            news.setContent(newsDetails.getContent());
            news.setCategory(newsDetails.getCategory());
            news.setStatus(newsDetails.getStatus());
            if (newsDetails.getExamLevel() != null) {
                news.setExamLevel(newsDetails.getExamLevel());
            }
            newsRepository.save(news);
            return ResponseEntity.ok(new MessageResponse("News updated successfully!"));
        }).orElse(ResponseEntity.badRequest().body(new MessageResponse("Error: News not found.")));
    }

    @DeleteMapping("/news/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR')")
    public ResponseEntity<?> deleteNews(@PathVariable Long id) {
        if(newsRepository.existsById(id)) {
            newsRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("News deleted successfully!"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Error: News not found."));
    }

    // --- Media Gallery Endpoints ---

    @GetMapping("/media")
    public ResponseEntity<List<MediaGallery>> getAllMedia() {
        return ResponseEntity.ok(mediaGalleryRepository.findAll());
    }

    @PostMapping("/media")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR')")
    public ResponseEntity<?> addMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("type") String type,
            @RequestParam(value = "album", required = false) String album,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "examLevel", required = false) String examLevel) {
        
        try {
            String fileName = fileStorageService.storeFile(file);
            String url = "/uploads/" + fileName;

            MediaGallery media = new MediaGallery();
            media.setTitle(title);
            media.setType(type);
            media.setUrl(url);
            media.setAlbum(album);
            media.setDescription(description);
            media.setExamLevel(examLevel != null ? examLevel : "GENERAL");

            mediaGalleryRepository.save(media);
            return ResponseEntity.ok(new MessageResponse("Media uploaded successfully!"));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Could not upload file: " + e.getMessage()));
        }
    }

    @DeleteMapping("/media/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR')")
    public ResponseEntity<?> deleteMedia(@PathVariable Long id) {
        if(mediaGalleryRepository.existsById(id)) {
            mediaGalleryRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Media deleted successfully!"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Media not found."));
    }

    // --- Events Endpoints ---

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findAllByOrderByEventDateDesc());
    }

    @PostMapping("/events")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR')")
    public ResponseEntity<?> addEvent(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("eventDate") String eventDateStr,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "examLevel", required = false) String examLevel) {
        
        try {
            Event event = new Event();
            event.setTitle(title);
            event.setDescription(description);
            event.setEventDate(LocalDateTime.parse(eventDateStr));
            event.setExamLevel(examLevel != null ? examLevel : "GENERAL");
            
            if (image != null && !image.isEmpty()) {
                String fileName = fileStorageService.storeFile(image);
                event.setImageUrl("/uploads/" + fileName);
            }
            
            eventRepository.save(event);

            return ResponseEntity.ok(new MessageResponse("Event added successfully!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Could not add event: " + e.getMessage()));
        }
    }

    @PutMapping("/events/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR')")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("eventDate") String eventDateStr,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "examLevel", required = false) String examLevel) {
        
        return eventRepository.findById(id).map(event -> {
            try {
                event.setTitle(title);
                event.setDescription(description);
                event.setEventDate(LocalDateTime.parse(eventDateStr));
                if (examLevel != null) event.setExamLevel(examLevel);
                
                if (image != null && !image.isEmpty()) {
                    String fileName = fileStorageService.storeFile(image);
                    event.setImageUrl("/uploads/" + fileName);
                }
                
                eventRepository.save(event);
                return ResponseEntity.ok(new MessageResponse("Event updated successfully!"));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body(new MessageResponse("Could not update event: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.badRequest().body(new MessageResponse("Error: Event not found.")));
    }

    @DeleteMapping("/events/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR')")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        eventRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Event deleted successfully!"));
    }

    // --- Committee Endpoints ---
    
    @PostMapping("/committees")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR')")
    public ResponseEntity<?> createCommittee(
            @RequestParam("name") String name,
            @RequestParam("type") String type,
            @RequestParam(value = "zoneId", required = false) Long zoneId) {
        try {
            Committee committee = new Committee();
            committee.setName(name);
            committee.setType(type);
            if ("ZONAL".equalsIgnoreCase(type) && zoneId != null) {
                Zone zone = zoneRepository.findById(zoneId).orElse(null);
                if (zone == null) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Zone not found"));
                }
                committee.setZone(zone);
            }
            committeeRepository.save(committee);
            return ResponseEntity.ok(new MessageResponse("Committee created successfully!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Could not create committee: " + e.getMessage()));
        }
    }

    @DeleteMapping("/committees/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR')")
    public ResponseEntity<?> deleteCommittee(@PathVariable Long id) {
        // Also delete members if cascade isn't setup
        List<CommitteeMember> members = committeeMemberRepository.findByCommitteeId(id);
        committeeMemberRepository.deleteAll(members);
        committeeRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Committee deleted successfully!"));
    }

    @PostMapping("/committees/{committeeId}/members")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR')")
    public ResponseEntity<?> addCommitteeMember(
            @PathVariable Long committeeId,
            @RequestParam("userId") Long userId,
            @RequestParam("position") String position) {
        try {
            Committee committee = committeeRepository.findById(committeeId).orElse(null);
            if (committee == null) return ResponseEntity.badRequest().body(new MessageResponse("Committee not found"));

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return ResponseEntity.badRequest().body(new MessageResponse("User not found"));

            CommitteeMember member = new CommitteeMember();
            member.setCommittee(committee);
            member.setUser(user);
            member.setPosition(position);
            
            committeeMemberRepository.save(member);
            return ResponseEntity.ok(new MessageResponse("Committee member added successfully!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Could not add member: " + e.getMessage()));
        }
    }

    @DeleteMapping("/committees/members/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR')")
    public ResponseEntity<?> deleteCommitteeMember(@PathVariable Long id) {
        committeeMemberRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Committee member deleted successfully!"));
    }
}
