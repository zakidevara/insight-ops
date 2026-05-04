package com.insightops.service;

import com.insightops.dto.ChatMessage;
import com.insightops.dto.ChatRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final Pattern METRICS_PATTERN = Pattern.compile(
            "(?i)metric|cpu|memory|heap|latency|error.?rate|thread|uptime|service.?status|incident.?count|current|live|now|today"
    );

    private final LlmProviderService llmProviderService;
    private final MetricsTool metricsTool;

    public String chat(ChatRequest request) {
        List<Message> messages = new ArrayList<>(buildHistory(request.getHistory()));
        messages.add(new UserMessage(buildUserMessage(request.getMessage())));

        String raw = llmProviderService.conversationalChatClient().prompt()
                .messages(messages)
                .call()
                .content();

        // Strip <think>…</think> reasoning tags emitted by DeepSeek-R1 (no-op on Gemini)
        return raw == null ? "" : raw.replaceAll("(?s)<think>.*?</think>", "").trim();
    }

    private String buildUserMessage(String message) {
        if (!METRICS_PATTERN.matcher(message).find()) {
            return message;
        }
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
