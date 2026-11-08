package com.commers.ncp_com_web.controller;

import com.commers.ncp_com_web.entity.*;
import com.commers.ncp_com_web.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Collections;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/school")
public class SchoolController {

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private StudentCountRepository studentCountRepository;

    @Autowired
    private TeacherRepository teacherRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private AlNationalResultRepository alNationalResultRepository;
    
    @Autowired
    private StudentAlResultRepository studentAlResultRepository;

    @Autowired
    private StudentAlSummaryRepository studentAlSummaryRepository;

    @Autowired
    private TermTestMarkRepository termTestMarkRepository;

    @Autowired
    private UnitTestMarkRepository unitTestMarkRepository;

    @Autowired
    private CoCurricularActivityRepository coCurricularActivityRepository;

    @Autowired
    private StaffDetailRepository staffDetailRepository;

    @Autowired
    private IssueSuggestionRepository issueSuggestionRepository;

    @Autowired
    private com.commers.ncp_com_web.repository.NationalStatisticRepository nationalStatisticRepository;

    // Endpoint for adding student counts (Grade 10,11,12,13)
    @PostMapping("/{schoolId}/student-counts")
    @PreAuthorize("hasRole('SECTION_HEAD') or hasRole('PRINCIPAL') or hasRole('TEACHER') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addStudentCount(@PathVariable Long schoolId, @RequestBody StudentCount studentCount) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("Error: School is not found."));
        studentCount.setSchool(school);
        studentCountRepository.save(studentCount);
        return ResponseEntity.ok("Student count added successfully!");
    }

    // Endpoint for adding Teachers
    @PostMapping("/{schoolId}/teachers")
    @PreAuthorize("hasRole('SECTION_HEAD') or hasRole('PRINCIPAL') or hasRole('TEACHER') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addTeacher(@PathVariable Long schoolId, @RequestBody Teacher teacher) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("Error: School is not found."));
        teacher.setSchool(school);
        teacherRepository.save(teacher);
        return ResponseEntity.ok("Teacher added successfully!");
    }

    // Endpoint for A/L National Results
    @PostMapping("/{schoolId}/al-results")
    @PreAuthorize("hasRole('SECTION_HEAD') or hasRole('PRINCIPAL') or hasRole('TEACHER') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addAlResult(@PathVariable Long schoolId, @RequestBody AlNationalResult alResult) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("Error: School is not found."));
        alResult.setSchool(school);
        
        // Calculate pass percentage automatically
        double passPercentage = 0;
        if(alResult.getTotalSat() != null && alResult.getTotalSat() > 0) {
             int passCount = (alResult.getACount() == null ? 0 : alResult.getACount()) +
                             (alResult.getBCount() == null ? 0 : alResult.getBCount()) +
                             (alResult.getCCount() == null ? 0 : alResult.getCCount()) +
                             (alResult.getSCount() == null ? 0 : alResult.getSCount());
             passPercentage = (double) passCount / alResult.getTotalSat() * 100;
        }
        alResult.setPassPercentage(passPercentage);
        
        alNationalResultRepository.save(alResult);
        return ResponseEntity.ok("A/L Result added successfully!");
    }

    @GetMapping("/{schoolId}/student-counts")
    public ResponseEntity<List<StudentCount>> getStudentCounts(@PathVariable Long schoolId) {
        return ResponseEntity.ok(studentCountRepository.findBySchoolId(schoolId));
    }

    private int getLatestNationalResultYear() {
        Integer maxNatYear = alNationalResultRepository.findMaxYear();
        Integer maxStudentNatYear = studentAlResultRepository.findMaxYear();
        Integer maxStatYear = nationalStatisticRepository.findMaxYear();
        int y1 = (maxNatYear != null) ? maxNatYear : 0;
        int y2 = (maxStudentNatYear != null) ? maxStudentNatYear : 0;
        int y3 = (maxStatYear != null) ? maxStatYear : 0;
        return Math.max(y1, Math.max(y2, y3));
    }

