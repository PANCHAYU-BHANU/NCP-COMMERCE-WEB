package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, Long> {
    List<Zone> findByDistrictId(Long districtId);
}
