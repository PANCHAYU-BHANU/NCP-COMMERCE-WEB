package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.CommitteeMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommitteeMessageRepository extends JpaRepository<CommitteeMessage, Long> {

    @Query("SELECT m FROM CommitteeMessage m WHERE m.committee.id = :committeeId AND (m.isPinned = true OR m.createdAt >= :threshold) ORDER BY m.createdAt ASC")
    List<CommitteeMessage> findActiveMessages(@Param("committeeId") Long committeeId, @Param("threshold") LocalDateTime threshold);

    List<CommitteeMessage> findByCommitteeIdOrderByCreatedAtAsc(Long committeeId);

    @Transactional
    @Modifying
    @Query("DELETE FROM CommitteeMessage m WHERE (m.isPinned = false OR m.isPinned IS NULL) AND m.createdAt < :threshold")
    void deleteExpiredUnpinnedMessages(@Param("threshold") LocalDateTime threshold);

    @Transactional
    @Modifying
    void deleteByCommitteeId(Long committeeId);
}
