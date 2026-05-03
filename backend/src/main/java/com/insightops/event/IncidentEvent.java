package com.insightops.event;

import java.time.Instant;

public record IncidentEvent(
        String incidentId,
        String service,
        String severity,
        String message,
        Instant timestamp
) {}
