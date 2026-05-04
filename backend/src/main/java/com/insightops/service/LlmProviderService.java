package com.insightops.service;

import com.insightops.model.LlmProvider;
import jakarta.annotation.PostConstruct;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
public class LlmProviderService {

    private static final String INCIDENT_PROMPT = """
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
            """;

    private static final String CONVERSATIONAL_PROMPT = """
            You are an expert SRE assistant for InsightOps.
            Answer questions about past incidents and postmortems using the provided context from our knowledge base.
            When asked about live metrics, use your available tools to fetch current data.
            Be conversational, clear, and concise. Do not format your response as JSON.
            When citing past incidents, mention the incident title and date if available.
            If the context does not contain relevant information, say so honestly.
            """;

    @Autowired private ApplicationContext ctx;
    @Autowired private OllamaChatModel ollamaModel;
    @Autowired private VectorStore vectorStore;

    @Value("${llm.default-provider:OLLAMA}")
    private String defaultProvider;

    private volatile LlmProvider currentProvider;
    // Resolved at startup — null if no non-Ollama ChatModel is on the classpath
    private ChatModel geminiModel;

    @PostConstruct
    private void init() {
        this.currentProvider = LlmProvider.valueOf(defaultProvider.toUpperCase());
        // Finds the Google Gemini ChatModel bean if the starter is on the classpath,
        // without coupling to a specific class name that may vary across Spring AI versions.
        this.geminiModel = ctx.getBeansOfType(ChatModel.class).values().stream()
                .filter(m -> !(m instanceof OllamaChatModel))
                .findFirst()
                .orElse(null);
    }

    public ChatClient incidentChatClient() {
        return ChatClient.builder(activeModel())
                .defaultSystem(INCIDENT_PROMPT)
                .defaultAdvisors(new QuestionAnswerAdvisor(vectorStore))
                .build();
    }

    public ChatClient conversationalChatClient() {
        return ChatClient.builder(activeModel())
                .defaultSystem(CONVERSATIONAL_PROMPT)
                .defaultAdvisors(new QuestionAnswerAdvisor(vectorStore))
                .build();
    }

    public LlmProvider getProvider() {
        return currentProvider;
    }

    public void setProvider(LlmProvider provider) {
        if (provider == LlmProvider.GEMINI && geminiModel == null) {
            throw new IllegalStateException(
                    "Gemini is not configured. Add GEMINI_API_KEY to your environment and restart.");
        }
        this.currentProvider = provider;
    }

    private ChatModel activeModel() {
        return switch (currentProvider) {
            case GEMINI -> {
                if (geminiModel == null) throw new IllegalStateException(
                        "Gemini model unavailable. Set GEMINI_API_KEY and restart.");
                yield geminiModel;
            }
            case OLLAMA -> ollamaModel;
        };
    }
}
