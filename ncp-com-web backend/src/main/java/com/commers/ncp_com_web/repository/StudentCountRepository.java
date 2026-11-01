package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.StudentCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface StudentCountRepository extends JpaRepository<StudentCount, Long> {
    List<StudentCount> findBySchoolId(Long schoolId);
    List<StudentCount> findBySchoolDivisionId(Long divisionId);
    List<StudentCount> findBySchoolDivisionZoneId(Long zoneId);
    List<StudentCount> findBySchoolDivisionZoneDistrictId(Long districtId);

    @Query("SELECT SUM(s.count) FROM StudentCount s")
    Long getTotalStudentCount();

    @Query("SELECT SUM(s.count) FROM StudentCount s WHERE s.school.division.zone.district.province.id = :provinceId")
    Long getTotalStudentCountByProvince(@Param("provinceId") Long provinceId);
}
