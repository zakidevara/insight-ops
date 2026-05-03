package com.insightops.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a RAG-sourced citation: an IncidentReport that referenced a PostMortem
 * during analysis. Named "Citation" (vs. a direct ownership relationship) to leave
 * room for a future "this incident produced this post mortem" association.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "post_mortem_citations")
public class PostMortemCitation {

    @EmbeddedId
    private PostMortemCitationId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("incidentReportId")
    @JoinColumn(name = "incident_report_id")
    private IncidentReport incidentReport;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("postMortemId")
    @JoinColumn(name = "post_mortem_id")
    private PostMortem postMortem;
}
