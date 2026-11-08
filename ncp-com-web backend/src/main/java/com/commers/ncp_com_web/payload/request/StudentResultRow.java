package com.commers.ncp_com_web.payload.request;

import lombok.Data;
import java.util.List;

@Data
public class StudentResultRow {
    private String indexNumber; // Index or Admission Number
    private String name;
    private String gender; // MALE, FEMALE
    private String whatsapp;
    private String acc; // Grade or Mark
    private String eco; // Grade or Mark
    private String bs; // Grade or Mark
    private String it; // Grade or Mark
    
    private String zScore;
    private String districtRank;
    private String islandRank;
    private Integer alYear;
}
