package com.commers.ncp_com_web.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "unit_test_definitions")
public class UnitTestDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer unitNumber;

    @Column(nullable = false)
    private String unitName;

    @Column(length = 500)
    private String description;

    public UnitTestDefinition() {}

    public UnitTestDefinition(Integer unitNumber, String unitName, String description) {
        this.unitNumber = unitNumber;
        this.unitName = unitName;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getUnitNumber() {
        return unitNumber;
    }

    public void setUnitNumber(Integer unitNumber) {
        this.unitNumber = unitNumber;
    }

    public String getUnitName() {
        return unitName;
    }

    public void setUnitName(String unitName) {
        this.unitName = unitName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
