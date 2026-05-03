package com.insightops.kafka;

import com.insightops.event.AlertEvent;
import com.insightops.model.Alert;
import com.insightops.repository.IncidentReportRepository;
import com.insightops.service.IncidentReportService;
import com.insightops.service.PostMortemCitationLinker;
import com.insightops.service.SreAssistant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertConsumer {

    private final IncidentReportRepository reportRepository;
    private final IncidentReportService reportService;
    private final SreAssistant sreAssistant;
    private final PostMortemCitationLinker citationLinker;

    @KafkaListener(topics = AlertProducer.TOPIC, groupId = "sre-analysis")
    public void consume(AlertEvent event) {
        log.info("Consuming AlertEvent for incident {}", event.incidentId());

        var report = reportRepository.findById(event.incidentId()).orElse(null);
        if (report == null) {
            log.warn("IncidentReport {} not found — skipping analysis", event.incidentId());
            return;
        }

        try {
            Alert alert = new Alert();
            alert.setService(event.service());
            alert.setSeverity(event.severity());
            alert.setMessage(event.message());
            alert.setTimestamp(event.timestamp());

            String analysis = sreAssistant.analyzeIncident(alert);

            report.setAnalysis(analysis);
            report.setStatus("READY");
            report = reportRepository.save(report);

            citationLinker.linkCitations(report, analysis);
            reportService.broadcast(report);

            log.info("Analysis complete for incident {}", event.incidentId());
        } catch (Exception ex) {
            log.error("Analysis failed for incident {}: {}", event.incidentId(), ex.getMessage(), ex);
            report.setStatus("FAILED");
            reportRepository.save(report);
            reportService.broadcast(report);
        }
    }
}
