package com.insightops.controller;

import com.insightops.model.IncidentReport;
import com.insightops.repository.IncidentReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final IncidentReportRepository reportRepository;

    @GetMapping
    public List<IncidentReport> listReports(
            @RequestParam(required = false) String service) {
        if (service != null) {
            return reportRepository.findByAlertServiceOrderByTimestampDesc(service);
        }
        return reportRepository.findTop50ByOrderByTimestampDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentReport> getReport(@PathVariable String id) {
        return reportRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
