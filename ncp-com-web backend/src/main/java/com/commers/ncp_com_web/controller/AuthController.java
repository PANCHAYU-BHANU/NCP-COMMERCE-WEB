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

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        String reqRole = signUpRequest.getRole();
        
        if (reqRole == null) {
            user.setRole(ERole.ROLE_ADMIN);
        } else {
            switch (reqRole) {
                case "provincial":
                    user.setRole(ERole.ROLE_PROVINCIAL_DIRECTOR);
                    if(signUpRequest.getProvinceId() != null)
                        user.setProvince(provinceRepository.findById(signUpRequest.getProvinceId()).orElse(null));
                    break;
                case "zonal":
                    user.setRole(ERole.ROLE_ZONAL_DIRECTOR);
                    if(signUpRequest.getZoneId() != null)
                        user.setZone(zoneRepository.findById(signUpRequest.getZoneId()).orElse(null));
                    break;
                case "divisional":
                    user.setRole(ERole.ROLE_DIVISIONAL_DIRECTOR);
                    if(signUpRequest.getDivisionId() != null)
                        user.setDivision(divisionRepository.findById(signUpRequest.getDivisionId()).orElse(null));
                    break;
                case "principal":
                    user.setRole(ERole.ROLE_PRINCIPAL);
                    if(signUpRequest.getSchoolId() != null)
                        user.setSchool(schoolRepository.findById(signUpRequest.getSchoolId()).orElse(null));
                    break;
                case "section_head":
                    user.setRole(ERole.ROLE_SECTION_HEAD);
                    if(signUpRequest.getSchoolId() != null)
                        user.setSchool(schoolRepository.findById(signUpRequest.getSchoolId()).orElse(null));
                    break;
                case "teacher":
                    user.setRole(ERole.ROLE_TEACHER);
                    if(signUpRequest.getSchoolId() != null)
                        user.setSchool(schoolRepository.findById(signUpRequest.getSchoolId()).orElse(null));
                    
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
                    break;
                default:
                    return ResponseEntity.badRequest().body(new MessageResponse("Error: Role is not found."));
            }
        }

        userRepository.save(user);

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
            
            return new UserResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail() != null ? user.getEmail() : "",
                    user.getRole().name().replace("ROLE_", ""),
                    location,
                    "Active" // Hardcoded status for now
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(userResponses);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found."));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
    }
}
