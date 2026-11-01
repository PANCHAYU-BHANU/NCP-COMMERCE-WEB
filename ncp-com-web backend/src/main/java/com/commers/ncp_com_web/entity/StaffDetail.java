package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "staff_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false)
    private String designation; // PRINCIPAL, DEPUTY_PRINCIPAL, SECTION_HEAD

    @Column(nullable = false)
    private String name;

    private String address;
    private String phone;
    private String whatsapp;
    private Integer yearsOfService;
}
