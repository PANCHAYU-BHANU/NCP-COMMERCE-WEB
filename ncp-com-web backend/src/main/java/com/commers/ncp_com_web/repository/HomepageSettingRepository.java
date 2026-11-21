package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.HomepageSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HomepageSettingRepository extends JpaRepository<HomepageSetting, Long> {
}

