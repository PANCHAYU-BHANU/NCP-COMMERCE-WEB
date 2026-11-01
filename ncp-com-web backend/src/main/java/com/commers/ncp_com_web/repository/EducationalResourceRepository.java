package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.EducationalResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EducationalResourceRepository extends JpaRepository<EducationalResource, Long> {
    List<EducationalResource> findByResourceTypeAndExamLevel(String resourceType, String examLevel);
    List<EducationalResource> findByResourceTypeAndExamLevelAndSubjectId(String resourceType, String examLevel, Long subjectId);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM EducationalResource r WHERE r.targetAudience = 'PUBLIC' OR r.targetAudience IS NULL ORDER BY r.examYear DESC, r.id DESC")
    List<EducationalResource> findPublicResources();

    @org.springframework.data.jpa.repository.Query("SELECT r FROM EducationalResource r ORDER BY r.examYear DESC, r.id DESC")
    List<EducationalResource> findAllOrdered();
}
