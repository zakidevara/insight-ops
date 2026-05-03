package com.insightops.service;

import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.ThreadMXBean;
import java.time.Instant;

@Service
public class MetricsTool {

    // Plain key: value format — no curly braces — because QuestionAnswerAdvisor
    // feeds user message text through StringTemplate (ST4), which treats { } as
    // template delimiters and throws STException on JSON syntax.

    public String getSystemMetrics() {
        MemoryMXBean mem = ManagementFactory.getMemoryMXBean();
        OperatingSystemMXBean os = ManagementFactory.getOperatingSystemMXBean();
        ThreadMXBean threads = ManagementFactory.getThreadMXBean();
        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();

        long heapUsed = mem.getHeapMemoryUsage().getUsed() / (1024 * 1024);
        long heapMax = mem.getHeapMemoryUsage().getMax() / (1024 * 1024);
        double cpuLoad = os.getSystemLoadAverage();
        int threadCount = threads.getThreadCount();
        long uptimeMin = uptimeMs / 60_000;

        return """
                System Metrics (as of %s):
                  heap_used_mb: %d
                  heap_max_mb: %d
                  heap_percent: %d%%
                  system_load_avg: %.2f
                  thread_count: %d
                  uptime_minutes: %d
                """.formatted(
                Instant.now(),
                heapUsed, heapMax,
                heapMax > 0 ? (heapUsed * 100 / heapMax) : 0,
                cpuLoad, threadCount, uptimeMin
        );
    }

    public String getServiceMetrics() {
        return """
                Service Metrics (as of %s):
                  payment-service:   error_rate=0.12%%  p99_latency=145ms  status=healthy
                  auth-service:      error_rate=0.03%%  p99_latency=42ms   status=healthy
                  inventory-service: error_rate=2.81%%  p99_latency=890ms  status=degraded
                  notification-svc:  error_rate=0.00%%  p99_latency=28ms   status=healthy
                """.formatted(Instant.now());
    }

    public String getIncidentMetrics() {
        return """
                Incident Metrics (as of %s):
                  active_incidents: 2
                  alerts_last_hour: 17
                  p1_count: 0
                  p2_count: 2
                  p3_count: 7
                  mttr_minutes_avg_7d: 43
                """.formatted(Instant.now());
    }
}
