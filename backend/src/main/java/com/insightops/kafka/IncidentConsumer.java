package com.insightops.kafka;

import com.insightops.event.IncidentEvent;
import com.insightops.model.Incident;
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
public class IncidentConsumer {

    private final IncidentReportRepository reportRepository;
    private final IncidentReportService reportService;
    private final SreAssistant sreAssistant;
    private final PostMortemCitationLinker citationLinker;

    @KafkaListener(topics = IncidentProducer.TOPIC, groupId = "sre-analysis")
    public void consume(IncidentEvent event) {
        log.info("Consuming IncidentEvent for incident {}", event.incidentId());

        var report = reportRepository.findById(event.incidentId()).orElse(null);
        if (report == null) {
            log.warn("IncidentReport {} not found — skipping analysis", event.incidentId());
            return;
        }

        try {
            Incident incident = new Incident();
            incident.setService(event.service());
            incident.setSeverity(event.severity());
            incident.setMessage(event.message());
            incident.setTimestamp(event.timestamp());

            String analysis = sreAssistant.analyzeIncident(incident);

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
