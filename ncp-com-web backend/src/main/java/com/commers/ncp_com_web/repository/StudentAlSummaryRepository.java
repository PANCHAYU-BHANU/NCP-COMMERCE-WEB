package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.StudentAlSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentAlSummaryRepository extends JpaRepository<StudentAlSummary, Long> {
    List<StudentAlSummary> findByStudentId(Long studentId);
    List<StudentAlSummary> findByStudentIdAndYear(Long studentId, Integer year);

    @Query("SELECT DISTINCT s.year FROM StudentAlSummary s WHERE s.year IS NOT NULL ORDER BY s.year DESC")
    List<Integer> findDistinctYears();
}
