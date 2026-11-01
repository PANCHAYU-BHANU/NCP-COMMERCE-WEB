package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "committee_members")
public class CommitteeMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "committee_id", nullable = false)
    private Committee committee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String position;

    public CommitteeMember() {}

    public CommitteeMember(Long id, Committee committee, User user, String position) {
        this.id = id;
        this.committee = committee;
        this.user = user;
        this.position = position;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Committee getCommittee() { return committee; }
    public void setCommittee(Committee committee) { this.committee = committee; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
}
