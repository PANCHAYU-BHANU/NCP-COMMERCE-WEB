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
        int y1 = (maxNatYear != null) ? maxNatYear : 0;
        int y2 = (maxStudentNatYear != null) ? maxStudentNatYear : 0;
        return Math.max(y1, y2);
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
        long gr12 = students.stream().filter(s -> s.getGrade() != null && s.getGrade() == 12).count();
        long gr13 = students.stream().filter(s -> s.getGrade() == null || s.getGrade() == 13).count();
        
        long teacherCount = teacherRepository.countBySchoolId(schoolId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalStudents", total);
        summary.put("boys", boys);
        summary.put("girls", girls);
        summary.put("grade12", gr12);
        summary.put("grade13", gr13);
        summary.put("totalTeachers", teacherCount);
        summary.put("activeYear", (getLatestNationalResultYear() > 0 ? getLatestNationalResultYear() + 1 : java.time.Year.now().getValue()));
        return ResponseEntity.ok(summary);
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
            String studentName = hasName ? row.getName().trim() : ("Student " + indexNum);
            
            // 1. First priority: look up student by (schoolId, indexNumber)
            Student student = null;
            if (indexNum != null && !indexNum.isEmpty()) {
                student = studentRepository.findBySchoolIdAndIndexNumber(schoolId, indexNum).orElse(null);
            }
            
            // 2. Fallback: look up by (name, schoolId)
            if (student == null && hasName) {
                student = studentRepository.findByNameAndSchoolId(studentName, schoolId).orElse(null);
            }
            
            // 3. Create new student if still not found
            if (student == null) {
                student = new Student();
                student.setName(studentName);
                student.setIndexNumber(indexNum);
                student.setSchool(school);
                student.setGrade(13); // Defaulting to 13 for AL
            } else {
                // If existing student had no index number recorded, attach it now
                if (indexNum != null && !indexNum.isEmpty() && (student.getIndexNumber() == null || student.getIndexNumber().isEmpty())) {
                    student.setIndexNumber(indexNum);
                }
                // If fuller name is provided, update student name
                if (hasName && (student.getName() == null || student.getName().startsWith("Student ") || studentName.length() > student.getName().length())) {
                    student.setName(studentName);
                }
            }
            
            // Update gender and whatsapp if provided
            if (row.getGender() != null && !row.getGender().isEmpty()) student.setGender(row.getGender().toUpperCase());
            if (row.getWhatsapp() != null && !row.getWhatsapp().isEmpty()) student.setWhatsappNumber(row.getWhatsapp());
            if (payload.getYear() != null) student.setAlYear(payload.getYear());
            student = studentRepository.save(student);
            
            // Save marks based on type
            if ("AL_RESULTS".equals(payload.getType())) {
                saveAlResult(student, payload.getYear(), acc, row.getAcc());
                saveAlResult(student, payload.getYear(), eco, row.getEco());
                saveAlResult(student, payload.getYear(), bs, row.getBs());
                saveAlResult(student, payload.getYear(), it, row.getIt());
                
                // Save summary
                StudentAlSummary summary = new StudentAlSummary();
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
            if (students.isEmpty()) return;
            
            long m12 = students.stream().filter(s -> (s.getGrade() != null && s.getGrade() == 12) && ("MALE".equalsIgnoreCase(s.getGender()) || "M".equalsIgnoreCase(s.getGender()))).count();
            long f12 = students.stream().filter(s -> (s.getGrade() != null && s.getGrade() == 12) && ("FEMALE".equalsIgnoreCase(s.getGender()) || "F".equalsIgnoreCase(s.getGender()))).count();
            long m13 = students.stream().filter(s -> (s.getGrade() == null || s.getGrade() == 13) && ("MALE".equalsIgnoreCase(s.getGender()) || "M".equalsIgnoreCase(s.getGender()))).count();
            long f13 = students.stream().filter(s -> (s.getGrade() == null || s.getGrade() == 13) && ("FEMALE".equalsIgnoreCase(s.getGender()) || "F".equalsIgnoreCase(s.getGender()))).count();

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
        StudentAlResult res = new StudentAlResult();
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
            TermTestMark res = new TermTestMark();
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
            UnitTestMark res = new UnitTestMark();
            res.setStudent(student);
            res.setYear(year);
            res.setUnitNumber(unit);
            res.setSubject(subject);
            res.setMarks(marks);
            unitTestMarkRepository.save(res);
        } catch (NumberFormatException e) { }
    }
}
