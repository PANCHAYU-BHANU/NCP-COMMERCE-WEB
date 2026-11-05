package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.StudentAlResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAlResultRepository extends JpaRepository<StudentAlResult, Long> {

    List<StudentAlResult> findByStudentId(Long studentId);
    List<StudentAlResult> findByStudentIdAndYear(Long studentId, Integer year);

    @Query("SELECT DISTINCT r.year FROM StudentAlResult r WHERE r.year IS NOT NULL ORDER BY r.year DESC")
    List<Integer> findDistinctYears();

    @Query("SELECT MAX(r.year) FROM StudentAlResult r")
    Integer findMaxYear();

    @Query("SELECT DISTINCT r.student.id FROM StudentAlResult r WHERE r.year <= :year")
    List<Long> findStudentIdsWithAlResultsUpToYear(@Param("year") Integer year);

    @Query(value = "SELECT COUNT(DISTINCT student_id) FROM student_al_results WHERE exam_year = :year", nativeQuery = true)
    Long countTotalSatByYear(@Param("year") Integer year);

    @Query(value = "SELECT COUNT(*) FROM (SELECT student_id FROM student_al_results WHERE exam_year = :year AND UPPER(TRIM(grade)) IN ('A', 'B', 'C', 'S') GROUP BY student_id HAVING COUNT(*) >= 3) AS passed_students", nativeQuery = true)
    Long countPassedByYear(@Param("year") Integer year);

    @Query(value = "SELECT COUNT(DISTINCT r.student_id) FROM student_al_results r JOIN students s ON r.student_id = s.id JOIN schools sch ON s.school_id = sch.id JOIN divisions d ON sch.division_id = d.id JOIN zones z ON d.zone_id = z.id JOIN districts dist ON z.district_id = dist.id WHERE r.exam_year = :year AND dist.province_id = :provinceId", nativeQuery = true)
    Long countTotalSatByYearAndProvince(@Param("year") Integer year, @Param("provinceId") Long provinceId);

    @Query(value = "SELECT COUNT(*) FROM (SELECT r.student_id FROM student_al_results r JOIN students s ON r.student_id = s.id JOIN schools sch ON s.school_id = sch.id JOIN divisions d ON sch.division_id = d.id JOIN zones z ON d.zone_id = z.id JOIN districts dist ON z.district_id = dist.id WHERE r.exam_year = :year AND UPPER(TRIM(r.grade)) IN ('A', 'B', 'C', 'S') AND dist.province_id = :provinceId GROUP BY r.student_id HAVING COUNT(*) >= 3) AS passed_students", nativeQuery = true)
    Long countPassedByYearAndProvince(@Param("year") Integer year, @Param("provinceId") Long provinceId);
}
