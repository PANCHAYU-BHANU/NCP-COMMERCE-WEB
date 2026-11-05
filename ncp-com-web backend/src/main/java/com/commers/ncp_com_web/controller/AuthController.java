package com.commers.ncp_com_web.controller;

import com.commers.ncp_com_web.entity.*;
import com.commers.ncp_com_web.payload.request.LoginRequest;
import com.commers.ncp_com_web.payload.request.SignupRequest;
import com.commers.ncp_com_web.payload.response.JwtResponse;
import com.commers.ncp_com_web.payload.response.MessageResponse;
import com.commers.ncp_com_web.payload.response.UserResponse;
import com.commers.ncp_com_web.repository.*;
import com.commers.ncp_com_web.security.jwt.JwtUtils;
import com.commers.ncp_com_web.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import com.commers.ncp_com_web.entity.Subject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ProvinceRepository provinceRepository;
    
    @Autowired
    DistrictRepository districtRepository;

    @Autowired
    ZoneRepository zoneRepository;

    @Autowired
    DivisionRepository divisionRepository;

    @Autowired
    SchoolRepository schoolRepository;

    @Autowired
    SubjectRepository subjectRepository;

    @Autowired
    StaffDetailRepository staffDetailRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        User user = userRepository.findById(userDetails.getId()).orElse(null);

        // Auto-link legacy test accounts if location was unset
        if (user != null) {
            boolean updated = false;
            if (user.getRole() == ERole.ROLE_ZONAL_DIRECTOR && user.getZone() == null) {
                Zone defaultZone = zoneRepository.findById(1L).orElse(null);
                if (defaultZone != null) {
                    user.setZone(defaultZone);
                    updated = true;
                }
            } else if ((user.getRole() == ERole.ROLE_PRINCIPAL || user.getRole() == ERole.ROLE_SECTION_HEAD || user.getRole() == ERole.ROLE_TEACHER) && user.getSchool() == null) {
                School defaultSchool = schoolRepository.findById(27248L).orElse(null);
                if (defaultSchool == null) {
                    List<School> allSchools = schoolRepository.findAll();
                    if (!allSchools.isEmpty()) defaultSchool = allSchools.get(0);
                }
                if (defaultSchool != null) {
                    user.setSchool(defaultSchool);
                    updated = true;
                }
            } else if (user.getRole() == ERole.ROLE_PROVINCIAL_DIRECTOR && user.getProvince() == null) {
                Province defaultProv = provinceRepository.findById(1L).orElse(null);
                if (defaultProv != null) {
                    user.setProvince(defaultProv);
                    updated = true;
                }
            }
            if (updated) {
                userRepository.save(user);
            }
        }

        JwtResponse response = new JwtResponse();
        response.setToken(jwt);
        response.setId(userDetails.getId());
        response.setUsername(userDetails.getUsername());
        response.setRoles(roles);

        String displayName = (user != null && user.getName() != null && !user.getName().trim().isEmpty() && !user.getName().equals(user.getUsername())) ? user.getName() : null;
        if (displayName == null) {
            if (user != null && user.getEmail() != null && user.getEmail().toLowerCase().contains("panchau")) {
                displayName = "Panchau Bhanu";
                user.setName(displayName);
                userRepository.save(user);
            } else if (user != null && user.getRole() != null) {
                if (user.getRole() == ERole.ROLE_PROVINCIAL_DIRECTOR) displayName = "Provincial Director";
                else if (user.getRole() == ERole.ROLE_ZONAL_DIRECTOR && user.getZone() != null) displayName = user.getZone().getName() + " Zonal Director";
                else if (user.getRole() == ERole.ROLE_DIVISIONAL_DIRECTOR && user.getDivision() != null) displayName = user.getDivision().getName() + " Divisional Director";
                else if (user.getRole() == ERole.ROLE_PRINCIPAL && user.getSchool() != null) displayName = user.getSchool().getName() + " Principal";
                else if (user.getRole() == ERole.ROLE_ADMIN) displayName = "System Administrator";
                else displayName = userDetails.getUsername();
            } else {
                displayName = userDetails.getUsername();
            }
        }
        response.setName(displayName);

        if (user != null) {
            if (user.getSchool() != null) {
                School sc = user.getSchool();
                response.setSchoolId(sc.getId());
                response.setSchoolName(sc.getName());
                response.setLocation(sc.getName());
                if (sc.getDivision() != null) {
                    Division div = sc.getDivision();
                    response.setDivisionId(div.getId());
                    response.setDivisionName(div.getName());
                    if (div.getZone() != null) {
                        Zone z = div.getZone();
                        response.setZoneId(z.getId());
                        response.setZoneName(z.getName());
                        if (z.getDistrict() != null) {
                            District dist = z.getDistrict();
                            response.setDistrictId(dist.getId());
                            response.setDistrictName(dist.getName());
                            if (dist.getProvince() != null) {
                                response.setProvinceId(dist.getProvince().getId());
                                response.setProvinceName(dist.getProvince().getName());
                            }
                        }
                    }
                }
            } else if (user.getDivision() != null) {
                Division div = user.getDivision();
                response.setDivisionId(div.getId());
                response.setDivisionName(div.getName());
                response.setLocation(div.getName() + " Division");
                if (div.getZone() != null) {
                    Zone z = div.getZone();
                    response.setZoneId(z.getId());
                    response.setZoneName(z.getName());
                    if (z.getDistrict() != null) {
                        District dist = z.getDistrict();
                        response.setDistrictId(dist.getId());
                        response.setDistrictName(dist.getName());
                    }
                }
            } else if (user.getZone() != null) {
                Zone z = user.getZone();
                response.setZoneId(z.getId());
                response.setZoneName(z.getName());
                response.setLocation(z.getName() + " Zone");
                if (z.getDistrict() != null) {
                    District dist = z.getDistrict();
                    response.setDistrictId(dist.getId());
                    response.setDistrictName(dist.getName());
                    if (dist.getProvince() != null) {
                        response.setProvinceId(dist.getProvince().getId());
                        response.setProvinceName(dist.getProvince().getName());
                    }
                }
            } else if (user.getDistrict() != null) {
                District dist = user.getDistrict();
                response.setDistrictId(dist.getId());
                response.setDistrictName(dist.getName());
                response.setLocation(dist.getName() + " District");
            } else if (user.getProvince() != null) {
                response.setProvinceId(user.getProvince().getId());
                response.setProvinceName(user.getProvince().getName());
                response.setLocation(user.getProvince().getName());
            } else {
                response.setLocation("North Central Province");
            }
            response.setExamLevel(user.getExamLevel());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        // Enforce Strong Password
        String pwd = signUpRequest.getPassword();
        if (pwd == null || pwd.length() < 8 || 
            !pwd.matches(".*[A-Z].*") || 
            !pwd.matches(".*[a-z].*") || 
            !pwd.matches(".*[0-9].*") || 
            !pwd.matches(".*[!@#$%^&*(),.?\":{}|<>\\-_].*")) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character (!@#$%^&*)."));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        
        String fullName = signUpRequest.getName();
        if ((fullName == null || fullName.trim().isEmpty()) && (signUpRequest.getFirstName() != null || signUpRequest.getLastName() != null)) {
            fullName = ((signUpRequest.getFirstName() != null ? signUpRequest.getFirstName().trim() : "") + " " + 
                        (signUpRequest.getLastName() != null ? signUpRequest.getLastName().trim() : "")).trim();
        }
        user.setName((fullName != null && !fullName.trim().isEmpty()) ? fullName.trim() : signUpRequest.getUsername());
        
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        String rawRole = signUpRequest.getRole();
        String reqRole = rawRole != null ? rawRole.trim().toLowerCase() : null;
        
        if (reqRole == null) {
            user.setRole(ERole.ROLE_ADMIN);
        } else {
            switch (reqRole) {
                case "provincial":
                case "provincial_director":
                case "role_provincial_director":
                    user.setRole(ERole.ROLE_PROVINCIAL_DIRECTOR);
                    if(signUpRequest.getProvinceId() != null)
                        user.setProvince(provinceRepository.findById(signUpRequest.getProvinceId()).orElse(null));
                    break;
                case "zonal":
                case "zonal_director":
                case "role_zonal_director":
                    user.setRole(ERole.ROLE_ZONAL_DIRECTOR);
                    if(signUpRequest.getZoneId() != null) {
                        Zone z = zoneRepository.findById(signUpRequest.getZoneId()).orElse(null);
                        user.setZone(z);
                        if (z != null && z.getDistrict() != null) {
                            user.setDistrict(z.getDistrict());
                        }
                    }
                    break;
                case "divisional":
                case "divisional_director":
                case "role_divisional_director":
                    user.setRole(ERole.ROLE_DIVISIONAL_DIRECTOR);
                    if(signUpRequest.getDivisionId() != null) {
                        Division div = divisionRepository.findById(signUpRequest.getDivisionId()).orElse(null);
                        user.setDivision(div);
                        if (div != null && div.getZone() != null) {
                            user.setZone(div.getZone());
                            if (div.getZone().getDistrict() != null) {
                                user.setDistrict(div.getZone().getDistrict());
                            }
                        }
                    }
                    break;
                case "principal":
                case "role_principal":
                    user.setRole(ERole.ROLE_PRINCIPAL);
                    if(signUpRequest.getSchoolId() != null) {
                        School sc = schoolRepository.findById(signUpRequest.getSchoolId()).orElse(null);
                        user.setSchool(sc);
                        if (sc != null && sc.getDivision() != null) {
                            user.setDivision(sc.getDivision());
                            if (sc.getDivision().getZone() != null) {
                                user.setZone(sc.getDivision().getZone());
                                if (sc.getDivision().getZone().getDistrict() != null) {
                                    user.setDistrict(sc.getDivision().getZone().getDistrict());
                                }
                            }
                        }
                    }
                    break;
                case "section_head":
                case "role_section_head":
                    user.setRole(ERole.ROLE_SECTION_HEAD);
                    if(signUpRequest.getSchoolId() != null) {
                        School sc = schoolRepository.findById(signUpRequest.getSchoolId()).orElse(null);
                        user.setSchool(sc);
                        if (sc != null && sc.getDivision() != null) {
                            user.setDivision(sc.getDivision());
                            if (sc.getDivision().getZone() != null) {
                                user.setZone(sc.getDivision().getZone());
                                if (sc.getDivision().getZone().getDistrict() != null) {
                                    user.setDistrict(sc.getDivision().getZone().getDistrict());
                                }
                            }
                        }
                    }
                    break;
                case "teacher":
                case "role_teacher":
                    user.setRole(ERole.ROLE_TEACHER);
                    if(signUpRequest.getSchoolId() != null) {
                        School sc = schoolRepository.findById(signUpRequest.getSchoolId()).orElse(null);
                        user.setSchool(sc);
                        if (sc != null && sc.getDivision() != null) {
                            user.setDivision(sc.getDivision());
                            if (sc.getDivision().getZone() != null) {
                                user.setZone(sc.getDivision().getZone());
                                if (sc.getDivision().getZone().getDistrict() != null) {
                                    user.setDistrict(sc.getDivision().getZone().getDistrict());
                                }
                            }
                        }
                    }
                    
                    if(signUpRequest.getExamLevel() != null) {
                        user.setExamLevel(signUpRequest.getExamLevel());
                    }

                    if(signUpRequest.getSubjectIds() != null && !signUpRequest.getSubjectIds().isEmpty()) {
                        java.util.Set<Subject> subjects = new java.util.HashSet<>();
                        for (Long subId : signUpRequest.getSubjectIds()) {
                            subjectRepository.findById(subId).ifPresent(subjects::add);
                        }
                        user.setSubjects(subjects);
                    }
                    if (signUpRequest.getIsSectionHead() != null) {
                        user.setIsSectionHead(signUpRequest.getIsSectionHead());
                    }
                    break;
                case "admin":
                case "role_admin":
                    user.setRole(ERole.ROLE_ADMIN);
                    break;
                default:
                    return ResponseEntity.badRequest().body(new MessageResponse("Error: Role is not found."));
            }
        }

        userRepository.save(user);

        // Synchronize Principal and Section Head to School Staff Directory
        if (user.getSchool() != null) {
            School sc = user.getSchool();
            if (user.getRole() == ERole.ROLE_PRINCIPAL) {
                StaffDetail prin = staffDetailRepository.findBySchoolId(sc.getId()).stream()
                        .filter(s -> "PRINCIPAL".equalsIgnoreCase(s.getDesignation()))
                        .findFirst().orElse(new StaffDetail());
                prin.setName(user.getName() != null && !user.getName().trim().isEmpty() ? user.getName() : user.getUsername());
                prin.setEmail(user.getEmail());
                prin.setDesignation("PRINCIPAL");
                prin.setSchool(sc);
                staffDetailRepository.save(prin);
            } else if (Boolean.TRUE.equals(user.getIsSectionHead()) || user.getRole() == ERole.ROLE_SECTION_HEAD) {
                StaffDetail head = staffDetailRepository.findBySchoolId(sc.getId()).stream()
                        .filter(s -> "SECTION_HEAD".equalsIgnoreCase(s.getDesignation()))
                        .findFirst().orElse(new StaffDetail());
                head.setName(user.getName() != null && !user.getName().trim().isEmpty() ? user.getName() : user.getUsername());
                head.setEmail(user.getEmail());
                head.setDesignation("SECTION_HEAD");
                head.setSchool(sc);
                staffDetailRepository.save(head);
            }
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @GetMapping("/test/roles")
    public ResponseEntity<?> testRoles() {
        return ResponseEntity.ok(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities());
    }

    @GetMapping("/test/users")
    public ResponseEntity<?> testUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/test/reset-passwords")
    public ResponseEntity<?> resetPasswords() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            user.setPassword(encoder.encode("password"));
            userRepository.save(user);
        }
        return ResponseEntity.ok("All passwords reset to 'password'");
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> userResponses = users.stream().map(user -> {
            String location = "N/A";
            if (user.getRole() == ERole.ROLE_PROVINCIAL_DIRECTOR && user.getProvince() != null) {
                location = user.getProvince().getName();
            } else if (user.getRole() == ERole.ROLE_ZONAL_DIRECTOR && user.getZone() != null) {
                location = user.getZone().getName();
            } else if (user.getRole() == ERole.ROLE_DIVISIONAL_DIRECTOR && user.getDivision() != null) {
                location = user.getDivision().getName();
            } else if ((user.getRole() == ERole.ROLE_PRINCIPAL || user.getRole() == ERole.ROLE_SECTION_HEAD || user.getRole() == ERole.ROLE_TEACHER) && user.getSchool() != null) {
                location = user.getSchool().getName();
                if (user.getRole() == ERole.ROLE_TEACHER) {
                    if (user.getExamLevel() != null) {
                        location += " (" + user.getExamLevel() + ")";
                    }
                    if (user.getSubjects() != null && !user.getSubjects().isEmpty()) {
                        String subjectNames = user.getSubjects().stream().map(Subject::getName).collect(Collectors.joining(", "));
                        location += " - " + subjectNames;
                    }
                }
            } else if (user.getRole() == ERole.ROLE_ADMIN) {
                location = "System Admin";
            }
            
            String displayName = (user.getName() != null && !user.getName().trim().isEmpty() && !user.getName().equals(user.getUsername())) ? user.getName() : null;
            if (displayName == null) {
                if (user.getEmail() != null && user.getEmail().toLowerCase().contains("panchau")) {
                    displayName = "Panchau Bhanu";
                    user.setName(displayName);
                    userRepository.save(user);
                } else if (user.getRole() == ERole.ROLE_PROVINCIAL_DIRECTOR) displayName = "Provincial Director";
                else if (user.getRole() == ERole.ROLE_ZONAL_DIRECTOR && user.getZone() != null) displayName = user.getZone().getName() + " Zonal Director";
                else if (user.getRole() == ERole.ROLE_DIVISIONAL_DIRECTOR && user.getDivision() != null) displayName = user.getDivision().getName() + " Divisional Director";
                else if (user.getRole() == ERole.ROLE_PRINCIPAL && user.getSchool() != null) displayName = user.getSchool().getName() + " Principal";
                else if (user.getRole() == ERole.ROLE_ADMIN) displayName = "System Administrator";
                else displayName = user.getUsername();
            }

            UserResponse resp = new UserResponse(
                    user.getId(),
                    displayName,
                    user.getEmail() != null ? user.getEmail() : "",
                    user.getRole().name().replace("ROLE_", ""),
                    location,
                    "Active" // Hardcoded status for now
            );
            resp.setUsername(user.getUsername());

            if (user.getSchool() != null) {
                resp.setSchoolId(user.getSchool().getId());
                resp.setSchoolName(user.getSchool().getName());
            }
            if (user.getDivision() != null) {
                resp.setDivisionId(user.getDivision().getId());
                resp.setDivisionName(user.getDivision().getName());
            } else if (user.getSchool() != null && user.getSchool().getDivision() != null) {
                resp.setDivisionId(user.getSchool().getDivision().getId());
                resp.setDivisionName(user.getSchool().getDivision().getName());
            }
            if (user.getZone() != null) {
                resp.setZoneId(user.getZone().getId());
                resp.setZoneName(user.getZone().getName());
            } else if (user.getSchool() != null && user.getSchool().getDivision() != null && user.getSchool().getDivision().getZone() != null) {
                resp.setZoneId(user.getSchool().getDivision().getZone().getId());
                resp.setZoneName(user.getSchool().getDivision().getZone().getName());
            }
            if (user.getDistrict() != null) {
                resp.setDistrictId(user.getDistrict().getId());
                resp.setDistrictName(user.getDistrict().getName());
            } else if (user.getSchool() != null && user.getSchool().getDivision() != null && user.getSchool().getDivision().getZone() != null && user.getSchool().getDivision().getZone().getDistrict() != null) {
                resp.setDistrictId(user.getSchool().getDivision().getZone().getDistrict().getId());
                resp.setDistrictName(user.getSchool().getDivision().getZone().getDistrict().getName());
            }
            resp.setExamLevel(user.getExamLevel());
            resp.setIsSectionHead(user.getIsSectionHead() != null ? user.getIsSectionHead() : false);
            if (user.getSubjects() != null && !user.getSubjects().isEmpty()) {
                resp.setSubjects(user.getSubjects().stream().map(Subject::getName).collect(Collectors.toList()));
            }

            return resp;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(userResponses);
    }

    @DeleteMapping("/users/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found."));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
    }

    @PutMapping("/users/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody SignupRequest updateRequest) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found."));
        }

        String fullName = updateRequest.getName();
        if ((fullName == null || fullName.trim().isEmpty()) && (updateRequest.getFirstName() != null || updateRequest.getLastName() != null)) {
            fullName = ((updateRequest.getFirstName() != null ? updateRequest.getFirstName().trim() : "") + " " + 
                        (updateRequest.getLastName() != null ? updateRequest.getLastName().trim() : "")).trim();
        }
        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setName(fullName.trim());
        }

        if (updateRequest.getEmail() != null && !updateRequest.getEmail().trim().isEmpty()) {
            user.setEmail(updateRequest.getEmail().trim());
        }

        if (updateRequest.getPassword() != null && !updateRequest.getPassword().trim().isEmpty()) {
            user.setPassword(encoder.encode(updateRequest.getPassword().trim()));
        }

        if (updateRequest.getRole() != null && !updateRequest.getRole().trim().isEmpty()) {
            String r = updateRequest.getRole().trim().toLowerCase();
            if (r.contains("provincial")) user.setRole(ERole.ROLE_PROVINCIAL_DIRECTOR);
            else if (r.contains("zonal")) user.setRole(ERole.ROLE_ZONAL_DIRECTOR);
            else if (r.contains("divisional")) user.setRole(ERole.ROLE_DIVISIONAL_DIRECTOR);
            else if (r.contains("principal")) user.setRole(ERole.ROLE_PRINCIPAL);
            else if (r.contains("section_head")) user.setRole(ERole.ROLE_SECTION_HEAD);
            else if (r.contains("teacher")) user.setRole(ERole.ROLE_TEACHER);
        }

        // Official Transfer & Hierarchy Update (Provincial Director Exclusive)
        if (updateRequest.getSchoolId() != null) {
            School newSchool = schoolRepository.findById(updateRequest.getSchoolId()).orElse(null);
            user.setSchool(newSchool);
            if (newSchool != null && newSchool.getDivision() != null) {
                user.setDivision(newSchool.getDivision());
                if (newSchool.getDivision().getZone() != null) {
                    user.setZone(newSchool.getDivision().getZone());
                    if (newSchool.getDivision().getZone().getDistrict() != null) {
                        user.setDistrict(newSchool.getDivision().getZone().getDistrict());
                    }
                }
            }
        } else if (updateRequest.getDivisionId() != null) {
            Division div = divisionRepository.findById(updateRequest.getDivisionId()).orElse(null);
            user.setDivision(div);
            user.setSchool(null);
            if (div != null && div.getZone() != null) {
                user.setZone(div.getZone());
                if (div.getZone().getDistrict() != null) {
                    user.setDistrict(div.getZone().getDistrict());
                }
            }
        } else if (updateRequest.getZoneId() != null) {
            Zone z = zoneRepository.findById(updateRequest.getZoneId()).orElse(null);
            user.setZone(z);
            user.setDivision(null);
            user.setSchool(null);
            if (z != null && z.getDistrict() != null) {
                user.setDistrict(z.getDistrict());
            }
        } else if (updateRequest.getDistrictId() != null) {
            user.setDistrict(districtRepository.findById(updateRequest.getDistrictId()).orElse(null));
            user.setZone(null);
            user.setDivision(null);
            user.setSchool(null);
        }

        if (updateRequest.getExamLevel() != null) {
            user.setExamLevel(updateRequest.getExamLevel());
        }

        if (updateRequest.getSubjectIds() != null) {
            java.util.Set<Subject> subjects = new java.util.HashSet<>();
            for (Long subId : updateRequest.getSubjectIds()) {
                subjectRepository.findById(subId).ifPresent(subjects::add);
            }
            user.setSubjects(subjects);
        }

        if (updateRequest.getIsSectionHead() != null) {
            user.setIsSectionHead(updateRequest.getIsSectionHead());
        }

        userRepository.save(user);

        // Synchronize Principal and Section Head on update
        if (user.getSchool() != null) {
            School sc = user.getSchool();
            if (user.getRole() == ERole.ROLE_PRINCIPAL) {
                StaffDetail prin = staffDetailRepository.findBySchoolId(sc.getId()).stream()
                        .filter(s -> "PRINCIPAL".equalsIgnoreCase(s.getDesignation()))
                        .findFirst().orElse(new StaffDetail());
                prin.setName(user.getName() != null && !user.getName().trim().isEmpty() ? user.getName() : user.getUsername());
                prin.setEmail(user.getEmail());
                prin.setDesignation("PRINCIPAL");
                prin.setSchool(sc);
                staffDetailRepository.save(prin);
            } else if (Boolean.TRUE.equals(user.getIsSectionHead()) || user.getRole() == ERole.ROLE_SECTION_HEAD) {
                StaffDetail head = staffDetailRepository.findBySchoolId(sc.getId()).stream()
                        .filter(s -> "SECTION_HEAD".equalsIgnoreCase(s.getDesignation()))
                        .findFirst().orElse(new StaffDetail());
                head.setName(user.getName() != null && !user.getName().trim().isEmpty() ? user.getName() : user.getUsername());
                head.setEmail(user.getEmail());
                head.setDesignation("SECTION_HEAD");
                head.setSchool(sc);
                staffDetailRepository.save(head);
            }
        }
        return ResponseEntity.ok(new MessageResponse("User updated successfully!"));
    }

    @PutMapping("/users/{id}/password")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> changeUserPassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> request) {
        String newPassword = request.get("newPassword");
        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Password must be at least 6 characters long!"));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found."));
        }

        user.setPassword(encoder.encode(newPassword.trim()));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password for '" + user.getUsername() + "' updated successfully!"));
    }
}
