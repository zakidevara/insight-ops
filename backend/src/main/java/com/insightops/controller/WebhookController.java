package com.insightops.controller;

import com.insightops.model.Alert;
import com.insightops.model.IncidentReport;
import com.insightops.repository.IncidentReportRepository;
import com.insightops.service.SreAssistant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
public class WebhookController {

    private final SreAssistant sreAssistant;
    private final IncidentReportRepository reportRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<IncidentReport> receiveAlert(@RequestBody Alert alert) {
        if (alert.getTimestamp() == null) {
            alert.setTimestamp(Instant.now());
        }

        String analysis = sreAssistant.analyzeIncident(alert);

        IncidentReport report = IncidentReport.builder()
            .alertService(alert.getService())
            .alertSeverity(alert.getSeverity())
            .alertMessage(alert.getMessage())
            .analysis(analysis)
            .timestamp(alert.getTimestamp())
            .build();

        report = reportRepository.save(report);

        // Push to WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/reports", report);

        return ResponseEntity.ok(report);
    }
}
