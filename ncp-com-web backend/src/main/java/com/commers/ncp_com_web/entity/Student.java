package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students", uniqueConstraints = {
    @UniqueConstraint(name = "uk_school_student_index", columnNames = {"school_id", "index_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String whatsappNumber;

    @Column(nullable = false)
    private Integer grade;

    @Column(name = "al_year", nullable = true)
    private Integer alYear;

    @Column(nullable = true) // Keeping true initially to avoid breaking existing entries
    private String gender; // MALE, FEMALE

    @Column(name = "index_number", nullable = true)
    private String indexNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;
}
