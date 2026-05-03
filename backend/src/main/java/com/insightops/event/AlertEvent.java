package com.insightops.event;

import java.time.Instant;

public record AlertEvent(
        String incidentId,
        String service,
        String severity,
        String message,
        Instant timestamp
) {}
