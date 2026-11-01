package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    List<Teacher> findBySchoolId(Long schoolId);
    long countBySchoolDivisionZoneDistrictProvinceId(Long provinceId);
    long countBySchoolDivisionZoneDistrictId(Long districtId);
    long countBySchoolDivisionZoneId(Long zoneId);
    long countBySchoolId(Long schoolId);
}
