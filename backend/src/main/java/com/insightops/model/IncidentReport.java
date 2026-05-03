package com.insightops.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "incident_reports")
public class IncidentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String alertService;
    private String alertSeverity;

    @Column(columnDefinition = "TEXT")
    private String alertMessage;

    @Column(columnDefinition = "TEXT")
    private String analysis;

    private Instant timestamp;

    @JsonIgnore
    @OneToMany(mappedBy = "incidentReport", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PostMortemCitation> postMortemCitations = new ArrayList<>();
}
