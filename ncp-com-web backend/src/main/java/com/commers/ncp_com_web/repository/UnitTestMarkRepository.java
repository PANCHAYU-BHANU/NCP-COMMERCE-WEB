package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.UnitTestMark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UnitTestMarkRepository extends JpaRepository<UnitTestMark, Long> {
    List<UnitTestMark> findByStudentId(Long studentId);
    List<UnitTestMark> findByStudentIdAndYear(Long studentId, Integer year);

    @Query("SELECT DISTINCT m.year FROM UnitTestMark m WHERE m.year IS NOT NULL ORDER BY m.year DESC")
    List<Integer> findDistinctYears();
}
