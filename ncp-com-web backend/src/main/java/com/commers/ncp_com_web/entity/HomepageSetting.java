package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "homepage_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HomepageSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String directorName;
    private String directorRole;
    private String directorTitle;

    @Column(columnDefinition = "TEXT")
    private String directorQuote;

    @Column(columnDefinition = "TEXT")
    private String directorQuoteSi;

    @Column(length = 500)
    private String directorPhoto;

    @Column(columnDefinition = "TEXT")
    private String vision;

    @Column(columnDefinition = "TEXT")
    private String visionSi;

    @Column(columnDefinition = "TEXT")
    private String mission;

    @Column(columnDefinition = "TEXT")
    private String missionSi;
}

