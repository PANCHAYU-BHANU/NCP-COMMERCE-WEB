package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.CommitteeMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommitteeMemberRepository extends JpaRepository<CommitteeMember, Long> {
    List<CommitteeMember> findByCommitteeId(Long committeeId);
    List<CommitteeMember> findByUserId(Long userId);
    boolean existsByCommitteeIdAndUserId(Long committeeId, Long userId);
    Optional<CommitteeMember> findByCommitteeIdAndUserId(Long committeeId, Long userId);
}

