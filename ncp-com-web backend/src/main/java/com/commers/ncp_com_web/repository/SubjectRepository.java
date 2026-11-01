package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByType(String type);
    java.util.Optional<Subject> findFirstByNameContainingIgnoreCase(String name);
}
