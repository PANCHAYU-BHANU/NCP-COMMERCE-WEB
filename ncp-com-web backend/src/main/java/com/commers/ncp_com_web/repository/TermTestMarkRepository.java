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
    List<TermTestMark> findByStudentIdAndYearAndTerm(Long studentId, Integer year, Integer term);
    java.util.Optional<TermTestMark> findByStudentIdAndYearAndTermAndSubjectId(Long studentId, Integer year, Integer term, Long subjectId);

    @Query("SELECT DISTINCT m.year FROM TermTestMark m WHERE m.year IS NOT NULL ORDER BY m.year DESC")
    List<Integer> findDistinctYears();

    @Query("SELECT MAX(m.year) FROM TermTestMark m")
    Integer findMaxYear();

    @Query("SELECT DISTINCT m.student.id FROM TermTestMark m WHERE m.student.id IN :studentIds AND m.subject.id = :subjectId")
    List<Long> findDistinctStudentIdsBySubjectId(@org.springframework.data.repository.query.Param("studentIds") List<Long> studentIds, @org.springframework.data.repository.query.Param("subjectId") Long subjectId);
}