    private List<Student> filterActiveStudents(List<Student> students) {
        if (students == null || students.isEmpty()) return Collections.emptyList();
        int latestAlYear = getLatestNationalResultYear();
        if (latestAlYear == 0) {
            return students;
        }

        List<Long> graduatedIdsList = studentAlResultRepository.findStudentIdsWithAlResultsUpToYear(latestAlYear);
        Set<Long> graduatedIds = new HashSet<>(graduatedIdsList != null ? graduatedIdsList : Collections.emptyList());

        return students.stream().filter(s -> {
            if (s.getId() != null && graduatedIds.contains(s.getId())) {
                return false;
            }
            if (s.getAlYear() != null && s.getAlYear() <= latestAlYear) {
                return false;
            }
            return true;
        }).collect(Collectors.toList());
    }

    @GetMapping("/{schoolId}/students")
    public ResponseEntity<?> getStudentsBySchool(@PathVariable Long schoolId) {
        List<Student> allStudents = studentRepository.findBySchoolId(schoolId);
        List<Student> students = filterActiveStudents(allStudents);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Student s : students) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("name", s.getName());
            map.put("indexNumber", s.getIndexNumber());
            map.put("grade", s.getGrade());
            map.put("gender", s.getGender());
            map.put("whatsappNumber", s.getWhatsappNumber());
            map.put("alYear", s.getAlYear());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{schoolId}/student-summary")
    public ResponseEntity<?> getStudentSummary(@PathVariable Long schoolId) {
        List<Student> allStudents = studentRepository.findBySchoolId(schoolId);
        List<Student> students = filterActiveStudents(allStudents);
        long total = students.size();
        long boys = students.stream().filter(s -> "MALE".equalsIgnoreCase(s.getGender()) || "M".equalsIgnoreCase(s.getGender())).count();
        long girls = students.stream().filter(s -> "FEMALE".equalsIgnoreCase(s.getGender()) || "F".equalsIgnoreCase(s.getGender())).count();
        
        List<Integer> distinctYears = students.stream()
                .map(Student::getAlYear)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .sorted(java.util.Comparator.reverseOrder())
                .collect(Collectors.toList());

        Integer y1 = !distinctYears.isEmpty() ? distinctYears.get(0) : null;
        Integer y2 = (distinctYears.size() >= 2) ? distinctYears.get(1) : null;

        long c1 = (y1 != null) ? students.stream().filter(s -> y1.equals(s.getAlYear())).count() : 0;
        long c2 = (y2 != null) ? students.stream().filter(s -> y2.equals(s.getAlYear())).count() : 0;

        long teacherCount = teacherRepository.countBySchoolId(schoolId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalStudents", total);
        summary.put("boys", boys);
        summary.put("girls", girls);
        summary.put("cohort1Year", y1);
        summary.put("cohort1Count", c1);
        summary.put("cohort2Year", y2);
        summary.put("cohort2Count", c2);
        summary.put("grade12", c1);
        summary.put("grade13", c2);
        summary.put("totalTeachers", teacherCount);
        summary.put("activeYear", y1 != null ? y1 : (getLatestNationalResultYear() > 0 ? getLatestNationalResultYear() + 1 : java.time.Year.now().getValue()));

        List<Long> studentIds = students.stream().map(Student::getId).filter(java.util.Objects::nonNull).collect(Collectors.toList());
        Subject acc = subjectRepository.findFirstByNameContainingIgnoreCase("Account").orElse(null);
        Subject bs = subjectRepository.findFirstByNameContainingIgnoreCase("Business Studies").orElse(null);
        Subject eco = subjectRepository.findFirstByNameContainingIgnoreCase("Econom").orElse(null);
        Subject it = subjectRepository.findFirstByNameContainingIgnoreCase("Information").orElse(
                     subjectRepository.findFirstByNameContainingIgnoreCase("Statistics").orElse(null));

        summary.put("accCandidates", countDistinctStudentsForSubject(studentIds, acc));
        summary.put("bsCandidates", countDistinctStudentsForSubject(studentIds, bs));
        summary.put("ecoCandidates", countDistinctStudentsForSubject(studentIds, eco));
        summary.put("itCandidates", countDistinctStudentsForSubject(studentIds, it));

        return ResponseEntity.ok(summary);
    }

    private long countDistinctStudentsForSubject(List<Long> studentIds, Subject subject) {
        if (subject == null || studentIds == null || studentIds.isEmpty()) return 0L;
        Set<Long> set = new HashSet<>();
        try {
            List<Long> tIds = termTestMarkRepository.findDistinctStudentIdsBySubjectId(studentIds, subject.getId());
            if (tIds != null) set.addAll(tIds);
            List<Long> uIds = unitTestMarkRepository.findDistinctStudentIdsBySubjectId(studentIds, subject.getId());
            if (uIds != null) set.addAll(uIds);
            List<Long> aIds = studentAlResultRepository.findDistinctStudentIdsBySubjectId(studentIds, subject.getId());
            if (aIds != null) set.addAll(aIds);
        } catch (Exception ignored) {}
        return set.size();
    }

    @GetMapping("/{schoolId}/results-roster")
    public ResponseEntity<?> getResultsRoster(
            @PathVariable Long schoolId,
            @RequestParam(required = false, defaultValue = "TERM_TEST") String type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false, defaultValue = "1") Integer termOrUnit) {

        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("Error: School not found."));

