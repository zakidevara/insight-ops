package com.insightops.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AiConfig {

    @Primary
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

    @Bean
    @Qualifier("chatClientConversational")
    public ChatClient chatClientConversational(ChatClient.Builder builder, VectorStore vectorStore) {
        return builder
            .defaultSystem("""
                You are an expert SRE assistant for InsightOps.
                Answer questions about past incidents and postmortems using the provided context from our knowledge base.
                When asked about live metrics, use your available tools to fetch current data.
                Be conversational, clear, and concise. Do not format your response as JSON.
                When citing past incidents, mention the incident title and date if available.
                If the context does not contain relevant information, say so honestly.
                """)
            .defaultAdvisors(new QuestionAnswerAdvisor(vectorStore))
            .build();
    }
}
