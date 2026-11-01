package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_al_summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentAlSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "exam_year", nullable = false)
    private Integer year;

    private Double zScore;
    private Integer districtRank;
    private Integer islandRank;
}