        List<Student> allStudents = studentRepository.findBySchoolId(schoolId);
        List<Student> students = allStudents;

        if (year != null) {
            students = students.stream().filter(s -> {
                if (s.getAlYear() != null) {
                    return s.getAlYear().equals(year);
                }
                if (year >= 2027 && s.getGrade() != null && s.getGrade() == 12) return true;
                if (year <= 2026 && (s.getGrade() == null || s.getGrade() == 13)) return true;
                return false;
            }).collect(Collectors.toList());
        }

        students.sort((a, b) -> {
            String idxA = a.getIndexNumber() != null ? a.getIndexNumber() : "";
            String idxB = b.getIndexNumber() != null ? b.getIndexNumber() : "";
            try {
                return Long.compare(Long.parseLong(idxA), Long.parseLong(idxB));
            } catch (Exception e) {
                return idxA.compareToIgnoreCase(idxB);
            }
        });

        Subject acc = subjectRepository.findFirstByNameContainingIgnoreCase("Account").orElse(null);
        Subject eco = subjectRepository.findFirstByNameContainingIgnoreCase("Econom").orElse(null);
        Subject bs = subjectRepository.findFirstByNameContainingIgnoreCase("Business Studies").orElse(null);
        Subject it = subjectRepository.findFirstByNameContainingIgnoreCase("Information").orElse(
                     subjectRepository.findFirstByNameContainingIgnoreCase("Statistics").orElse(null));

        List<Map<String, Object>> roster = new ArrayList<>();
        int targetYear = (year != null) ? year : 2027;

        for (Student s : students) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", s.getId());
            row.put("studentId", s.getId());
            row.put("indexNumber", s.getIndexNumber() != null ? s.getIndexNumber() : "");
            row.put("name", s.getName() != null ? s.getName() : "");
            row.put("gender", s.getGender() != null ? s.getGender().toUpperCase() : "MALE");
            row.put("whatsapp", s.getWhatsappNumber() != null ? s.getWhatsappNumber() : "");
            row.put("alYear", s.getAlYear() != null ? s.getAlYear() : targetYear);
            row.put("acc", "");
            row.put("eco", "");
            row.put("bs", "");
            row.put("it", "");
            row.put("zScore", "");
            row.put("districtRank", "");
            row.put("islandRank", "");

