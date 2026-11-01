package com.commers.ncp_com_web.dto;

import lombok.Data;

@Data
public class AlNationalResultDto {
    private Long id;
    private Long schoolId;
    private Integer year;
    private Long subjectId;
    private Integer totalSat;
    private Integer aCount;
    private Integer bCount;
    private Integer cCount;
    private Integer sCount;
    private Integer fCount;
    private Double passPercentage;
}
