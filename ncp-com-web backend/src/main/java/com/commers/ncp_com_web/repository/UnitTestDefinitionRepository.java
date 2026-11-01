package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.UnitTestDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitTestDefinitionRepository extends JpaRepository<UnitTestDefinition, Long> {
    Optional<UnitTestDefinition> findByUnitNumber(Integer unitNumber);
    List<UnitTestDefinition> findAllByOrderByUnitNumberAsc();
}