            if ("TERM_TEST".equalsIgnoreCase(type)) {
                List<TermTestMark> marks = termTestMarkRepository.findByStudentIdAndYearAndTerm(s.getId(), targetYear, termOrUnit);
                if (marks != null) {
                    for (TermTestMark m : marks) {
                        if (m.getSubject() != null && m.getMarks() != null) {
                            String mVal = (m.getMarks() == Math.floor(m.getMarks())) ? String.valueOf(m.getMarks().intValue()) : String.valueOf(m.getMarks());
                            if (acc != null && m.getSubject().getId().equals(acc.getId())) row.put("acc", mVal);
                            else if (eco != null && m.getSubject().getId().equals(eco.getId())) row.put("eco", mVal);
                            else if (bs != null && m.getSubject().getId().equals(bs.getId())) row.put("bs", mVal);
                            else if (it != null && m.getSubject().getId().equals(it.getId())) row.put("it", mVal);
                        }
                    }
                }
            } else if ("UNIT_TEST".equalsIgnoreCase(type)) {
                List<UnitTestMark> marks = unitTestMarkRepository.findByStudentIdAndYearAndUnitNumber(s.getId(), targetYear, termOrUnit);
                if (marks != null) {
                    for (UnitTestMark m : marks) {
                        if (m.getSubject() != null && m.getMarks() != null) {
                            String mVal = (m.getMarks() == Math.floor(m.getMarks())) ? String.valueOf(m.getMarks().intValue()) : String.valueOf(m.getMarks());
                            if (acc != null && m.getSubject().getId().equals(acc.getId())) row.put("acc", mVal);
                            else if (eco != null && m.getSubject().getId().equals(eco.getId())) row.put("eco", mVal);
                            else if (bs != null && m.getSubject().getId().equals(bs.getId())) row.put("bs", mVal);
                            else if (it != null && m.getSubject().getId().equals(it.getId())) row.put("it", mVal);
                        }
                    }
                }
            } else if ("AL_RESULTS".equalsIgnoreCase(type)) {
                List<StudentAlResult> results = studentAlResultRepository.findByStudentIdAndYear(s.getId(), targetYear);
                if (results != null) {
                    for (StudentAlResult r : results) {
                        if (r.getSubject() != null && r.getGrade() != null) {
                            if (acc != null && r.getSubject().getId().equals(acc.getId())) row.put("acc", r.getGrade());
                            else if (eco != null && r.getSubject().getId().equals(eco.getId())) row.put("eco", r.getGrade());
                            else if (bs != null && r.getSubject().getId().equals(bs.getId())) row.put("bs", r.getGrade());
                            else if (it != null && r.getSubject().getId().equals(it.getId())) row.put("it", r.getGrade());
                        }
                    }
                }
                StudentAlSummary summary = studentAlSummaryRepository.findFirstByStudentIdAndYear(s.getId(), targetYear).orElse(null);
                if (summary != null) {
                    if (summary.getZScore() != null) row.put("zScore", String.valueOf(summary.getZScore()));
                    if (summary.getDistrictRank() != null) row.put("districtRank", String.valueOf(summary.getDistrictRank()));
                    if (summary.getIslandRank() != null) row.put("islandRank", String.valueOf(summary.getIslandRank()));
                }
            }

