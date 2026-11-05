package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // AL or OL

    @Column
    private String medium; // Sinhala, Tamil, English, All

    private String code;

    private String nameSi;

    private String nameTa;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String descriptionSi;

    @Column(columnDefinition = "TEXT")
    private String modules;

    @Column(columnDefinition = "TEXT")
    private String modulesSi;

    private String imageUrl;

    private String color;

    public Subject(Long id, String name, String type, String medium) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.medium = medium;
    }
}
