package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.ERole;
import com.commers.ncp_com_web.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    List<User> findByRole(ERole role);
    Optional<User> findFirstByRole(ERole role);
    Optional<User> findFirstByRoleAndZoneId(ERole role, Long zoneId);
    Optional<User> findFirstByRoleAndDivisionId(ERole role, Long divisionId);
    List<User> findByRoleAndZoneId(ERole role, Long zoneId);
    List<User> findByRoleAndDivisionId(ERole role, Long divisionId);
    List<User> findByRoleAndSchoolId(ERole role, Long schoolId);

    @Query("SELECT u FROM User u WHERE (u.role = 'ROLE_SECTION_HEAD' OR u.isSectionHead = true) AND u.school.id = :schoolId")
    List<User> findSectionHeadsBySchoolId(@Param("schoolId") Long schoolId);
}
