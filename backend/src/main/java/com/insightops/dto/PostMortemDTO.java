package com.insightops.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
public class PostMortemDTO {
    private String id;
    private String postmortemId;
    private String title;
    private LocalDate incidentDate;
    private String severity;
    private String service;
    private String summary;
    private String rootCause;
    private String detection;
    private String resolution;
    private String indicators;
    private Instant createdAt;
}
