package com.commers.ncp_com_web.dto;

import lombok.Data;

@Data
public class StudentCountDto {
    private Long id;
    private Long schoolId;
    private Integer grade;
    private Long subjectId;
    private String gender;
    private Integer count;
}
