package com.commers.ncp_com_web.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String role;
    private Long provinceId;
    private Long districtId;
    private Long zoneId;
    private Long divisionId;
    private Long schoolId;
}
