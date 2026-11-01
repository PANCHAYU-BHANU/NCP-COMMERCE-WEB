package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DivisionRepository extends JpaRepository<Division, Long> {
    List<Division> findByZoneId(Long zoneId);
}
