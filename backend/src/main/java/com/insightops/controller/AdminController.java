package com.insightops.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final JobLauncher jobLauncher;
    private final Job reIndexPostmortemsJob;

    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> triggerReIndex() {
        try {
            JobParameters params = new JobParametersBuilder()
                    .addLong("timestamp", System.currentTimeMillis())
                    .toJobParameters();

            var execution = jobLauncher.run(reIndexPostmortemsJob, params);
            log.info("[ReIndex] Job launched — id={} status={}", execution.getJobId(), execution.getStatus());

            return ResponseEntity.accepted().body(Map.of(
                    "jobId",   execution.getJobId(),
                    "status",  execution.getStatus().name(),
                    "message", "Re-indexing job started. All post-mortems will be re-embedded."
            ));
        } catch (Exception e) {
            log.error("[ReIndex] Failed to launch job: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }
}
