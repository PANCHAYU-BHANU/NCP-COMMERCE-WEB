package com.commers.ncp_com_web.dto;

import lombok.Data;

@Data
public class StudentDto {
    private Long id;
    private String indexNumber;
    private String name;
    private String whatsappNumber;
    private Integer grade;
    private Long schoolId;
}
