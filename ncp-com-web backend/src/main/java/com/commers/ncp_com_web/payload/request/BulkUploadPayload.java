package com.commers.ncp_com_web.payload.request;

import lombok.Data;
import java.util.List;

@Data
public class BulkUploadPayload {
    private String type; // "AL_RESULTS", "TERM_TEST", "UNIT_TEST"
    private Integer year;
    private Integer termOrUnit; // For Term Test (1,2,3) or Unit Test (1,2,3...)
    private List<StudentResultRow> rows;
}
