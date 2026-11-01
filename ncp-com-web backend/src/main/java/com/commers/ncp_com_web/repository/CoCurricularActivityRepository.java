package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.CoCurricularActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CoCurricularActivityRepository extends JpaRepository<CoCurricularActivity, Long> {
    List<CoCurricularActivity> findByStudentId(Long studentId);
}
