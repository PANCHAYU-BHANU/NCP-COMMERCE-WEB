package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
    List<News> findByCategory(String category);
    List<News> findByStatus(String status);
}
