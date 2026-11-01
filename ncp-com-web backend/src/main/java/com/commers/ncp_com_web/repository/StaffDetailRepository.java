package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.StaffDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StaffDetailRepository extends JpaRepository<StaffDetail, Long> {
    List<StaffDetail> findBySchoolId(Long schoolId);
}
