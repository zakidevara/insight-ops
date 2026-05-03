package com.insightops.service;

import com.insightops.model.IncidentReport;
import com.insightops.repository.IncidentReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Thin service wrapper around the incident report repository.
 * Handles persistence and WebSocket broadcasting.
 */
@Service
@RequiredArgsConstructor
public class IncidentReportService {

    private final IncidentReportRepository repository;
    private final SimpMessagingTemplate messagingTemplate;

    public IncidentReport save(IncidentReport report) {
        return repository.save(report);
    }

    public void broadcast(IncidentReport report) {
        messagingTemplate.convertAndSend("/topic/reports", report);
    }

    public List<IncidentReport> findRecent() {
        return repository.findTop50ByOrderByTimestampDesc();
    }

    public List<IncidentReport> findByService(String service) {
        return repository.findByAlertServiceOrderByTimestampDesc(service);
    }
}
