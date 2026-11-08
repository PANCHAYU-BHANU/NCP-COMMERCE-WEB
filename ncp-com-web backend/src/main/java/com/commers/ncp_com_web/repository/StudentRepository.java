package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findBySchoolId(Long schoolId);
    Optional<Student> findByNameAndSchoolId(String name, Long schoolId);
    Optional<Student> findBySchoolIdAndIndexNumber(Long schoolId, String indexNumber);
    boolean existsBySchoolIdAndIndexNumber(Long schoolId, String indexNumber);

    @Query("SELECT MAX(s.alYear) FROM Student s")
    Integer findMaxAlYear();
}
