package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.TeacherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, Long> {
    Optional<TeacherProfile> findByUserId(Long userId);
    Optional<TeacherProfile> findByUserUsername(String username);
    Optional<TeacherProfile> findByNic(String nic);
}

