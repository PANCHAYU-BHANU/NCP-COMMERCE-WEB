package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.NationalStatistic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NationalStatisticRepository extends JpaRepository<NationalStatistic, Long> {
    Optional<NationalStatistic> findByYear(Integer year);

    @Query("SELECT MAX(n.year) FROM NationalStatistic n")
    Integer findMaxYear();
}

