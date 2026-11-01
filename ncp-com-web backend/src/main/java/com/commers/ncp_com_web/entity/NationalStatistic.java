package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "national_statistics")
public class NationalStatistic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer year;

    @Column(name = "total_schools")
    private Long totalSchools;

    @Column(name = "total_students")
    private Long totalStudents;

    @Column(name = "total_teachers")
    private Long totalTeachers;

    @Column(name = "pass_rate")
    private Double passRate;

    public NationalStatistic() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    
    public Long getTotalSchools() { return totalSchools; }
    public void setTotalSchools(Long totalSchools) { this.totalSchools = totalSchools; }
    
    public Long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Long totalStudents) { this.totalStudents = totalStudents; }
    
    public Long getTotalTeachers() { return totalTeachers; }
    public void setTotalTeachers(Long totalTeachers) { this.totalTeachers = totalTeachers; }
    
    public Double getPassRate() { return passRate; }
    public void setPassRate(Double passRate) { this.passRate = passRate; }
}
