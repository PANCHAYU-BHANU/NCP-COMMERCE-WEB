package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.AlNationalResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AlNationalResultRepository extends JpaRepository<AlNationalResult, Long> {
    List<AlNationalResult> findBySchoolId(Long schoolId);
    Optional<AlNationalResult> findBySchoolIdAndSubjectIdAndYear(Long schoolId, Long subjectId, Integer year);
    List<AlNationalResult> findBySchoolDivisionZoneDistrictId(Long districtId);
    List<AlNationalResult> findBySchoolDivisionZoneId(Long zoneId);
    List<AlNationalResult> findBySchoolDivisionId(Long divisionId);
    List<AlNationalResult> findBySubjectId(Long subjectId);
    List<AlNationalResult> findByYear(Integer year);
    List<AlNationalResult> findBySubjectIdAndYear(Long subjectId, Integer year);
    List<AlNationalResult> findBySchoolDivisionZoneDistrictIdAndYear(Long districtId, Integer year);
    List<AlNationalResult> findBySchoolDivisionZoneDistrictIdAndSubjectId(Long districtId, Long subjectId);
    List<AlNationalResult> findBySchoolDivisionZoneDistrictIdAndSubjectIdAndYear(Long districtId, Long subjectId, Integer year);
    long countBySchoolDivisionZoneDistrictId(Long districtId);

    @Query("SELECT AVG(a.passPercentage) FROM AlNationalResult a WHERE a.year = :year")
    Double getAveragePassPercentageByYear(@Param("year") Integer year);

    @Query("SELECT AVG(a.passPercentage) FROM AlNationalResult a WHERE a.year = :year AND a.school.division.zone.district.province.id = :provinceId")
    Double getAveragePassPercentageByYearAndProvince(@Param("year") Integer year, @Param("provinceId") Long provinceId);
}