            roster.add(row);
        }

        return ResponseEntity.ok(roster);
    }

    // Endpoint for Term Test Marks
    @PostMapping("/{schoolId}/term-test-marks")
    @PreAuthorize("hasRole('SECTION_HEAD') or hasRole('PRINCIPAL') or hasRole('TEACHER') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addTermTestMark(@PathVariable Long schoolId, @RequestBody TermTestMark mark) {
        // mark.setStudent() needs to be set properly. Assuming it's passed in the payload for now.
        termTestMarkRepository.save(mark);
        return ResponseEntity.ok("Term Test Mark added successfully!");
    }

    // Endpoint for Unit Test Marks
    @PostMapping("/{schoolId}/unit-test-marks")
    @PreAuthorize("hasRole('SECTION_HEAD') or hasRole('PRINCIPAL') or hasRole('TEACHER') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addUnitTestMark(@PathVariable Long schoolId, @RequestBody UnitTestMark mark) {
        // mark.setStudent() needs to be set properly.
        unitTestMarkRepository.save(mark);
        return ResponseEntity.ok("Unit Test Mark added successfully!");
    }

    // Endpoint for Co-curricular Activities
    @PostMapping("/{schoolId}/activities")
    @PreAuthorize("hasRole('SECTION_HEAD') or hasRole('PRINCIPAL') or hasRole('TEACHER') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addActivity(@PathVariable Long schoolId, @RequestBody CoCurricularActivity activity) {
        // activity.setStudent() needs to be set.
        coCurricularActivityRepository.save(activity);
        return ResponseEntity.ok("Co-curricular Activity added successfully!");
    }

    // Endpoint for Staff Details
    @PostMapping("/{schoolId}/staff")
    @PreAuthorize("hasRole('SECTION_HEAD') or hasRole('PRINCIPAL') or hasRole('TEACHER') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addStaffDetail(@PathVariable Long schoolId, @RequestBody StaffDetail staff) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("Error: School is not found."));
        staff.setSchool(school);
        staffDetailRepository.save(staff);
        return ResponseEntity.ok("Staff Details added successfully!");
    }

    // Endpoint for Issues and Suggestions
    @PostMapping("/{schoolId}/issues")
    @PreAuthorize("hasRole('SECTION_HEAD') or hasRole('PRINCIPAL') or hasRole('TEACHER') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addIssueSuggestion(@PathVariable Long schoolId, @RequestBody IssueSuggestion issue) {
        // issue.setUser() needs to be set.
        issueSuggestionRepository.save(issue);
        return ResponseEntity.ok("Issue/Suggestion added successfully!");
    }
    
    @PostMapping("/{schoolId}/bulk-upload-results")
    @PreAuthorize("hasRole('SECTION_HEAD') or hasRole('PRINCIPAL') or hasRole('TEACHER') or hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> bulkUploadResults(@PathVariable Long schoolId, @RequestBody com.commers.ncp_com_web.payload.request.BulkUploadPayload payload) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("Error: School is not found."));
        
        Subject acc = subjectRepository.findFirstByNameContainingIgnoreCase("Account").orElse(null);
        Subject eco = subjectRepository.findFirstByNameContainingIgnoreCase("Econom").orElse(null);
        Subject bs = subjectRepository.findFirstByNameContainingIgnoreCase("Business Studies").orElse(null);
        Subject it = subjectRepository.findFirstByNameContainingIgnoreCase("Information").orElse(
                     subjectRepository.findFirstByNameContainingIgnoreCase("Statistics").orElse(null));
        
        Set<String> processedIndices = new HashSet<>();
        for (com.commers.ncp_com_web.payload.request.StudentResultRow row : payload.getRows()) {
            boolean hasName = row.getName() != null && !row.getName().trim().isEmpty();
            boolean hasIndex = row.getIndexNumber() != null && !row.getIndexNumber().trim().isEmpty();
            if (!hasName && !hasIndex && row.getAcc() == null && row.getEco() == null && row.getBs() == null && row.getIt() == null) {
                continue;
            }
            if (!hasIndex) {
                return ResponseEntity.badRequest().body("Error: Student Index / Admission Number is mandatory for student: " + (hasName ? row.getName() : "Unnamed"));
            }
            
            String indexNum = row.getIndexNumber().trim();
            if (processedIndices.contains(indexNum)) {
                return ResponseEntity.badRequest().body("Validation Error: Duplicate Index Number '" + indexNum + "' detected in upload payload. Each student in the submission must have a unique index number.");
            }
            processedIndices.add(indexNum);

            String studentName = hasName ? row.getName().trim() : ("Student " + indexNum);
            Integer targetAlYear = payload.getYear();

            // 1. Look up student by strictly unique (schoolId, indexNumber)
            Student student = null;
            if (!indexNum.isEmpty()) {
                student = studentRepository.findBySchoolIdAndIndexNumber(schoolId, indexNum).orElse(null);
            }
            
            if (student != null) {
                // If student is found, ensure the index is not being reused for another batch/year
                if (student.getAlYear() != null && targetAlYear != null && !student.getAlYear().equals(targetAlYear)) {
                    return ResponseEntity.badRequest().body("Validation Error: Index Number '" + indexNum + 
                        "' is already registered to " + student.getName() + " in the " + student.getAlYear() + 
                        " A/L cohort. A student index cannot be reused across different batches or years in this school.");
                }

                // If found student has a established name, ensure someone isn't assigning this index to another student name
                if (hasName && student.getName() != null && !student.getName().startsWith("Student ") 
                        && !student.getName().equalsIgnoreCase(studentName)
                        && !studentName.toLowerCase().contains(student.getName().toLowerCase())
                        && !student.getName().toLowerCase().contains(studentName.toLowerCase())) {
                    return ResponseEntity.badRequest().body("Validation Error: Index Number '" + indexNum + 
                        "' is already assigned to student '" + student.getName() + "'. Duplicate index numbers are not allowed.");
                }

                if (student.getIndexNumber() == null || student.getIndexNumber().isEmpty()) {
                    student.setIndexNumber(indexNum);
                }
                if (hasName && (student.getName() == null || student.getName().startsWith("Student ") || studentName.length() > student.getName().length())) {
                    student.setName(studentName);
                }
                if (student.getAlYear() == null && targetAlYear != null) {
                    student.setAlYear(targetAlYear);
                }
            } else {
                // New student: verify index is truly unused in this school
                if (studentRepository.existsBySchoolIdAndIndexNumber(schoolId, indexNum)) {
                    return ResponseEntity.badRequest().body("Validation Error: Index Number '" + indexNum + "' is already in use by another student in this school.");
                }
                student = new Student();
                student.setName(studentName);
                student.setIndexNumber(indexNum);
                student.setSchool(school);
                student.setGrade(12);
                student.setAlYear(targetAlYear);
            }
            
            // Update gender and whatsapp if provided
            if (row.getGender() != null && !row.getGender().isEmpty()) student.setGender(row.getGender().toUpperCase());
            if (row.getWhatsapp() != null && !row.getWhatsapp().isEmpty()) student.setWhatsappNumber(row.getWhatsapp());
            student = studentRepository.save(student);
            
            // Save marks based on type
            if ("AL_RESULTS".equals(payload.getType())) {
                saveAlResult(student, payload.getYear(), acc, row.getAcc());
                saveAlResult(student, payload.getYear(), eco, row.getEco());
                saveAlResult(student, payload.getYear(), bs, row.getBs());
                saveAlResult(student, payload.getYear(), it, row.getIt());
                
                // Save summary
                StudentAlSummary summary = studentAlSummaryRepository
                    .findFirstByStudentIdAndYear(student.getId(), payload.getYear())
                    .orElse(new StudentAlSummary());
                summary.setStudent(student);
                summary.setYear(payload.getYear());
                try { if (row.getZScore() != null && !row.getZScore().isEmpty()) summary.setZScore(Double.parseDouble(row.getZScore())); } catch (Exception e) {}
                try { if (row.getDistrictRank() != null && !row.getDistrictRank().isEmpty()) summary.setDistrictRank(Integer.parseInt(row.getDistrictRank())); } catch (Exception e) {}
                try { if (row.getIslandRank() != null && !row.getIslandRank().isEmpty()) summary.setIslandRank(Integer.parseInt(row.getIslandRank())); } catch (Exception e) {}
                studentAlSummaryRepository.save(summary);
            } else if ("TERM_TEST".equals(payload.getType())) {
                saveTermResult(student, payload.getYear(), payload.getTermOrUnit(), acc, row.getAcc());
                saveTermResult(student, payload.getYear(), payload.getTermOrUnit(), eco, row.getEco());
                saveTermResult(student, payload.getYear(), payload.getTermOrUnit(), bs, row.getBs());
                saveTermResult(student, payload.getYear(), payload.getTermOrUnit(), it, row.getIt());
            } else if ("UNIT_TEST".equals(payload.getType())) {
                saveUnitResult(student, payload.getYear(), payload.getTermOrUnit(), acc, row.getAcc());
                saveUnitResult(student, payload.getYear(), payload.getTermOrUnit(), eco, row.getEco());
                saveUnitResult(student, payload.getYear(), payload.getTermOrUnit(), bs, row.getBs());
                saveUnitResult(student, payload.getYear(), payload.getTermOrUnit(), it, row.getIt());
            }
        }
        
        // Also update school-level AlNationalResult aggregates so public results explorer updates immediately
        if ("AL_RESULTS".equals(payload.getType()) && payload.getRows() != null) {
            updateAlNationalSubjectStats(school, payload.getYear(), acc, payload.getRows(), com.commers.ncp_com_web.payload.request.StudentResultRow::getAcc);
            updateAlNationalSubjectStats(school, payload.getYear(), eco, payload.getRows(), com.commers.ncp_com_web.payload.request.StudentResultRow::getEco);
            updateAlNationalSubjectStats(school, payload.getYear(), bs, payload.getRows(), com.commers.ncp_com_web.payload.request.StudentResultRow::getBs);
            updateAlNationalSubjectStats(school, payload.getYear(), it, payload.getRows(), com.commers.ncp_com_web.payload.request.StudentResultRow::getIt);
        }
        
        // Auto-sync school student demographic counts directly from student records
        syncStudentCountsForSchool(school);
        
        return ResponseEntity.ok("Bulk upload processed successfully!");
    }

    private void syncStudentCountsForSchool(School school) {
        try {
            List<Student> allStudents = studentRepository.findBySchoolId(school.getId());
            List<Student> students = filterActiveStudents(allStudents);
            
            long m12 = students.stream().filter(s -> ((s.getAlYear() != null && s.getAlYear() >= 2027) || (s.getAlYear() == null && s.getGrade() != null && s.getGrade() == 12)) && ("MALE".equalsIgnoreCase(s.getGender()) || "M".equalsIgnoreCase(s.getGender()))).count();
            long f12 = students.stream().filter(s -> ((s.getAlYear() != null && s.getAlYear() >= 2027) || (s.getAlYear() == null && s.getGrade() != null && s.getGrade() == 12)) && ("FEMALE".equalsIgnoreCase(s.getGender()) || "F".equalsIgnoreCase(s.getGender()))).count();
            long m13 = students.stream().filter(s -> ((s.getAlYear() != null && s.getAlYear() <= 2026) || (s.getAlYear() == null && (s.getGrade() == null || s.getGrade() == 13))) && ("MALE".equalsIgnoreCase(s.getGender()) || "M".equalsIgnoreCase(s.getGender()))).count();
            long f13 = students.stream().filter(s -> ((s.getAlYear() != null && s.getAlYear() <= 2026) || (s.getAlYear() == null && (s.getGrade() == null || s.getGrade() == 13))) && ("FEMALE".equalsIgnoreCase(s.getGender()) || "F".equalsIgnoreCase(s.getGender()))).count();

            List<StudentCount> existing = studentCountRepository.findBySchoolId(school.getId());
            updateOrCreateCount(existing, school, 12, "MALE", (int) m12);
            updateOrCreateCount(existing, school, 12, "FEMALE", (int) f12);
            updateOrCreateCount(existing, school, 13, "MALE", (int) m13);
            updateOrCreateCount(existing, school, 13, "FEMALE", (int) f13);
        } catch (Exception ignored) {}
    }

    private void updateOrCreateCount(List<StudentCount> existing, School school, Integer grade, String gender, int count) {
        StudentCount sc = existing.stream().filter(c -> grade.equals(c.getGrade()) && gender.equalsIgnoreCase(c.getGender())).findFirst().orElse(null);
        if (sc == null) {
            sc = new StudentCount();
            sc.setSchool(school);
            sc.setGrade(grade);
            sc.setGender(gender);
        }
        sc.setCount(count);
        studentCountRepository.save(sc);
    }

    private void updateAlNationalSubjectStats(School school, Integer year, Subject subject, java.util.List<com.commers.ncp_com_web.payload.request.StudentResultRow> rows, java.util.function.Function<com.commers.ncp_com_web.payload.request.StudentResultRow, String> gradeExtractor) {
        if (subject == null || year == null) return;
        int a = 0, b = 0, c = 0, s = 0, f = 0, total = 0;
        for (com.commers.ncp_com_web.payload.request.StudentResultRow row : rows) {
            String g = gradeExtractor.apply(row);
            if (g == null || g.trim().isEmpty()) continue;
            g = g.trim().toUpperCase();
            total++;
            if (g.equals("A")) a++;
            else if (g.equals("B")) b++;
            else if (g.equals("C")) c++;
            else if (g.equals("S")) s++;
            else f++;
        }
        if (total == 0) return;
        
        AlNationalResult natResult = alNationalResultRepository
                .findBySchoolIdAndSubjectIdAndYear(school.getId(), subject.getId(), year)
                .orElse(new AlNationalResult());
        
        natResult.setSchool(school);
        natResult.setSubject(subject);
        natResult.setYear(year);
        natResult.setTotalSat(total);
        natResult.setACount(a);
        natResult.setBCount(b);
        natResult.setCCount(c);
        natResult.setSCount(s);
        natResult.setFCount(f);
        double passPct = (double) (a + b + c + s) / total * 100.0;
        natResult.setPassPercentage(Math.round(passPct * 10.0) / 10.0);
        alNationalResultRepository.save(natResult);
    }
    
    private void saveAlResult(Student student, Integer year, Subject subject, String grade) {
        if (subject == null || grade == null || grade.trim().isEmpty()) return;
        StudentAlResult res = studentAlResultRepository
                .findByStudentIdAndYearAndSubjectId(student.getId(), year, subject.getId())
                .orElse(new StudentAlResult());
        res.setStudent(student);
        res.setYear(year);
        res.setSubject(subject);
        res.setGrade(grade.trim().toUpperCase());
        studentAlResultRepository.save(res);
    }
    
    private void saveTermResult(Student student, Integer year, Integer term, Subject subject, String markStr) {
        if (subject == null || markStr == null || markStr.trim().isEmpty()) return;
        try {
            double marks = Double.parseDouble(markStr.trim());
            TermTestMark res = termTestMarkRepository
                    .findByStudentIdAndYearAndTermAndSubjectId(student.getId(), year, term, subject.getId())
                    .orElse(new TermTestMark());
            res.setStudent(student);
            res.setYear(year);
            res.setTerm(term);
            res.setSubject(subject);
            res.setMarks(marks);
            termTestMarkRepository.save(res);
        } catch (NumberFormatException e) { }
    }
    
    private void saveUnitResult(Student student, Integer year, Integer unit, Subject subject, String markStr) {
        if (subject == null || markStr == null || markStr.trim().isEmpty()) return;
        try {
            double marks = Double.parseDouble(markStr.trim());
            UnitTestMark res = unitTestMarkRepository
                    .findByStudentIdAndYearAndUnitNumberAndSubjectId(student.getId(), year, unit, subject.getId())
                    .orElse(new UnitTestMark());
            res.setStudent(student);
            res.setYear(year);
            res.setUnitNumber(unit);
            res.setSubject(subject);
            res.setMarks(marks);
            unitTestMarkRepository.save(res);
        } catch (NumberFormatException e) { }
    }
}
