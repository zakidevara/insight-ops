package com.insightops.service;

import com.insightops.dto.ChatMessage;
import com.insightops.dto.ChatRequest;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class ChatService {

    // deepseek-r1:8b does not support the Ollama tools API, so metrics are
    // injected as plain-text context whenever the user asks about live data.
    private static final Pattern METRICS_PATTERN = Pattern.compile(
            "(?i)metric|cpu|memory|heap|latency|error.?rate|thread|uptime|service.?status|incident.?count|current|live|now|today",
            Pattern.CASE_INSENSITIVE
    );

    private final ChatClient chatClient;
    private final MetricsTool metricsTool;

    public ChatService(
            @Qualifier("chatClientConversational") ChatClient chatClient,
            MetricsTool metricsTool) {
        this.chatClient = chatClient;
        this.metricsTool = metricsTool;
    }

    public String chat(ChatRequest request) {
        List<Message> history = buildHistory(request.getHistory());

        // Build the full message list including the current user turn.
        // UserMessage is added directly to avoid Spring AI's StringTemplate
        // processing on .user(String), which chokes on JSON curly braces.
        List<Message> messages = new ArrayList<>(history);
        messages.add(new UserMessage(buildUserMessage(request.getMessage())));

        String raw = chatClient.prompt()
                .messages(messages)
                .call()
                .content();

        // Strip <think>…</think> reasoning tags emitted by DeepSeek-R1
        return raw == null ? "" : raw.replaceAll("(?s)<think>.*?</think>", "").trim();
    }

    private String buildUserMessage(String message) {
        if (!METRICS_PATTERN.matcher(message).find()) {
            return message;
        }
        // Inject live metrics as context so the model can reference them
        return """
                [Live System Context]
                %s
                %s
                %s
                ---
                User question: %s
                """.formatted(
                metricsTool.getSystemMetrics(),
                metricsTool.getServiceMetrics(),
                metricsTool.getIncidentMetrics(),
                message
        );
    }

    private List<Message> buildHistory(List<ChatMessage> history) {
        if (history == null || history.isEmpty()) return List.of();
        // Cap at 10 turns to stay within deepseek-r1:8b context limits
        int start = Math.max(0, history.size() - 10);
        List<Message> messages = new ArrayList<>();
        for (ChatMessage msg : history.subList(start, history.size())) {
            if ("user".equals(msg.getRole())) {
                messages.add(new UserMessage(msg.getContent()));
            } else if ("assistant".equals(msg.getRole())) {
                messages.add(new AssistantMessage(msg.getContent()));
            }
        }
        return messages;
    }
}
