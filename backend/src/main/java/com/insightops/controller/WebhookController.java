package com.insightops.controller;

import com.insightops.event.IncidentEvent;
import com.insightops.kafka.IncidentProducer;
import com.insightops.model.Incident;
import com.insightops.model.IncidentReport;
import com.insightops.service.IncidentReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
public class WebhookController {

    private final IncidentReportService reportService;
    private final IncidentProducer incidentProducer;

    @PostMapping
    public ResponseEntity<IncidentReport> receiveIncident(@RequestBody Incident incident) {
        if (incident.getTimestamp() == null) {
            incident.setTimestamp(Instant.now());
        }

        IncidentReport report = IncidentReport.builder()
                .service(incident.getService())
                .severity(incident.getSeverity())
                .message(incident.getMessage())
                .timestamp(incident.getTimestamp())
                .status("IN_PROGRESS")
                .build();

        report = reportService.save(report);
        reportService.broadcast(report);

        incidentProducer.send(new IncidentEvent(
                report.getId(),
                incident.getService(),
                incident.getSeverity(),
                incident.getMessage(),
                incident.getTimestamp()
        ));

        return ResponseEntity.accepted().body(report);
    }
}
