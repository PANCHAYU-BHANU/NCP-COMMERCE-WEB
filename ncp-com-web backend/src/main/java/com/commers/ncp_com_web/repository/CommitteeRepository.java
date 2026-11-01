package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.Committee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommitteeRepository extends JpaRepository<Committee, Long> {
    List<Committee> findByType(String type);
    List<Committee> findByTypeAndZoneId(String type, Long zoneId);
}
