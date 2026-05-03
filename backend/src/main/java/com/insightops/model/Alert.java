package com.insightops.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    private String service;
    private String message;
    private String severity; // P1, P2, P3, P4
    private Instant timestamp;
}
