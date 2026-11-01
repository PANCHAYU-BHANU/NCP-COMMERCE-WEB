package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    List<School> findByDivisionId(Long divisionId);
    long countByDivisionZoneDistrictProvinceId(Long provinceId);
    long countByDivisionZoneDistrictId(Long districtId);
    long countByDivisionZoneId(Long zoneId);
}
