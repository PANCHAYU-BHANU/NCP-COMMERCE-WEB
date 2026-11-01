package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.TermTestMark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TermTestMarkRepository extends JpaRepository<TermTestMark, Long> {
    List<TermTestMark> findByStudentId(Long studentId);
    List<TermTestMark> findByStudentIdAndYear(Long studentId, Integer year);

    @Query("SELECT DISTINCT m.year FROM TermTestMark m WHERE m.year IS NOT NULL ORDER BY m.year DESC")
    List<Integer> findDistinctYears();
}
