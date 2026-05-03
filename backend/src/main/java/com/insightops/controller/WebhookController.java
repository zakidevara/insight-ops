package com.insightops.controller;

import com.insightops.event.AlertEvent;
import com.insightops.kafka.AlertProducer;
import com.insightops.model.Alert;
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
    private final AlertProducer alertProducer;

    @PostMapping
    public ResponseEntity<IncidentReport> receiveAlert(@RequestBody Alert alert) {
        if (alert.getTimestamp() == null) {
            alert.setTimestamp(Instant.now());
        }

        IncidentReport report = IncidentReport.builder()
                .alertService(alert.getService())
                .alertSeverity(alert.getSeverity())
                .alertMessage(alert.getMessage())
                .timestamp(alert.getTimestamp())
                .status("IN_PROGRESS")
                .build();

        report = reportService.save(report);
        reportService.broadcast(report);

        alertProducer.send(new AlertEvent(
                report.getId(),
                alert.getService(),
                alert.getSeverity(),
                alert.getMessage(),
                alert.getTimestamp()
        ));

        return ResponseEntity.accepted().body(report);
    }
}
