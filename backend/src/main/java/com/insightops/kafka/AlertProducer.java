package com.insightops.kafka;

import com.insightops.event.AlertEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertProducer {

    public static final String TOPIC = "insightops.alerts";

    private final KafkaTemplate<String, AlertEvent> kafkaTemplate;

    public void send(AlertEvent event) {
        kafkaTemplate.send(TOPIC, event.incidentId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish AlertEvent for incident {}: {}", event.incidentId(), ex.getMessage());
                    } else {
                        log.debug("Published AlertEvent for incident {}", event.incidentId());
                    }
                });
    }
}
