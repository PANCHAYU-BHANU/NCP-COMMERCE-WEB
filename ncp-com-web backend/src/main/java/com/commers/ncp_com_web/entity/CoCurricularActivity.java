package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cocurricular_activities")
public class CoCurricularActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String activityType; // ENTREPRENEURSHIP, DEBATE, QUIZ

    @Column(nullable = false)
    private String positionOrEvent;

    public CoCurricularActivity() {
    }

    public CoCurricularActivity(Long id, Student student, String activityType, String positionOrEvent) {
        this.id = id;
        this.student = student;
        this.activityType = activityType;
        this.positionOrEvent = positionOrEvent;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getPositionOrEvent() {
        return positionOrEvent;
    }

    public void setPositionOrEvent(String positionOrEvent) {
        this.positionOrEvent = positionOrEvent;
    }
}
