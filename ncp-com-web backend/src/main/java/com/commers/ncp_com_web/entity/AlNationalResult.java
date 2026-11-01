package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "al_national_results")
public class AlNationalResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(name = "exam_year", nullable = false)
    private Integer year;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = true)
    private String gender; // MALE, FEMALE

    private Integer totalSat;
    private Integer aCount;
    private Integer bCount;
    private Integer cCount;
    private Integer sCount;
    private Integer fCount;
    private Double passPercentage;

    public AlNationalResult() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public School getSchool() { return school; }
    public void setSchool(School school) { this.school = school; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Integer getTotalSat() { return totalSat; }
    public void setTotalSat(Integer totalSat) { this.totalSat = totalSat; }

    public Integer getACount() { return aCount; }
    public void setACount(Integer aCount) { this.aCount = aCount; }

    public Integer getBCount() { return bCount; }
    public void setBCount(Integer bCount) { this.bCount = bCount; }

    public Integer getCCount() { return cCount; }
    public void setCCount(Integer cCount) { this.cCount = cCount; }

    public Integer getSCount() { return sCount; }
    public void setSCount(Integer sCount) { this.sCount = sCount; }

    public Integer getFCount() { return fCount; }
    public void setFCount(Integer fCount) { this.fCount = fCount; }

    public Double getPassPercentage() { return passPercentage; }
    public void setPassPercentage(Double passPercentage) { this.passPercentage = passPercentage; }
}
