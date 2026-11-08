package com.commers.ncp_com_web.controller;

import com.commers.ncp_com_web.entity.*;
import com.commers.ncp_com_web.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private ProvinceRepository provinceRepository;
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
    private AlNationalResultRepository alNationalResultRepository;
    @Autowired
    private StudentCountRepository studentCountRepository;
    @Autowired
    private EducationalResourceRepository educationalResourceRepository;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private CommitteeRepository committeeRepository;
    @Autowired
    private CommitteeMemberRepository committeeMemberRepository;
    @Autowired
    private MediaGalleryRepository mediaGalleryRepository;
    @Autowired
    private NationalStatisticRepository nationalStatisticRepository;
    @Autowired
    private NewsRepository newsRepository;
    @Autowired
    private StaffDetailRepository staffDetailRepository;
    @Autowired
    private TeacherRepository teacherRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private TermTestMarkRepository termTestMarkRepository;
    @Autowired
    private UnitTestMarkRepository unitTestMarkRepository;
    @Autowired
    private StudentAlSummaryRepository studentAlSummaryRepository;
    @Autowired
    private StudentAlResultRepository studentAlResultRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private com.commers.ncp_com_web.repository.UnitTestDefinitionRepository unitTestDefinitionRepository;

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
        if (students == null || students.isEmpty()) return java.util.Collections.emptyList();
        int latestAlYear = getLatestNationalResultYear();
        if (latestAlYear == 0) {
            // No national AL examination results added yet; all enrolled students are active
            return students;
        }

        // Students who sat for AL exams up to latestAlYear have graduated
        List<Long> graduatedIdsList = studentAlResultRepository.findStudentIdsWithAlResultsUpToYear(latestAlYear);
        java.util.Set<Long> graduatedIds = new java.util.HashSet<>(graduatedIdsList != null ? graduatedIdsList : java.util.Collections.emptyList());

        return students.stream().filter(s -> {
            if (s.getId() != null && graduatedIds.contains(s.getId())) {
                return false; // Sat for AL and graduated
            }
            if (s.getAlYear() != null && s.getAlYear() <= latestAlYear) {
                return false; // Associated with a completed AL batch
            }
            return true; // Active studying student
        }).collect(java.util.stream.Collectors.toList());
    }

    private int getActiveAcademicYear() {
        Integer maxStudentYear = studentRepository.findMaxAlYear();
        Integer maxTermYear = termTestMarkRepository.findMaxYear();
        int candidateYear = 0;
        if (maxStudentYear != null && maxStudentYear > candidateYear) {
            candidateYear = maxStudentYear;
        }
        if (maxTermYear != null && maxTermYear > candidateYear) {
            candidateYear = maxTermYear;
        }
        if (candidateYear > 0) {
            return candidateYear;
        }
        int latestAlYear = getLatestNationalResultYear();
        int currentCalYear = java.time.Year.now().getValue();
        return (latestAlYear > 0) ? (latestAlYear + 1) : currentCalYear;
    }

    private Map<String, Object> calculateLatestTwoCohorts(List<Student> students) {
        Map<String, Object> map = new HashMap<>();
        
        List<Integer> distinctYears = (students != null) ? students.stream()
                .map(Student::getAlYear)
                .filter(Objects::nonNull)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList()) : Collections.emptyList();

        int defaultActive = getActiveAcademicYear();
        int y1 = !distinctYears.isEmpty() ? distinctYears.get(0) : defaultActive;
        int y2 = (distinctYears.size() >= 2) ? distinctYears.get(1) : (y1 - 1);

        long c1 = (students != null) ? students.stream().filter(s -> Integer.valueOf(y1).equals(s.getAlYear())).count() : 0;
        long c2 = (students != null) ? students.stream().filter(s -> Integer.valueOf(y2).equals(s.getAlYear())).count() : 0;

        map.put("cohort1Year", y1);
        map.put("cohort1Count", c1);
        map.put("cohort2Year", y2);
        map.put("cohort2Count", c2);
        map.put("grade12Students", c1);
        map.put("grade13Students", c2);
        return map;
    }

    private Map<String, Long> calculateSubjectCandidateCounts(List<Student> students) {
        Map<String, Long> map = new HashMap<>();
        map.put("accCandidates", 0L);
        map.put("bsCandidates", 0L);
        map.put("ecoCandidates", 0L);
        map.put("itCandidates", 0L);

        if (students == null || students.isEmpty()) {
            return map;
        }

        List<Long> studentIds = students.stream().map(Student::getId).filter(Objects::nonNull).collect(Collectors.toList());
        if (studentIds.isEmpty()) {
            return map;
        }

        Subject acc = subjectRepository.findFirstByNameContainingIgnoreCase("Account").orElse(null);
        Subject bs = subjectRepository.findFirstByNameContainingIgnoreCase("Business Studies").orElse(null);
        Subject eco = subjectRepository.findFirstByNameContainingIgnoreCase("Econom").orElse(null);
        Subject it = subjectRepository.findFirstByNameContainingIgnoreCase("Information").orElse(
                     subjectRepository.findFirstByNameContainingIgnoreCase("Statistics").orElse(null));

        map.put("accCandidates", countDistinctStudentsForSubject(studentIds, acc));
        map.put("bsCandidates", countDistinctStudentsForSubject(studentIds, bs));
        map.put("ecoCandidates", countDistinctStudentsForSubject(studentIds, eco));
        map.put("itCandidates", countDistinctStudentsForSubject(studentIds, it));

        return map;
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

    @GetMapping("/statistics/overview")
    public ResponseEntity<?> getProvincialOverview() {
        long schoolCount = schoolRepository.count();
        List<Student> allStudents = studentRepository.findAll();
        List<Student> activeStudents = filterActiveStudents(allStudents);
        long studentCount = activeStudents.size();

        long teacherUserCount = userRepository.findAll().stream()
                .filter(u -> u.getRole() == ERole.ROLE_TEACHER || u.getRole() == ERole.ROLE_SECTION_HEAD || Boolean.TRUE.equals(u.getIsSectionHead()))
                .count();
        long teacherEntityCount = teacherRepository.count();
        long teacherCount = Math.max(teacherUserCount, teacherEntityCount);

        long boys = activeStudents.stream().filter(s -> "MALE".equalsIgnoreCase(s.getGender())).count();
        long girls = activeStudents.stream().filter(s -> "FEMALE".equalsIgnoreCase(s.getGender())).count();
        long g12 = activeStudents.stream().filter(s -> s.getGrade() != null && s.getGrade() == 12).count();
        long g13 = activeStudents.stream().filter(s -> s.getGrade() != null && s.getGrade() == 13).count();

        double passRate = 0.0;
        List<AlNationalResult> results = alNationalResultRepository.findAll();
        if (!results.isEmpty()) {
            long totalSat = 0;
            long totalPass = 0;
            for (AlNationalResult r : results) {
                int a = r.getACount() != null ? r.getACount() : 0;
                int b = r.getBCount() != null ? r.getBCount() : 0;
                int c = r.getCCount() != null ? r.getCCount() : 0;
                int s = r.getSCount() != null ? r.getSCount() : 0;
                int f = r.getFCount() != null ? r.getFCount() : 0;
                totalSat += (a + b + c + s + f);
                totalPass += (a + b + c + s);
            }
            if (totalSat > 0) {
                passRate = Math.round(((double) totalPass / totalSat * 100.0) * 10.0) / 10.0;
            }
        }

        java.util.Map<String, Object> prov = new java.util.HashMap<>();
        prov.put("schools", schoolCount);
        prov.put("students", studentCount);
        prov.put("teachers", teacherCount);
        prov.put("boys", boys);
        prov.put("girls", girls);
        prov.put("grade12Students", g12);
        prov.put("grade13Students", g13);
        prov.put("passRateCurrent", passRate);
        prov.put("passRatePrev1", passRate);
        prov.put("zones", zoneRepository.count());
        prov.put("divisions", divisionRepository.count());
        prov.putAll(calculateLatestTwoCohorts(activeStudents));
        prov.putAll(calculateSubjectCandidateCounts(activeStudents));

        Optional<User> pd = userRepository.findFirstByRole(ERole.ROLE_PROVINCIAL_DIRECTOR);
        String pdName = pd.map(u -> (u.getName() != null && !u.getName().trim().isEmpty() && !u.getName().equals(u.getUsername())) ? u.getName() : u.getUsername()).orElse(null);
        prov.put("provincialDirectorName", pdName);

        // National Statistics
        int currentYear = java.time.Year.now().getValue();
        NationalStatistic currentNatStat = nationalStatisticRepository.findByYear(currentYear).orElse(null);
        NationalStatistic prev1NatStat = nationalStatisticRepository.findByYear(currentYear - 1).orElse(null);
        NationalStatistic prev2NatStat = nationalStatisticRepository.findByYear(currentYear - 2).orElse(null);

        java.util.Map<String, Object> national = new java.util.HashMap<>();
        national.put("schools", currentNatStat != null && currentNatStat.getTotalSchools() != null ? currentNatStat.getTotalSchools() : 0);
        national.put("teachers", currentNatStat != null && currentNatStat.getTotalTeachers() != null ? currentNatStat.getTotalTeachers() : 0);
        national.put("students", currentNatStat != null && currentNatStat.getTotalStudents() != null ? currentNatStat.getTotalStudents() : 0);
        national.put("passRateCurrent", currentNatStat != null && currentNatStat.getPassRate() != null ? Math.round(currentNatStat.getPassRate()) : 0);
        national.put("passRatePrev1", prev1NatStat != null && prev1NatStat.getPassRate() != null ? Math.round(prev1NatStat.getPassRate()) : 0);
        national.put("passRatePrev2", prev2NatStat != null && prev2NatStat.getPassRate() != null ? Math.round(prev2NatStat.getPassRate()) : 0);
        national.put("currentYear", currentYear);

        // District Breakdown for HomePage
        long anuSchools = schoolRepository.countByDivisionZoneDistrictId(1L);
        long polSchools = schoolRepository.countByDivisionZoneDistrictId(2L);
        java.util.Map<String, Object> distMap = new java.util.HashMap<>();
        java.util.Map<String, Object> anuMap = new java.util.HashMap<>();
        anuMap.put("schools", anuSchools);
        java.util.Map<String, Object> polMap = new java.util.HashMap<>();
        polMap.put("schools", polSchools);
        distMap.put("anuradhapura", anuMap);
        distMap.put("polonnaruwa", polMap);

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("provincial", prov);
        resp.put("national", national);
        resp.put("districts", distMap);
        resp.put("activeYear", getActiveAcademicYear());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/statistics/zone/{id}")
    public ResponseEntity<?> getZoneStatistics(@PathVariable Long id) {
        Zone zone = zoneRepository.findById(id).orElse(null);
        if (zone == null) {
            return ResponseEntity.notFound().build();
        }

        List<School> schoolsInZone = schoolRepository.findAll().stream()
                .filter(sc -> sc.getDivision() != null && sc.getDivision().getZone() != null && id.equals(sc.getDivision().getZone().getId()))
                .collect(java.util.stream.Collectors.toList());

        java.util.Set<Long> schoolIds = schoolsInZone.stream().map(School::getId).collect(java.util.stream.Collectors.toSet());

        List<Student> allStudentsInZone = studentRepository.findAll().stream()
                .filter(st -> st.getSchool() != null && schoolIds.contains(st.getSchool().getId()))
                .collect(java.util.stream.Collectors.toList());
        List<Student> studentsInZone = filterActiveStudents(allStudentsInZone);

        long teacherCount = userRepository.findAll().stream()
                .filter(u -> (u.getRole() == ERole.ROLE_TEACHER || u.getRole() == ERole.ROLE_SECTION_HEAD || Boolean.TRUE.equals(u.getIsSectionHead())) && (
                    (u.getZone() != null && id.equals(u.getZone().getId())) ||
                    (u.getSchool() != null && schoolIds.contains(u.getSchool().getId()))
                )).count();

        long boys = studentsInZone.stream().filter(s -> "MALE".equalsIgnoreCase(s.getGender())).count();
        long girls = studentsInZone.stream().filter(s -> "FEMALE".equalsIgnoreCase(s.getGender())).count();
        long g12 = studentsInZone.stream().filter(s -> s.getGrade() != null && s.getGrade() == 12).count();
        long g13 = studentsInZone.stream().filter(s -> s.getGrade() != null && s.getGrade() == 13).count();

        double passRate = 0.0;
        List<AlNationalResult> results = alNationalResultRepository.findBySchoolDivisionZoneId(id);
        if (results != null && !results.isEmpty()) {
            long totalSat = 0;
            long totalPass = 0;
            for (AlNationalResult r : results) {
                int a = r.getACount() != null ? r.getACount() : 0;
                int b = r.getBCount() != null ? r.getBCount() : 0;
                int c = r.getCCount() != null ? r.getCCount() : 0;
                int s = r.getSCount() != null ? r.getSCount() : 0;
                int f = r.getFCount() != null ? r.getFCount() : 0;
                totalSat += (a + b + c + s + f);
                totalPass += (a + b + c + s);
            }
            if (totalSat > 0) {
                passRate = Math.round(((double) totalPass / totalSat * 100.0) * 10.0) / 10.0;
            }
        }

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("zoneId", id);
        resp.put("zoneName", zone.getName());
        resp.put("schools", schoolsInZone.size());
        resp.put("students", studentsInZone.size());
        resp.put("teachers", teacherCount);
        resp.put("boys", boys);
        resp.put("girls", girls);
        resp.put("grade12Students", g12);
        resp.put("grade13Students", g13);
        resp.put("passRateCurrent", passRate);
        resp.put("activeYear", getActiveAcademicYear());
        resp.putAll(calculateLatestTwoCohorts(studentsInZone));
        resp.putAll(calculateSubjectCandidateCounts(studentsInZone));

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/statistics/school/{id}")
    public ResponseEntity<?> getSchoolStatistics(@PathVariable Long id) {
        School school = schoolRepository.findById(id).orElse(null);
        if (school == null) {
            return ResponseEntity.notFound().build();
        }

        List<Student> allStudents = studentRepository.findBySchoolId(id);
        List<Student> students = filterActiveStudents(allStudents);
        long teacherCount = userRepository.findAll().stream()
                .filter(u -> (u.getRole() == ERole.ROLE_TEACHER || u.getRole() == ERole.ROLE_SECTION_HEAD || Boolean.TRUE.equals(u.getIsSectionHead())) && u.getSchool() != null && id.equals(u.getSchool().getId()))
                .count();
        if (teacherCount == 0) {
            teacherCount = teacherRepository.findBySchoolId(id).size();
        }

        long boys = students.stream().filter(s -> "MALE".equalsIgnoreCase(s.getGender())).count();
        long girls = students.stream().filter(s -> "FEMALE".equalsIgnoreCase(s.getGender())).count();
        long g12 = students.stream().filter(s -> s.getGrade() != null && s.getGrade() == 12).count();
        long g13 = students.stream().filter(s -> s.getGrade() != null && s.getGrade() == 13).count();

        double passRate = 0.0;
        List<AlNationalResult> results = alNationalResultRepository.findBySchoolId(id);
        if (results != null && !results.isEmpty()) {
            long totalSat = 0;
            long totalPass = 0;
            for (AlNationalResult r : results) {
                int a = r.getACount() != null ? r.getACount() : 0;
                int b = r.getBCount() != null ? r.getBCount() : 0;
                int c = r.getCCount() != null ? r.getCCount() : 0;
                int s = r.getSCount() != null ? r.getSCount() : 0;
                int f = r.getFCount() != null ? r.getFCount() : 0;
                totalSat += (a + b + c + s + f);
                totalPass += (a + b + c + s);
            }
            if (totalSat > 0) {
                passRate = Math.round(((double) totalPass / totalSat * 100.0) * 10.0) / 10.0;
            }
        }

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("schoolId", id);
        resp.put("schoolName", school.getName());
        resp.put("schools", 1);
        resp.put("students", students.size());
        resp.put("teachers", teacherCount);
        resp.put("boys", boys);
        resp.put("girls", girls);
        resp.put("grade12Students", g12);
        resp.put("grade13Students", g13);
        resp.put("passRateCurrent", passRate);
        resp.put("activeYear", getActiveAcademicYear());
        resp.putAll(calculateLatestTwoCohorts(students));
        resp.putAll(calculateSubjectCandidateCounts(students));

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/statistics/division/{id}")
    public ResponseEntity<?> getDivisionStatistics(@PathVariable Long id) {
        Division division = divisionRepository.findById(id).orElse(null);
        if (division == null) {
            return ResponseEntity.notFound().build();
        }

        List<School> schoolsInDiv = schoolRepository.findByDivisionId(id);
        java.util.Set<Long> schoolIds = schoolsInDiv.stream().map(School::getId).collect(java.util.stream.Collectors.toSet());

        List<Student> allStudentsInDiv = studentRepository.findAll().stream()
                .filter(st -> st.getSchool() != null && schoolIds.contains(st.getSchool().getId()))
                .collect(java.util.stream.Collectors.toList());
        List<Student> studentsInDiv = filterActiveStudents(allStudentsInDiv);

        long teacherCount = userRepository.findAll().stream()
                .filter(u -> (u.getRole() == ERole.ROLE_TEACHER || u.getRole() == ERole.ROLE_SECTION_HEAD || Boolean.TRUE.equals(u.getIsSectionHead())) && (
                    (u.getDivision() != null && id.equals(u.getDivision().getId())) ||
                    (u.getSchool() != null && schoolIds.contains(u.getSchool().getId()))
                )).count();

        long boys = studentsInDiv.stream().filter(s -> "MALE".equalsIgnoreCase(s.getGender())).count();
        long girls = studentsInDiv.stream().filter(s -> "FEMALE".equalsIgnoreCase(s.getGender())).count();
        long g12 = studentsInDiv.stream().filter(s -> s.getGrade() != null && s.getGrade() == 12).count();
        long g13 = studentsInDiv.stream().filter(s -> s.getGrade() != null && s.getGrade() == 13).count();

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("divisionId", id);
        resp.put("divisionName", division.getName());
        resp.put("schools", schoolsInDiv.size());
        resp.put("students", studentsInDiv.size());
        resp.put("teachers", teacherCount);
        resp.put("boys", boys);
        resp.put("girls", girls);
        resp.put("grade12Students", g12);
        resp.put("grade13Students", g13);
        resp.put("activeYear", getActiveAcademicYear());
        resp.putAll(calculateLatestTwoCohorts(studentsInDiv));
        resp.putAll(calculateSubjectCandidateCounts(studentsInDiv));

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/statistics/district/{id}")
    public ResponseEntity<?> getDistrictStatistics(@PathVariable Long id) {
        District district = districtRepository.findById(id).orElse(null);
        if (district == null) {
            return ResponseEntity.notFound().build();
        }

        List<Zone> zones = zoneRepository.findByDistrictId(id);
        long zoneCount = zones.size();

        List<School> schoolsInDistrict = schoolRepository.findAll().stream()
                .filter(sc -> sc.getDivision() != null && sc.getDivision().getZone() != null && sc.getDivision().getZone().getDistrict() != null && id.equals(sc.getDivision().getZone().getDistrict().getId()))
                .collect(java.util.stream.Collectors.toList());

        long schoolCount = schoolsInDistrict.size();

        List<Division> divisionsInDistrict = divisionRepository.findAll().stream()
                .filter(div -> div.getZone() != null && div.getZone().getDistrict() != null && id.equals(div.getZone().getDistrict().getId()))
                .collect(java.util.stream.Collectors.toList());
        long divisionCount = divisionsInDistrict.size();

        java.util.Set<Long> schoolIds = schoolsInDistrict.stream().map(School::getId).collect(java.util.stream.Collectors.toSet());

        List<Student> allStudentsInDistrict = studentRepository.findAll().stream()
                .filter(st -> st.getSchool() != null && schoolIds.contains(st.getSchool().getId()))
                .collect(java.util.stream.Collectors.toList());
        List<Student> studentsInDistrict = filterActiveStudents(allStudentsInDistrict);
        long studentCount = studentsInDistrict.size();

        long teacherCount = userRepository.findAll().stream()
                .filter(u -> (u.getRole() == ERole.ROLE_TEACHER || u.getRole() == ERole.ROLE_SECTION_HEAD || Boolean.TRUE.equals(u.getIsSectionHead())) && (
                    (u.getDistrict() != null && id.equals(u.getDistrict().getId())) ||
                    (u.getSchool() != null && schoolIds.contains(u.getSchool().getId()))
                )).count();

        double passRate = 0.0;
        List<AlNationalResult> results = alNationalResultRepository.findBySchoolDivisionZoneDistrictId(id);
        if (results != null && !results.isEmpty()) {
            long totalSat = 0;
            long totalPass = 0;
            for (AlNationalResult r : results) {
                int a = r.getACount() != null ? r.getACount() : 0;
                int b = r.getBCount() != null ? r.getBCount() : 0;
                int c = r.getCCount() != null ? r.getCCount() : 0;
                int s = r.getSCount() != null ? r.getSCount() : 0;
                totalSat += (a + b + c + s + (r.getFCount() != null ? r.getFCount() : 0));
                totalPass += (a + b + c + s);
            }
            if (totalSat > 0) {
                passRate = Math.round(((double) totalPass / totalSat * 100.0) * 10.0) / 10.0;
            }
        }

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("districtId", id);
        resp.put("districtName", district.getName());
        resp.put("zones", zoneCount);
        resp.put("divisions", divisionCount);
        resp.put("schools", schoolCount);
        resp.put("teachers", teacherCount);
        resp.put("students", studentCount);
        resp.put("passRateCurrent", passRate);
        resp.put("passRatePrev1", passRate);
        resp.put("passRatePrev2", passRate);
        resp.put("activeYear", getActiveAcademicYear());

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/statistics/yearly-comparison")
    public ResponseEntity<?> getYearlyComparison(
            @RequestParam(required = false, defaultValue = "provincial") String level,
            @RequestParam(required = false) Long id,
            @RequestParam(required = false, defaultValue = "5") int limit) {

        // 1. Determine the latest distinct years present in the database dynamically
        java.util.Set<Integer> availableYears = new java.util.TreeSet<>();
        List<Integer> dbAlYears = alNationalResultRepository.findDistinctYears();
        if (dbAlYears != null) availableYears.addAll(dbAlYears);
        List<Integer> dbStudentAlYears = studentAlResultRepository.findDistinctYears();
        if (dbStudentAlYears != null) availableYears.addAll(dbStudentAlYears);

        java.util.List<Integer> yearList;
        if (!availableYears.isEmpty()) {
            yearList = availableYears.stream()
                    .filter(java.util.Objects::nonNull)
                    .sorted(java.util.Comparator.reverseOrder())
                    .limit(limit)
                    .sorted()
                    .collect(java.util.stream.Collectors.toList());
        } else {
            yearList = new java.util.ArrayList<>();
        }

        int topYear = !yearList.isEmpty() ? yearList.get(yearList.size() - 1) : 0;

        // 2. Fetch all AlNationalResult records matching the scoped hierarchy
        List<AlNationalResult> allResults;
        if ("school".equalsIgnoreCase(level) && id != null) {
            allResults = alNationalResultRepository.findBySchoolId(id);
        } else if ("division".equalsIgnoreCase(level) && id != null) {
            allResults = alNationalResultRepository.findBySchoolDivisionId(id);
        } else if ("zone".equalsIgnoreCase(level) && id != null) {
            allResults = alNationalResultRepository.findBySchoolDivisionZoneId(id);
        } else if ("district".equalsIgnoreCase(level) && id != null) {
            allResults = alNationalResultRepository.findBySchoolDivisionZoneDistrictId(id);
        } else {
            allResults = alNationalResultRepository.findAll();
        }

        java.util.List<java.util.Map<String, Object>> dataPoints = new java.util.ArrayList<>();

        for (Integer yr : yearList) {
            List<AlNationalResult> yrRecords = allResults.stream()
                    .filter(r -> yr.equals(r.getYear()))
                    .collect(java.util.stream.Collectors.toList());

            long totalSat = 0;
            long totalPass = 0;

            java.util.Map<String, long[]> subCounts = new java.util.HashMap<>();
            subCounts.put("Accounting", new long[]{0, 0});
            subCounts.put("Business", new long[]{0, 0});
            subCounts.put("Economics", new long[]{0, 0});
            subCounts.put("ICT", new long[]{0, 0});

            for (AlNationalResult r : yrRecords) {
                int a = r.getACount() != null ? r.getACount() : 0;
                int b = r.getBCount() != null ? r.getBCount() : 0;
                int c = r.getCCount() != null ? r.getCCount() : 0;
                int s = r.getSCount() != null ? r.getSCount() : 0;
                int f = r.getFCount() != null ? r.getFCount() : 0;

                int sat = a + b + c + s + f;
                int pass = a + b + c + s;
                totalSat += sat;
                totalPass += pass;

                if (r.getSubject() != null && r.getSubject().getName() != null) {
                    String subName = r.getSubject().getName().toLowerCase();
                    String key = null;
                    if (subName.contains("account")) key = "Accounting";
                    else if (subName.contains("business")) key = "Business";
                    else if (subName.contains("econom")) key = "Economics";
                    else if (subName.contains("ict") || subName.contains("information") || subName.contains("technology")) key = "ICT";

                    if (key != null) {
                        subCounts.get(key)[0] += sat;
                        subCounts.get(key)[1] += pass;
                    }
                }
            }

            double yrPassRate = totalSat > 0 ? (Math.round((double) totalPass / totalSat * 1000.0) / 10.0) : 0.0;

            java.util.Map<String, Object> point = new java.util.HashMap<>();
            point.put("year", yr);
            point.put("yearLabel", yr + " A/L");
            point.put("totalSat", totalSat);
            point.put("totalPass", totalPass);
            point.put("passRate", yrPassRate);

            for (java.util.Map.Entry<String, long[]> entry : subCounts.entrySet()) {
                long sat = entry.getValue()[0];
                long pass = entry.getValue()[1];
                double subRate = sat > 0 ? (Math.round((double) pass / sat * 1000.0) / 10.0) : 0.0;
                point.put(entry.getKey(), subRate);
            }

            dataPoints.add(point);
        }

        java.util.Map<String, Object> yearlyResp = new java.util.HashMap<>();
        yearlyResp.put("level", level);
        yearlyResp.put("id", id);
        yearlyResp.put("years", yearList);
        yearlyResp.put("latestYear", topYear);
        yearlyResp.put("data", dataPoints);

        return ResponseEntity.ok(yearlyResp);
    }

    @GetMapping("/unit-definitions")
    public ResponseEntity<List<com.commers.ncp_com_web.entity.UnitTestDefinition>> getUnitDefinitions() {
        List<com.commers.ncp_com_web.entity.UnitTestDefinition> list = unitTestDefinitionRepository.findAllByOrderByUnitNumberAsc();
        if (list.isEmpty()) {
            String[] defaultNames = {
                "Unit 1: Business Environment & Economic Foundations",
                "Unit 2: Accounting Equation & Prime Entry Books",
                "Unit 3: Preparation of Financial Statements",
                "Unit 4: Microeconomics & Market Equilibrium",
                "Unit 5: Macroeconomic Indicators & Fiscal Policy",
                "Unit 6: Business Forms & Organizational Structures",
                "Unit 7: Cost & Management Accounting Fundamentals",
                "Unit 8: Money, Banking & Financial Institutions",
                "Unit 9: International Trade & Exchange Rates",
                "Unit 10: Decision Making & Business Information Systems"
            };
            for (int i = 1; i <= defaultNames.length; i++) {
                com.commers.ncp_com_web.entity.UnitTestDefinition def = new com.commers.ncp_com_web.entity.UnitTestDefinition(i, defaultNames[i - 1], "Official Provincial Commerce Syllabus Unit " + i);
                unitTestDefinitionRepository.save(def);
            }
            list = unitTestDefinitionRepository.findAllByOrderByUnitNumberAsc();
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping("/unit-definitions")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> saveUnitDefinition(@RequestBody com.commers.ncp_com_web.entity.UnitTestDefinition definition) {
        if (definition.getUnitNumber() == null || definition.getUnitName() == null || definition.getUnitName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Unit number and unit name are mandatory.");
        }
        com.commers.ncp_com_web.entity.UnitTestDefinition existing = unitTestDefinitionRepository.findByUnitNumber(definition.getUnitNumber())
                .orElse(new com.commers.ncp_com_web.entity.UnitTestDefinition());
        existing.setUnitNumber(definition.getUnitNumber());
        existing.setUnitName(definition.getUnitName().trim());
        existing.setDescription(definition.getDescription());
        unitTestDefinitionRepository.save(existing);
        return ResponseEntity.ok(existing);
    }

    @PostMapping("/national-statistics")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('PRINCIPAL') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> saveNationalStatistics(@RequestBody NationalStatistic stat) {
        NationalStatistic existing = nationalStatisticRepository.findByYear(stat.getYear()).orElse(new NationalStatistic());
        existing.setYear(stat.getYear());
        existing.setTotalSchools(stat.getTotalSchools());
        existing.setTotalStudents(stat.getTotalStudents());
        existing.setTotalTeachers(stat.getTotalTeachers());
        existing.setPassRate(stat.getPassRate());
        nationalStatisticRepository.save(existing);
        return ResponseEntity.ok(new com.commers.ncp_com_web.payload.response.MessageResponse("National Statistics saved successfully!"));
    }

    @DeleteMapping("/national-statistics/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PROVINCIAL_DIRECTOR') or hasRole('ZONAL_DIRECTOR') or hasRole('DIVISIONAL_DIRECTOR') or hasRole('PRINCIPAL') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteNationalStatistics(@PathVariable Long id) {
        if (nationalStatisticRepository.existsById(id)) {
            nationalStatisticRepository.deleteById(id);
            return ResponseEntity.ok(new com.commers.ncp_com_web.payload.response.MessageResponse("Benchmark record deleted successfully!"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/national-statistics")
    public ResponseEntity<List<NationalStatistic>> getNationalStatistics() {
        List<NationalStatistic> stats = nationalStatisticRepository.findAll();
        stats.sort(java.util.Comparator.comparing(NationalStatistic::getYear));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/provinces")
    public ResponseEntity<List<Province>> getAllProvinces() {
        return ResponseEntity.ok(provinceRepository.findAll());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<District>> getDistricts(@RequestParam(required = false) Long provinceId) {
        if (provinceId != null) {
            return ResponseEntity.ok(districtRepository.findByProvinceId(provinceId));
        }
        return ResponseEntity.ok(districtRepository.findAll());
    }

    @GetMapping("/zones")
    public ResponseEntity<?> getZones(@RequestParam(required = false) Long districtId) {
        List<Zone> zones = (districtId != null) ? zoneRepository.findByDistrictId(districtId) : zoneRepository.findAll();
        List<School> allSchools = schoolRepository.findAll();
        List<Student> allStudents = filterActiveStudents(studentRepository.findAll());
        List<User> allTeachers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == ERole.ROLE_TEACHER || u.getRole() == ERole.ROLE_SECTION_HEAD || Boolean.TRUE.equals(u.getIsSectionHead()))
                .collect(java.util.stream.Collectors.toList());

        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (Zone z : zones) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", z.getId());
            map.put("name", z.getName());
            map.put("district", z.getDistrict());
            map.put("schoolsCount", schoolRepository.countByDivisionZoneId(z.getId()));
            map.put("divisionsCount", divisionRepository.countByZoneId(z.getId()));
            Optional<User> zd = userRepository.findFirstByRoleAndZoneId(ERole.ROLE_ZONAL_DIRECTOR, z.getId());
            String zdName = zd.map(u -> (u.getName() != null && !u.getName().trim().isEmpty() && !u.getName().equals(u.getUsername())) ? u.getName() : u.getUsername()).orElse(null);
            map.put("directorName", zdName);

            java.util.Set<Long> zSchoolIds = allSchools.stream()
                    .filter(sc -> sc.getDivision() != null && sc.getDivision().getZone() != null && z.getId().equals(sc.getDivision().getZone().getId()))
                    .map(School::getId)
                    .collect(java.util.stream.Collectors.toSet());

            long teacherCount = allTeachers.stream()
                    .filter(u -> (u.getZone() != null && z.getId().equals(u.getZone().getId())) ||
                                 (u.getSchool() != null && zSchoolIds.contains(u.getSchool().getId())))
                    .count();
            map.put("teachersCount", teacherCount);

            long studentCount = allStudents.stream()
                    .filter(st -> st.getSchool() != null && zSchoolIds.contains(st.getSchool().getId()))
                    .count();
            map.put("students", studentCount);
            map.put("studentsCount", studentCount);

            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/divisions")
    public ResponseEntity<?> getDivisions(@RequestParam(required = false) Long zoneId) {
        List<Division> divisions = (zoneId != null) ? divisionRepository.findByZoneId(zoneId) : divisionRepository.findAll();
        List<School> allSchools = schoolRepository.findAll();
        List<Student> allStudents = filterActiveStudents(studentRepository.findAll());
        List<User> allTeachers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == ERole.ROLE_TEACHER || u.getRole() == ERole.ROLE_SECTION_HEAD || Boolean.TRUE.equals(u.getIsSectionHead()))
                .collect(java.util.stream.Collectors.toList());

        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (Division d : divisions) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", d.getId());
            map.put("name", d.getName());
            map.put("zone", d.getZone());
            map.put("schoolsCount", schoolRepository.countByDivisionId(d.getId()));
            Optional<User> dd = userRepository.findFirstByRoleAndDivisionId(ERole.ROLE_DIVISIONAL_DIRECTOR, d.getId());
            String ddName = dd.map(u -> (u.getName() != null && !u.getName().trim().isEmpty() && !u.getName().equals(u.getUsername())) ? u.getName() : u.getUsername()).orElse(null);
            map.put("directorName", ddName);

            java.util.Set<Long> dSchoolIds = allSchools.stream()
                    .filter(sc -> sc.getDivision() != null && d.getId().equals(sc.getDivision().getId()))
                    .map(School::getId)
                    .collect(java.util.stream.Collectors.toSet());

            long teacherCount = allTeachers.stream()
                    .filter(u -> (u.getDivision() != null && d.getId().equals(u.getDivision().getId())) ||
                                 (u.getSchool() != null && dSchoolIds.contains(u.getSchool().getId())))
                    .count();
            map.put("teachersCount", teacherCount);

            long studentCount = allStudents.stream()
                    .filter(st -> st.getSchool() != null && dSchoolIds.contains(st.getSchool().getId()))
                    .count();
            map.put("students", studentCount);
            map.put("studentsCount", studentCount);

            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/schools")
    public ResponseEntity<?> getSchools(@RequestParam(required = false) Long divisionId,
                                        @RequestParam(required = false) Long zoneId) {
        List<School> schools;
        if (divisionId != null) {
            schools = schoolRepository.findByDivisionId(divisionId);
        } else if (zoneId != null) {
            schools = schoolRepository.findAll().stream()
                    .filter(s -> s.getDivision() != null && s.getDivision().getZone() != null && zoneId.equals(s.getDivision().getZone().getId()))
                    .collect(java.util.stream.Collectors.toList());
        } else {
            schools = schoolRepository.findAll();
        }

        List<User> allTeachers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == ERole.ROLE_TEACHER || u.getRole() == ERole.ROLE_SECTION_HEAD || Boolean.TRUE.equals(u.getIsSectionHead()))
                .collect(java.util.stream.Collectors.toList());

        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (School s : schools) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", s.getId());
            map.put("name", s.getName());
            map.put("address", s.getAddress());
            map.put("division", s.getDivision());
            map.put("type", "1AB National / Provincial");

            // 1. Principal lookup from Users
            List<User> principals = userRepository.findByRoleAndSchoolId(ERole.ROLE_PRINCIPAL, s.getId());
            String principalName = null;
            if (!principals.isEmpty()) {
                User p = principals.get(0);
                principalName = (p.getName() != null && !p.getName().trim().isEmpty() && !p.getName().equals(p.getUsername())) ? p.getName() : p.getUsername();
            }
            if (principalName == null) {
                StaffDetail staffPrin = staffDetailRepository.findBySchoolId(s.getId()).stream()
                        .filter(st -> "PRINCIPAL".equalsIgnoreCase(st.getDesignation()))
                        .findFirst().orElse(null);
                if (staffPrin != null) principalName = staffPrin.getName();
            }
            map.put("principal", principalName);

            // 2. Section Head lookup from Users
            List<User> heads = userRepository.findSectionHeadsBySchoolId(s.getId());
            String headName = null;
            if (!heads.isEmpty()) {
                User h = heads.get(0);
                headName = (h.getName() != null && !h.getName().trim().isEmpty() && !h.getName().equals(h.getUsername())) ? h.getName() : h.getUsername();
            }
            if (headName == null) {
                StaffDetail staffHead = staffDetailRepository.findBySchoolId(s.getId()).stream()
                        .filter(st -> "SECTION_HEAD".equalsIgnoreCase(st.getDesignation()) || "COMMERCE_HEAD".equalsIgnoreCase(st.getDesignation()))
                        .findFirst().orElse(null);
                if (staffHead != null) headName = staffHead.getName();
            }
            map.put("sectionHead", headName);

            // 3. Teachers count
            long teacherCount = allTeachers.stream()
                    .filter(u -> u.getSchool() != null && s.getId().equals(u.getSchool().getId()))
                    .count();
            map.put("teachersCount", teacherCount);

            // 4. Active Students count
            List<Student> schoolStudents = studentRepository.findBySchoolId(s.getId());
            long activeCount = filterActiveStudents(schoolStudents).size();
            map.put("students", activeCount);
            map.put("activeStudents", activeCount);

            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getSubjects(@RequestParam(required = false) String type) {
        if (subjectRepository.count() == 0) {
            List<Subject> defaultSubjects = List.of(
                new Subject(null, "Accounting", "AL", "All"),
                new Subject(null, "Business Studies", "AL", "All"),
                new Subject(null, "Economics", "AL", "All"),
                new Subject(null, "Information & Communication Technology (ICT)", "AL", "All"),
                new Subject(null, "Business Statistics", "AL", "All"),
                new Subject(null, "Entrepreneurship Studies", "AL", "All"),
                new Subject(null, "Commerce & Accounting", "OL", "All"),
                new Subject(null, "Business & Accounting Studies", "OL", "All"),
                new Subject(null, "Entrepreneurship Studies (O/L)", "OL", "All")
            );
            subjectRepository.saveAll(defaultSubjects);
        }
        if (type != null) {
            return ResponseEntity.ok(subjectRepository.findByType(type.toUpperCase()));
        }
        return ResponseEntity.ok(subjectRepository.findAll());
    }

    @GetMapping("/al-results")
    public ResponseEntity<List<AlNationalResult>> getAlResults(
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) Long divisionId,
            @RequestParam(required = false) Long schoolId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Integer year) {

        // For simplicity, we just filter by the most specific geographic ID provided.
        // In a real application, we might use Specifications for complex dynamic queries.
        if (schoolId != null) {
            return ResponseEntity.ok(alNationalResultRepository.findBySchoolId(schoolId));
        } else if (divisionId != null) {
            return ResponseEntity.ok(alNationalResultRepository.findBySchoolDivisionId(divisionId));
        } else if (zoneId != null) {
            return ResponseEntity.ok(alNationalResultRepository.findBySchoolDivisionZoneId(zoneId));
        } else if (districtId != null) {
            if (subjectId != null && year != null) {
                return ResponseEntity.ok(alNationalResultRepository.findBySchoolDivisionZoneDistrictIdAndSubjectIdAndYear(districtId, subjectId, year));
            } else if (subjectId != null) {
                return ResponseEntity.ok(alNationalResultRepository.findBySchoolDivisionZoneDistrictIdAndSubjectId(districtId, subjectId));
            } else if (year != null) {
                return ResponseEntity.ok(alNationalResultRepository.findBySchoolDivisionZoneDistrictIdAndYear(districtId, year));
            } else {
                return ResponseEntity.ok(alNationalResultRepository.findBySchoolDivisionZoneDistrictId(districtId));
            }
        } else if (subjectId != null && year != null) {
             return ResponseEntity.ok(alNationalResultRepository.findBySubjectIdAndYear(subjectId, year));
        } else if (subjectId != null) {
             return ResponseEntity.ok(alNationalResultRepository.findBySubjectId(subjectId));
        } else if (year != null) {
             return ResponseEntity.ok(alNationalResultRepository.findByYear(year));
        }
        
        return ResponseEntity.ok(alNationalResultRepository.findAll());
    }

    @GetMapping("/al-results/years")
    public ResponseEntity<List<Integer>> getAlResultYears() {
        List<Integer> years = alNationalResultRepository.findDistinctYears();
        return ResponseEntity.ok(years != null ? years : java.util.Collections.emptyList());
    }

    @GetMapping("/evaluation-years")
    public ResponseEntity<List<Integer>> getEvaluationYears(@RequestParam(required = false, defaultValue = "al") String evalType) {
        java.util.Set<Integer> years = new java.util.TreeSet<>(java.util.Collections.reverseOrder());
        if ("term".equalsIgnoreCase(evalType)) {
            List<Integer> termYears = termTestMarkRepository.findDistinctYears();
            if (termYears != null) years.addAll(termYears);
        } else if ("unit".equalsIgnoreCase(evalType)) {
            List<Integer> unitYears = unitTestMarkRepository.findDistinctYears();
            if (unitYears != null) years.addAll(unitYears);
        } else {
            List<Integer> alYears = alNationalResultRepository.findDistinctYears();
            if (alYears != null) years.addAll(alYears);
            List<Integer> sAlYears = studentAlResultRepository.findDistinctYears();
            if (sAlYears != null) years.addAll(sAlYears);
        }
        return ResponseEntity.ok(new java.util.ArrayList<>(years));
    }

    @GetMapping("/evaluation-results")
    public ResponseEntity<?> getEvaluationResults(
            @RequestParam(required = false, defaultValue = "al") String evalType,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer termOrUnit,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) Long divisionId,
            @RequestParam(required = false) Long schoolId,
            @RequestParam(required = false) Long subjectId) {

        List<java.util.Map<String, Object>> resultList = new java.util.ArrayList<>();

        if ("term".equalsIgnoreCase(evalType)) {
            List<TermTestMark> marks = termTestMarkRepository.findAll();
            java.util.Map<String, java.util.Map<String, Object>> grouped = new java.util.HashMap<>();

            for (TermTestMark m : marks) {
                if (m.getStudent() == null || m.getSubject() == null) continue;
                if (year != null && !year.equals(m.getYear())) continue;
                if (termOrUnit != null && !termOrUnit.equals(m.getTerm())) continue;
                if (subjectId != null && !subjectId.equals(m.getSubject().getId())) continue;

                School s = m.getStudent().getSchool();
                if (s == null) continue;
                if (schoolId != null && !schoolId.equals(s.getId())) continue;
                if (divisionId != null && (s.getDivision() == null || !divisionId.equals(s.getDivision().getId()))) continue;
                if (zoneId != null && (s.getDivision() == null || s.getDivision().getZone() == null || !zoneId.equals(s.getDivision().getZone().getId()))) continue;
                if (districtId != null && (s.getDivision() == null || s.getDivision().getZone() == null || s.getDivision().getZone().getDistrict() == null || !districtId.equals(s.getDivision().getZone().getDistrict().getId()))) continue;

                String key = s.getId() + "_" + m.getSubject().getId() + "_" + m.getYear() + "_" + m.getTerm();
                java.util.Map<String, Object> row = grouped.computeIfAbsent(key, k -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("school", s);
                    map.put("subject", m.getSubject());
                    map.put("year", m.getYear());
                    map.put("termOrUnit", m.getTerm());
                    map.put("aCount", 0);
                    map.put("bCount", 0);
                    map.put("cCount", 0);
                    map.put("sCount", 0);
                    map.put("fCount", 0);
                    map.put("totalSat", 0);
                    map.put("maleA", 0);
                    map.put("maleB", 0);
                    map.put("maleC", 0);
                    map.put("maleS", 0);
                    map.put("maleF", 0);
                    map.put("maleTotal", 0);
                    map.put("femaleA", 0);
                    map.put("femaleB", 0);
                    map.put("femaleC", 0);
                    map.put("femaleS", 0);
                    map.put("femaleF", 0);
                    map.put("femaleTotal", 0);
                    return map;
                });

                Double score = m.getMarks();
                String grade = (score == null) ? "F" : (score >= 75 ? "A" : (score >= 65 ? "B" : (score >= 55 ? "C" : (score >= 35 ? "S" : "F"))));
                boolean isFemale = m.getStudent().getGender() != null && ("FEMALE".equalsIgnoreCase(m.getStudent().getGender()) || "F".equalsIgnoreCase(m.getStudent().getGender()));

                row.put("totalSat", (int) row.get("totalSat") + 1);
                if (isFemale) {
                    row.put("femaleTotal", (int) row.get("femaleTotal") + 1);
                } else {
                    row.put("maleTotal", (int) row.get("maleTotal") + 1);
                }

                if ("A".equals(grade)) {
                    row.put("aCount", (int) row.get("aCount") + 1);
                    if (isFemale) row.put("femaleA", (int) row.get("femaleA") + 1); else row.put("maleA", (int) row.get("maleA") + 1);
                } else if ("B".equals(grade)) {
                    row.put("bCount", (int) row.get("bCount") + 1);
                    if (isFemale) row.put("femaleB", (int) row.get("femaleB") + 1); else row.put("maleB", (int) row.get("maleB") + 1);
                } else if ("C".equals(grade)) {
                    row.put("cCount", (int) row.get("cCount") + 1);
                    if (isFemale) row.put("femaleC", (int) row.get("femaleC") + 1); else row.put("maleC", (int) row.get("maleC") + 1);
                } else if ("S".equals(grade)) {
                    row.put("sCount", (int) row.get("sCount") + 1);
                    if (isFemale) row.put("femaleS", (int) row.get("femaleS") + 1); else row.put("maleS", (int) row.get("maleS") + 1);
                } else {
                    row.put("fCount", (int) row.get("fCount") + 1);
                    if (isFemale) row.put("femaleF", (int) row.get("femaleF") + 1); else row.put("maleF", (int) row.get("maleF") + 1);
                }
            }
            resultList.addAll(grouped.values());

        } else if ("unit".equalsIgnoreCase(evalType)) {
            List<UnitTestMark> marks = unitTestMarkRepository.findAll();
            java.util.Map<String, java.util.Map<String, Object>> grouped = new java.util.HashMap<>();

            for (UnitTestMark m : marks) {
                if (m.getStudent() == null || m.getSubject() == null) continue;
                if (year != null && !year.equals(m.getYear())) continue;
                if (termOrUnit != null && !termOrUnit.equals(m.getUnitNumber())) continue;
                if (subjectId != null && !subjectId.equals(m.getSubject().getId())) continue;

                School s = m.getStudent().getSchool();
                if (s == null) continue;
                if (schoolId != null && !schoolId.equals(s.getId())) continue;
                if (divisionId != null && (s.getDivision() == null || !divisionId.equals(s.getDivision().getId()))) continue;
                if (zoneId != null && (s.getDivision() == null || s.getDivision().getZone() == null || !zoneId.equals(s.getDivision().getZone().getId()))) continue;
                if (districtId != null && (s.getDivision() == null || s.getDivision().getZone() == null || s.getDivision().getZone().getDistrict() == null || !districtId.equals(s.getDivision().getZone().getDistrict().getId()))) continue;

                String key = s.getId() + "_" + m.getSubject().getId() + "_" + m.getYear() + "_" + m.getUnitNumber();
                java.util.Map<String, Object> row = grouped.computeIfAbsent(key, k -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("school", s);
                    map.put("subject", m.getSubject());
                    map.put("year", m.getYear());
                    map.put("termOrUnit", m.getUnitNumber());
                    map.put("aCount", 0);
                    map.put("bCount", 0);
                    map.put("cCount", 0);
                    map.put("sCount", 0);
                    map.put("fCount", 0);
                    map.put("totalSat", 0);
                    map.put("maleA", 0);
                    map.put("maleB", 0);
                    map.put("maleC", 0);
                    map.put("maleS", 0);
                    map.put("maleF", 0);
                    map.put("maleTotal", 0);
                    map.put("femaleA", 0);
                    map.put("femaleB", 0);
                    map.put("femaleC", 0);
                    map.put("femaleS", 0);
                    map.put("femaleF", 0);
                    map.put("femaleTotal", 0);
                    return map;
                });

                Double score = m.getMarks();
                String grade = (score == null) ? "F" : (score >= 75 ? "A" : (score >= 65 ? "B" : (score >= 55 ? "C" : (score >= 35 ? "S" : "F"))));
                boolean isFemale = m.getStudent().getGender() != null && ("FEMALE".equalsIgnoreCase(m.getStudent().getGender()) || "F".equalsIgnoreCase(m.getStudent().getGender()));

                row.put("totalSat", (int) row.get("totalSat") + 1);
                if (isFemale) {
                    row.put("femaleTotal", (int) row.get("femaleTotal") + 1);
                } else {
                    row.put("maleTotal", (int) row.get("maleTotal") + 1);
                }

                if ("A".equals(grade)) {
                    row.put("aCount", (int) row.get("aCount") + 1);
                    if (isFemale) row.put("femaleA", (int) row.get("femaleA") + 1); else row.put("maleA", (int) row.get("maleA") + 1);
                } else if ("B".equals(grade)) {
                    row.put("bCount", (int) row.get("bCount") + 1);
                    if (isFemale) row.put("femaleB", (int) row.get("femaleB") + 1); else row.put("maleB", (int) row.get("maleB") + 1);
                } else if ("C".equals(grade)) {
                    row.put("cCount", (int) row.get("cCount") + 1);
                    if (isFemale) row.put("femaleC", (int) row.get("femaleC") + 1); else row.put("maleC", (int) row.get("maleC") + 1);
                } else if ("S".equals(grade)) {
                    row.put("sCount", (int) row.get("sCount") + 1);
                    if (isFemale) row.put("femaleS", (int) row.get("femaleS") + 1); else row.put("maleS", (int) row.get("maleS") + 1);
                } else {
                    row.put("fCount", (int) row.get("fCount") + 1);
                    if (isFemale) row.put("femaleF", (int) row.get("femaleF") + 1); else row.put("maleF", (int) row.get("maleF") + 1);
                }
            }
            resultList.addAll(grouped.values());

        } else {
            // AL evaluation: first check individual StudentAlResult
            List<StudentAlResult> sResults = studentAlResultRepository.findAll();
            if (!sResults.isEmpty()) {
                java.util.Map<String, java.util.Map<String, Object>> grouped = new java.util.HashMap<>();
                for (StudentAlResult m : sResults) {
                    if (m.getStudent() == null || m.getSubject() == null) continue;
                    if (year != null && !year.equals(m.getYear())) continue;
                    if (subjectId != null && !subjectId.equals(m.getSubject().getId())) continue;

                    School s = m.getStudent().getSchool();
                    if (s == null) continue;
                    if (schoolId != null && !schoolId.equals(s.getId())) continue;
                    if (divisionId != null && (s.getDivision() == null || !divisionId.equals(s.getDivision().getId()))) continue;
                    if (zoneId != null && (s.getDivision() == null || s.getDivision().getZone() == null || !zoneId.equals(s.getDivision().getZone().getId()))) continue;
                    if (districtId != null && (s.getDivision() == null || s.getDivision().getZone() == null || s.getDivision().getZone().getDistrict() == null || !districtId.equals(s.getDivision().getZone().getDistrict().getId()))) continue;

                    String key = s.getId() + "_" + m.getSubject().getId() + "_" + m.getYear();
                    java.util.Map<String, Object> row = grouped.computeIfAbsent(key, k -> {
                        java.util.Map<String, Object> map = new java.util.HashMap<>();
                        map.put("school", s);
                        map.put("subject", m.getSubject());
                        map.put("year", m.getYear());
                        map.put("aCount", 0);
                        map.put("bCount", 0);
                        map.put("cCount", 0);
                        map.put("sCount", 0);
                        map.put("fCount", 0);
                        map.put("totalSat", 0);
                        map.put("maleA", 0);
                        map.put("maleB", 0);
                        map.put("maleC", 0);
                        map.put("maleS", 0);
                        map.put("maleF", 0);
                        map.put("maleTotal", 0);
                        map.put("femaleA", 0);
                        map.put("femaleB", 0);
                        map.put("femaleC", 0);
                        map.put("femaleS", 0);
                        map.put("femaleF", 0);
                        map.put("femaleTotal", 0);
                        return map;
                    });

                    String grade = (m.getGrade() != null) ? m.getGrade().toUpperCase().trim() : "F";
                    boolean isFemale = m.getStudent().getGender() != null && ("FEMALE".equalsIgnoreCase(m.getStudent().getGender()) || "F".equalsIgnoreCase(m.getStudent().getGender()));

                    row.put("totalSat", (int) row.get("totalSat") + 1);
                    if (isFemale) row.put("femaleTotal", (int) row.get("femaleTotal") + 1); else row.put("maleTotal", (int) row.get("maleTotal") + 1);

                    if ("A".equals(grade)) {
                        row.put("aCount", (int) row.get("aCount") + 1);
                        if (isFemale) row.put("femaleA", (int) row.get("femaleA") + 1); else row.put("maleA", (int) row.get("maleA") + 1);
                    } else if ("B".equals(grade)) {
                        row.put("bCount", (int) row.get("bCount") + 1);
                        if (isFemale) row.put("femaleB", (int) row.get("femaleB") + 1); else row.put("maleB", (int) row.get("maleB") + 1);
                    } else if ("C".equals(grade)) {
                        row.put("cCount", (int) row.get("cCount") + 1);
                        if (isFemale) row.put("femaleC", (int) row.get("femaleC") + 1); else row.put("maleC", (int) row.get("maleC") + 1);
                    } else if ("S".equals(grade)) {
                        row.put("sCount", (int) row.get("sCount") + 1);
                        if (isFemale) row.put("femaleS", (int) row.get("femaleS") + 1); else row.put("maleS", (int) row.get("maleS") + 1);
                    } else {
                        row.put("fCount", (int) row.get("fCount") + 1);
                        if (isFemale) row.put("femaleF", (int) row.get("femaleF") + 1); else row.put("maleF", (int) row.get("maleF") + 1);
                    }
                }
                resultList.addAll(grouped.values());
            }

            // Also include alNationalResultRepository records
            List<AlNationalResult> alRecords = alNationalResultRepository.findAll();
            for (AlNationalResult r : alRecords) {
                if (r.getSchool() == null || r.getSubject() == null) continue;
                if (year != null && !year.equals(r.getYear())) continue;
                if (subjectId != null && !subjectId.equals(r.getSubject().getId())) continue;

                School s = r.getSchool();
                if (schoolId != null && !schoolId.equals(s.getId())) continue;
                if (divisionId != null && (s.getDivision() == null || !divisionId.equals(s.getDivision().getId()))) continue;
                if (zoneId != null && (s.getDivision() == null || s.getDivision().getZone() == null || !zoneId.equals(s.getDivision().getZone().getId()))) continue;
                if (districtId != null && (s.getDivision() == null || s.getDivision().getZone() == null || s.getDivision().getZone().getDistrict() == null || !districtId.equals(s.getDivision().getZone().getDistrict().getId()))) continue;

                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("school", s);
                map.put("subject", r.getSubject());
                map.put("year", r.getYear());
                int a = r.getACount() != null ? r.getACount() : 0;
                int b = r.getBCount() != null ? r.getBCount() : 0;
                int c = r.getCCount() != null ? r.getCCount() : 0;
                int sa = r.getSCount() != null ? r.getSCount() : 0;
                int f = r.getFCount() != null ? r.getFCount() : 0;
                int sat = a + b + c + sa + f;
                map.put("aCount", a);
                map.put("bCount", b);
                map.put("cCount", c);
                map.put("sCount", sa);
                map.put("fCount", f);
                map.put("totalSat", sat);
                resultList.add(map);
            }
        }

        return ResponseEntity.ok(resultList);
    }

    @GetMapping("/student-counts")
    public ResponseEntity<List<StudentCount>> getStudentCounts(
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) Long divisionId,
            @RequestParam(required = false) Long schoolId) {

        if (schoolId != null) {
            return ResponseEntity.ok(studentCountRepository.findBySchoolId(schoolId));
        } else if (divisionId != null) {
            return ResponseEntity.ok(studentCountRepository.findBySchoolDivisionId(divisionId));
        } else if (zoneId != null) {
            return ResponseEntity.ok(studentCountRepository.findBySchoolDivisionZoneId(zoneId));
        } else if (districtId != null) {
            return ResponseEntity.ok(studentCountRepository.findBySchoolDivisionZoneDistrictId(districtId));
        }
        
        return ResponseEntity.ok(studentCountRepository.findAll());
    }

    @GetMapping("/resources")
    public ResponseEntity<List<EducationalResource>> getResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Long subjectId) {
        
        List<EducationalResource> list = educationalResourceRepository.findPublicResources();

        if (type != null && !type.trim().isEmpty() && !type.equalsIgnoreCase("ALL")) {
            list = list.stream().filter(r -> type.equalsIgnoreCase(r.getResourceType())).collect(java.util.stream.Collectors.toList());
        }
        if (level != null && !level.trim().isEmpty() && !level.equalsIgnoreCase("ALL")) {
            list = list.stream().filter(r -> level.equalsIgnoreCase(r.getExamLevel())).collect(java.util.stream.Collectors.toList());
        }
        if (subjectId != null) {
            list = list.stream().filter(r -> r.getSubject() != null && r.getSubject().getId().equals(subjectId)).collect(java.util.stream.Collectors.toList());
        }
        
        return ResponseEntity.ok(list);
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEvents(@RequestParam(required = false) Boolean upcoming) {
        if (Boolean.TRUE.equals(upcoming)) {
            return ResponseEntity.ok(eventRepository.findByEventDateAfterOrderByEventDateAsc(LocalDateTime.now()));
        }
        return ResponseEntity.ok(eventRepository.findAllByOrderByEventDateDesc());
    }

    @GetMapping("/committees")
    public ResponseEntity<List<Committee>> getCommittees(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long zoneId) {
        
        if ("ZONAL".equalsIgnoreCase(type) && zoneId != null) {
            return ResponseEntity.ok(committeeRepository.findByTypeAndZoneId(type, zoneId));
        } else if (type != null) {
            return ResponseEntity.ok(committeeRepository.findByType(type));
        }
        
        return ResponseEntity.ok(committeeRepository.findAll());
    }

    @GetMapping("/committees/{id}/members")
    public ResponseEntity<List<CommitteeMember>> getCommitteeMembers(@PathVariable Long id) {
        return ResponseEntity.ok(committeeMemberRepository.findByCommitteeId(id));
    }

    @GetMapping("/media")
    public ResponseEntity<List<MediaGallery>> getAllMedia(@RequestParam(required = false) String type) {
        if (type != null) {
            // we could filter by type if repository supported it, just returning all for now
        }
        return ResponseEntity.ok(mediaGalleryRepository.findAll());
    }

    @GetMapping("/news")
    public ResponseEntity<List<News>> getAllNews() {
        return ResponseEntity.ok(newsRepository.findAll());
    }

    @GetMapping("/schools/{id}")
    public ResponseEntity<?> getSchoolProfile(@PathVariable Long id) {
        School school = schoolRepository.findById(id).orElse(null);
        if (school == null) {
            return ResponseEntity.notFound().build();
        }
        
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("school", school);
        
        List<StaffDetail> staff = staffDetailRepository.findBySchoolId(id);
        StaffDetail principal = staff.stream().filter(s -> "PRINCIPAL".equalsIgnoreCase(s.getDesignation())).findFirst().orElse(null);
        StaffDetail sectionHead = staff.stream().filter(s -> "SECTION_HEAD".equalsIgnoreCase(s.getDesignation())).findFirst().orElse(null);

        if (principal == null) {
            User pUser = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == ERole.ROLE_PRINCIPAL && u.getSchool() != null && id.equals(u.getSchool().getId()))
                    .findFirst().orElse(null);
            if (pUser != null) {
                principal = new StaffDetail();
                principal.setName(pUser.getName() != null && !pUser.getName().trim().isEmpty() ? pUser.getName() : pUser.getUsername());
                principal.setEmail(pUser.getEmail());
                principal.setDesignation("PRINCIPAL");
                principal.setSchool(school);
            }
        }

        if (sectionHead == null) {
            User sUser = userRepository.findAll().stream()
                    .filter(u -> (Boolean.TRUE.equals(u.getIsSectionHead()) || u.getRole() == ERole.ROLE_SECTION_HEAD) && u.getSchool() != null && id.equals(u.getSchool().getId()))
                    .findFirst().orElse(null);
            if (sUser != null) {
                sectionHead = new StaffDetail();
                sectionHead.setName(sUser.getName() != null && !sUser.getName().trim().isEmpty() ? sUser.getName() : sUser.getUsername());
                sectionHead.setEmail(sUser.getEmail());
                sectionHead.setDesignation("SECTION_HEAD");
                sectionHead.setSchool(school);
            }
        }

        map.put("principal", principal);
        map.put("sectionHead", sectionHead);
        map.put("staff", staff);
        
        List<java.util.Map<String, Object>> teacherDTOs = new java.util.ArrayList<>();
        List<User> teacherUsers = userRepository.findAll().stream()
                .filter(u -> (u.getRole() == ERole.ROLE_TEACHER || u.getRole() == ERole.ROLE_SECTION_HEAD || Boolean.TRUE.equals(u.getIsSectionHead())) && u.getSchool() != null && id.equals(u.getSchool().getId()))
                .collect(java.util.stream.Collectors.toList());

        if (!teacherUsers.isEmpty()) {
            for (User tu : teacherUsers) {
                java.util.Map<String, Object> tm = new java.util.HashMap<>();
                tm.put("id", tu.getId());
                tm.put("name", (tu.getName() != null && !tu.getName().trim().isEmpty()) ? tu.getName() : tu.getUsername());
                String subjectsStr = (tu.getSubjects() != null && !tu.getSubjects().isEmpty())
                        ? tu.getSubjects().stream().map(Subject::getName).collect(java.util.stream.Collectors.joining(", "))
                        : "Commerce Stream";
                tm.put("subject", subjectsStr);
                tm.put("isSectionHead", Boolean.TRUE.equals(tu.getIsSectionHead()) || tu.getRole() == ERole.ROLE_SECTION_HEAD);
                tm.put("examLevel", tu.getExamLevel() != null ? tu.getExamLevel() : "A/L");
                teacherDTOs.add(tm);
            }
        } else {
            List<Teacher> teachers = teacherRepository.findBySchoolId(id);
            for (Teacher t : teachers) {
                java.util.Map<String, Object> tm = new java.util.HashMap<>();
                tm.put("id", t.getId());
                tm.put("name", t.getName());
                tm.put("subject", "Commerce Stream");
                tm.put("isSectionHead", false);
                tm.put("examLevel", "A/L");
                teacherDTOs.add(tm);
            }
        }
        map.put("teachers", teacherDTOs);
        
        List<StudentCount> studentCounts = studentCountRepository.findBySchoolId(id);
        List<Student> schoolStudents = filterActiveStudents(studentRepository.findBySchoolId(id));
        Map<String, Object> cohorts = calculateLatestTwoCohorts(schoolStudents);
        map.putAll(cohorts);

        if (studentCounts.isEmpty()) {
            if (!schoolStudents.isEmpty()) {
                int y1 = (int) cohorts.get("cohort1Year");
                int y2 = (int) cohorts.get("cohort2Year");
                long m12 = schoolStudents.stream().filter(s -> (Integer.valueOf(y1).equals(s.getAlYear()) || (s.getAlYear() == null && s.getGrade() != null && s.getGrade() == 12)) && ("MALE".equalsIgnoreCase(s.getGender()) || "M".equalsIgnoreCase(s.getGender()))).count();
                long f12 = schoolStudents.stream().filter(s -> (Integer.valueOf(y1).equals(s.getAlYear()) || (s.getAlYear() == null && s.getGrade() != null && s.getGrade() == 12)) && ("FEMALE".equalsIgnoreCase(s.getGender()) || "F".equalsIgnoreCase(s.getGender()))).count();
                long m13 = schoolStudents.stream().filter(s -> (Integer.valueOf(y2).equals(s.getAlYear()) || (s.getAlYear() == null && (s.getGrade() == null || s.getGrade() == 13))) && ("MALE".equalsIgnoreCase(s.getGender()) || "M".equalsIgnoreCase(s.getGender()))).count();
                long f13 = schoolStudents.stream().filter(s -> (Integer.valueOf(y2).equals(s.getAlYear()) || (s.getAlYear() == null && (s.getGrade() == null || s.getGrade() == 13))) && ("FEMALE".equalsIgnoreCase(s.getGender()) || "F".equalsIgnoreCase(s.getGender()))).count();

                List<java.util.Map<String, Object>> dynCounts = new java.util.ArrayList<>();
                dynCounts.add(java.util.Map.of("grade", 12, "gender", "MALE", "count", (int) m12));
                dynCounts.add(java.util.Map.of("grade", 12, "gender", "FEMALE", "count", (int) f12));
                dynCounts.add(java.util.Map.of("grade", 13, "gender", "MALE", "count", (int) m13));
                dynCounts.add(java.util.Map.of("grade", 13, "gender", "FEMALE", "count", (int) f13));
                map.put("studentCounts", dynCounts);
            } else {
                map.put("studentCounts", studentCounts);
            }
        } else {
            map.put("studentCounts", studentCounts);
        }
        
        List<AlNationalResult> results = alNationalResultRepository.findBySchoolId(id);
        map.put("results", results);
        map.put("activeYear", getActiveAcademicYear());
        
        return ResponseEntity.ok(map);
    }

    @GetMapping("/rankings/years")
    public ResponseEntity<List<Integer>> getRankingYears(@RequestParam(required = false, defaultValue = "al") String examType) {
        java.util.Set<Integer> yearSet = new java.util.TreeSet<>(java.util.Collections.reverseOrder());

        if ("term".equalsIgnoreCase(examType)) {
            List<Integer> dbYears = termTestMarkRepository.findDistinctYears();
            if (dbYears != null && !dbYears.isEmpty()) {
                yearSet.addAll(dbYears);
            } else {
                yearSet.add(getActiveAcademicYear());
            }
        } else if ("unit".equalsIgnoreCase(examType)) {
            List<Integer> dbYears = unitTestMarkRepository.findDistinctYears();
            if (dbYears != null && !dbYears.isEmpty()) {
                yearSet.addAll(dbYears);
            } else {
                yearSet.add(getActiveAcademicYear());
            }
        } else {
            List<Integer> dbYears = studentAlResultRepository.findDistinctYears();
            if (dbYears != null) yearSet.addAll(dbYears);
            List<Integer> sumYears = studentAlSummaryRepository.findDistinctYears();
            if (sumYears != null) yearSet.addAll(sumYears);
            List<Integer> alNatYears = alNationalResultRepository.findDistinctYears();
            if (alNatYears != null) yearSet.addAll(alNatYears);
            if (yearSet.isEmpty()) {
                yearSet.add(getActiveAcademicYear());
            }
        }

        return ResponseEntity.ok(new java.util.ArrayList<>(yearSet));
    }

    @GetMapping("/rankings")
    public ResponseEntity<?> getRankings(
            @RequestParam(required = false, defaultValue = "al") String examType,
            @RequestParam(required = false, defaultValue = "2025") Integer year,
            @RequestParam(required = false) Integer termOrUnit,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) Long divisionId,
            @RequestParam(required = false) Long schoolId) {

        List<java.util.Map<String, Object>> rankedList = new java.util.ArrayList<>();
        List<Student> dbStudents = studentRepository.findAll();
        
        // Filter by location if specified
        List<Student> filteredStudents = dbStudents.stream().filter(s -> {
            if (s.getSchool() == null) return false;
            if (schoolId != null && !schoolId.equals(s.getSchool().getId())) return false;
            if (divisionId != null && (s.getSchool().getDivision() == null || !divisionId.equals(s.getSchool().getDivision().getId()))) return false;
            if (zoneId != null && (s.getSchool().getDivision() == null || s.getSchool().getDivision().getZone() == null || !zoneId.equals(s.getSchool().getDivision().getZone().getId()))) return false;
            if (districtId != null && (s.getSchool().getDivision() == null || s.getSchool().getDivision().getZone() == null || s.getSchool().getDivision().getZone().getDistrict() == null || !districtId.equals(s.getSchool().getDivision().getZone().getDistrict().getId()))) return false;
            return true;
        }).collect(java.util.stream.Collectors.toList());

        for (Student s : filteredStudents) {
            java.util.Map<String, Object> row = new java.util.HashMap<>();
            row.put("studentId", s.getId());
            row.put("name", s.getName());
            row.put("indexNumber", s.getIndexNumber() != null ? s.getIndexNumber() : "COM-" + year + "-" + (1000 + s.getId()));
            row.put("gender", s.getGender() != null ? s.getGender() : "MALE");
            row.put("schoolId", s.getSchool().getId());
            row.put("schoolName", s.getSchool().getName());
            row.put("divisionName", s.getSchool().getDivision() != null ? s.getSchool().getDivision().getName() : "Central");
            row.put("zoneName", (s.getSchool().getDivision() != null && s.getSchool().getDivision().getZone() != null) ? s.getSchool().getDivision().getZone().getName() : "Anuradhapura");
            row.put("districtName", (s.getSchool().getDivision() != null && s.getSchool().getDivision().getZone() != null && s.getSchool().getDivision().getZone().getDistrict() != null) ? s.getSchool().getDivision().getZone().getDistrict().getName() : "Anuradhapura");

            boolean isAl = "al".equalsIgnoreCase(examType);
            row.put("examType", isAl ? "al" : examType.toLowerCase());
            row.put("examYear", year);

            Double acc = null, bs = null, eco = null, ict = null;
            String accGrade = null, bsGrade = null, ecoGrade = null, ictGrade = null;
            Double studentZScore = null;

            if ("term".equalsIgnoreCase(examType)) {
                List<TermTestMark> marks = (year != null)
                    ? termTestMarkRepository.findByStudentIdAndYear(s.getId(), year)
                    : termTestMarkRepository.findByStudentId(s.getId());
                for (TermTestMark m : marks) {
                    if (m.getSubject() != null) {
                        String sName = m.getSubject().getName().toLowerCase();
                        if (sName.contains("account")) acc = m.getMarks();
                        else if (sName.contains("business")) bs = m.getMarks();
                        else if (sName.contains("economic")) eco = m.getMarks();
                        else if (sName.contains("information") || sName.contains("ict")) ict = m.getMarks();
                    }
                }
            } else if ("unit".equalsIgnoreCase(examType)) {
                List<UnitTestMark> marks = (year != null)
                    ? unitTestMarkRepository.findByStudentIdAndYear(s.getId(), year)
                    : unitTestMarkRepository.findByStudentId(s.getId());
                for (UnitTestMark m : marks) {
                    if (m.getSubject() != null) {
                        String sName = m.getSubject().getName().toLowerCase();
                        if (sName.contains("account")) acc = m.getMarks();
                        else if (sName.contains("business")) bs = m.getMarks();
                        else if (sName.contains("economic")) eco = m.getMarks();
                        else if (sName.contains("information") || sName.contains("ict")) ict = m.getMarks();
                    }
                }
            } else {
                // A/L National Results: Grades + Z-Score
                List<StudentAlResult> alRes = (year != null)
                    ? studentAlResultRepository.findByStudentIdAndYear(s.getId(), year)
                    : studentAlResultRepository.findByStudentId(s.getId());
                for (StudentAlResult r : alRes) {
                    if (r.getSubject() != null) {
                        String sName = r.getSubject().getName().toLowerCase();
                        String g = r.getGrade() != null ? r.getGrade().toUpperCase() : "A";
                        if (sName.contains("account")) accGrade = g;
                        else if (sName.contains("business")) bsGrade = g;
                        else if (sName.contains("economic")) ecoGrade = g;
                        else if (sName.contains("information") || sName.contains("ict")) ictGrade = g;
                    }
                }

                // Check student AL summary for real Z-Score
                List<StudentAlSummary> summaries = (year != null)
                    ? studentAlSummaryRepository.findByStudentIdAndYear(s.getId(), year)
                    : studentAlSummaryRepository.findByStudentId(s.getId());
                if (!summaries.isEmpty()) {
                    studentZScore = summaries.get(0).getZScore();
                }
            }

            // Real Data Enforcement: Only students with recorded results/marks are listed
            if (isAl) {
                // If student has no real AL results recorded, skip
                if (accGrade == null && bsGrade == null && ecoGrade == null && ictGrade == null && studentZScore == null) {
                    continue;
                }

                row.put("accountingGrade", accGrade != null ? accGrade : "-");
                row.put("businessStudiesGrade", bsGrade != null ? bsGrade : "-");
                row.put("economicsGrade", ecoGrade);
                row.put("ictGrade", ictGrade);
                row.put("zScore", studentZScore != null ? studentZScore : 0.0);

                int aCount = 0, bCount = 0, cCount = 0;
                for (String g : new String[]{accGrade, bsGrade, ecoGrade != null ? ecoGrade : ictGrade}) {
                    if ("A".equalsIgnoreCase(g)) aCount++;
                    else if ("B".equalsIgnoreCase(g)) bCount++;
                    else if ("C".equalsIgnoreCase(g)) cCount++;
                }
                String summary = aCount == 3 ? "3A (A-A-A)" : aCount == 2 && bCount == 1 ? "2A 1B" : aCount == 1 && bCount == 2 ? "1A 2B" : bCount == 3 ? "3B" : (aCount > 0 || bCount > 0 || cCount > 0) ? "A/L Qualified" : "Appeared";
                row.put("gradeSummary", summary);
                row.put("totalMarks", null);
                row.put("averageMarks", null);
            } else {
                // Term / Unit tests: Only include if student actually has marks entered
                if (acc == null && bs == null && eco == null && ict == null) {
                    continue;
                }

                row.put("accounting", acc);
                row.put("businessStudies", bs);
                row.put("economics", eco);
                row.put("ict", ict);

                double activeThird = (ict != null) ? ict : (eco != null ? eco : 0.0);
                double tot = (acc != null ? acc : 0.0) + (bs != null ? bs : 0.0) + activeThird;
                int countTaken = (acc != null ? 1 : 0) + (bs != null ? 1 : 0) + ((ict != null || eco != null) ? 1 : 0);
                if (countTaken == 0) countTaken = 1;
                row.put("totalMarks", Math.round(tot * 10.0) / 10.0);
                row.put("averageMarks", Math.round((tot / countTaken) * 10.0) / 10.0);
                row.put("zScore", Math.round((tot / 300.0 * 2.5) * 1000.0) / 1000.0);
            }

            rankedList.add(row);
        }

        // Sort by selected criteria
        final String sortKey;
        if (subjectId != null) {
            sortKey = (subjectId == 21) ? "accounting" : (subjectId == 20 || subjectId == 22) ? "businessStudies" : (subjectId == 32 || subjectId == 23) ? "economics" : "ict";
        } else {
            sortKey = "totalMarks";
        }

        rankedList.sort((r1, r2) -> {
            if ("al".equalsIgnoreCase(examType)) {
                if (subjectId != null) {
                    String gKey = (subjectId == 21) ? "accountingGrade" : (subjectId == 20 || subjectId == 22) ? "businessStudiesGrade" : (subjectId == 32 || subjectId == 23) ? "economicsGrade" : "ictGrade";
                    String g1 = (String) r1.get(gKey);
                    String g2 = (String) r2.get(gKey);
                    int cmp = gradeScore(g2) - gradeScore(g1);
                    if (cmp != 0) return cmp;
                    Double z1 = (Double) r1.getOrDefault("zScore", 0.0);
                    Double z2 = (Double) r2.getOrDefault("zScore", 0.0);
                    if (z1 == null) z1 = 0.0;
                    if (z2 == null) z2 = 0.0;
                    return z2.compareTo(z1);
                } else {
                    Double z1 = (Double) r1.getOrDefault("zScore", 0.0);
                    Double z2 = (Double) r2.getOrDefault("zScore", 0.0);
                    if (z1 == null) z1 = 0.0;
                    if (z2 == null) z2 = 0.0;
                    return z2.compareTo(z1);
                }
            } else {
                Double m1 = (Double) r1.getOrDefault(sortKey, 0.0);
                Double m2 = (Double) r2.getOrDefault(sortKey, 0.0);
                if (m1 == null) m1 = 0.0;
                if (m2 == null) m2 = 0.0;
                return m2.compareTo(m1);
            }
        });

        // Compute hierarchical ranks per school, division, zone, and district
        java.util.Map<String, Integer> schoolCounters = new java.util.HashMap<>();
        java.util.Map<String, Integer> divisionCounters = new java.util.HashMap<>();
        java.util.Map<String, Integer> zoneCounters = new java.util.HashMap<>();
        java.util.Map<String, Integer> districtCounters = new java.util.HashMap<>();

        // Assign ranks and achievement badges
        for (int i = 0; i < rankedList.size(); i++) {
            java.util.Map<String, Object> r = rankedList.get(i);
            int provinceRank = i + 1;
            r.put("rank", provinceRank);

            String school = (String) r.getOrDefault("schoolName", "School");
            String division = (String) r.getOrDefault("divisionName", "Division");
            String zone = (String) r.getOrDefault("zoneName", "Zone");
            String district = (String) r.getOrDefault("districtName", "District");

            int sRank = schoolCounters.getOrDefault(school, 0) + 1;
            schoolCounters.put(school, sRank);
            r.put("schoolRank", sRank);

            int divRank = divisionCounters.getOrDefault(division, 0) + 1;
            divisionCounters.put(division, divRank);
            r.put("divisionRank", divRank);

            int zRank = zoneCounters.getOrDefault(zone, 0) + 1;
            zoneCounters.put(zone, zRank);
            r.put("zoneRank", zRank);

            int distRank = districtCounters.getOrDefault(district, 0) + 1;
            districtCounters.put(district, distRank);
            r.put("districtRank", distRank);

            List<String> badges = new java.util.ArrayList<>();

            // 1. Primary Top Performance Achievement (Hierarchical Recognition)
            if (provinceRank == 1) {
                badges.add("🏆 Province 1st Place (පළාත් ප්‍රථමයා)");
            } else if (provinceRank == 2) {
                badges.add("🥈 Province 2nd Place (පළාත් දෙවන ස්ථානය)");
            } else if (provinceRank == 3) {
                badges.add("🥉 Province 3rd Place (පළාත් තෙවන ස්ථානය)");
            } else if (distRank == 1) {
                badges.add("🏛️ District 1st Place (" + district + " දිස්ත්‍රික් ප්‍රථමයා)");
            } else if (zRank == 1) {
                badges.add("🏢 Zonal 1st Place (" + zone + " කලාප ප්‍රථමයා)");
            } else if (divRank == 1) {
                badges.add("🏬 Division 1st Place (" + division + " කොට්ඨාස ප්‍රථමයා)");
            } else if (sRank == 1) {
                badges.add("🏫 School 1st Place (පාසලේ ප්‍රථමයා)");
            } else if (distRank == 2) {
                badges.add("🥈 District 2nd Place (" + district + ")");
            } else if (zRank == 2) {
                badges.add("🥈 Zonal 2nd Place (" + zone + ")");
            } else if (sRank == 2) {
                badges.add("🥈 School 2nd Place (පාසලේ දෙවන ස්ථානය)");
            } else if (sRank == 3) {
                badges.add("🥉 School 3rd Place (පාසලේ තෙවන ස්ථානය)");
            } else if (provinceRank <= 10) {
                badges.add("⭐ Top 10 Star Performer");
            } else {
                badges.add("🏫 School Rank #" + sRank);
            }

            // 2. Distinction & Excellence Badges
            if ("al".equalsIgnoreCase(examType)) {
                String ag = (String) r.get("accountingGrade");
                String bg = (String) r.get("businessStudiesGrade");
                String eg = (String) r.get("economicsGrade");
                String ig = (String) r.get("ictGrade");
                Double z = (Double) r.getOrDefault("zScore", 0.0);
                String thirdG = (eg != null) ? eg : ig;
                if ("A".equals(ag) && "A".equals(bg) && "A".equals(thirdG)) {
                    badges.add("🎖️ Triple Distinction (3A)");
                }
                if (z != null && z >= 2.0) {
                    badges.add("🌟 High Z-Score (" + z + ")");
                }
            } else {
                Double a = (Double) r.getOrDefault("accounting", 0.0);
                Double b = (Double) r.getOrDefault("businessStudies", 0.0);
                Double c = (Double) r.getOrDefault("economics", 0.0);
                Double d = (Double) r.getOrDefault("ict", 0.0);

                if (a != null && b != null && (c != null || d != null)) {
                    double third = c != null ? c : (d != null ? d : 0.0);
                    if (a >= 95.0 && b >= 95.0 && third >= 95.0) {
                        badges.add("🎖️ Triple Distinction (95%+)");
                    }
                }
                if (a != null && a >= 98.0) badges.add("📊 Accounting Top Scorer (98%+)");
                if (b != null && b >= 98.0) badges.add("📈 BS Top Scorer (98%+)");
                if (c != null && c >= 98.0) badges.add("📉 Economics Top Scorer (98%+)");
                if (d != null && d >= 98.0) badges.add("💻 ICT Top Scorer (98%+)");
            }

            r.put("badges", badges);
        }

        return ResponseEntity.ok(rankedList);
    }

    private int gradeScore(String grade) {
        if (grade == null) return 0;
        switch (grade.trim().toUpperCase()) {
            case "A": return 5;
            case "B": return 4;
            case "C": return 3;
            case "S": return 2;
            case "F": return 1;
            default: return 0;
        }
    }
}
