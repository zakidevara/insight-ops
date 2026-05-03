package com.insightops.config;

import com.insightops.kafka.AlertProducer;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic alertsTopic() {
        return TopicBuilder.name(AlertProducer.TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }
}
