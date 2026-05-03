package com.insightops.kafka;

import com.insightops.event.IncidentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncidentProducer {

    public static final String TOPIC = "insightops.incidents";

    private final KafkaTemplate<String, IncidentEvent> kafkaTemplate;

    public void send(IncidentEvent event) {
        kafkaTemplate.send(TOPIC, event.incidentId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish IncidentEvent for incident {}: {}", event.incidentId(), ex.getMessage());
                    } else {
                        log.debug("Published IncidentEvent for incident {}", event.incidentId());
                    }
                });
    }
}
