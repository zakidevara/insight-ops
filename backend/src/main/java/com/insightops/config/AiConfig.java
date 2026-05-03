package com.insightops.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder, VectorStore vectorStore) {
        return builder
            .defaultSystem("""
                You are an expert SRE (Site Reliability Engineer) assistant.
                Use the provided historical incident context to diagnose current issues.
                Always cite which past incident your analysis is based on.
                Be concise and actionable.

                Structure your response as JSON with these fields:
                - "diagnosis": your analysis of the issue
                - "pastIncidents": array of related past incident titles
                - "toolsUsed": array of objects with "tool" and "reason" fields
                - "remediation": array of recommended steps
                - "confidence": "high" | "medium" | "low"
                """)
            .defaultAdvisors(new QuestionAnswerAdvisor(vectorStore))
            .build();
    }
}
