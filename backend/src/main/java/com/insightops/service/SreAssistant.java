package com.insightops.service;

import com.insightops.model.Alert;
import io.modelcontextprotocol.client.McpSyncClient;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.mcp.SyncMcpToolCallbackProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SreAssistant {

    private final ChatClient chatClient;

    // Injected only when MCP is enabled (spring.ai.mcp.client.enabled=true).
    // Falls back to an empty list so Phase 1 works without Node.js.
    @Autowired(required = false)
    private List<McpSyncClient> mcpClients;

    public String analyzeIncident(Alert alert) {
        var clients = (mcpClients != null) ? mcpClients : List.<McpSyncClient>of();

        String systemPrompt = """
            You are an SRE assistant. For this alert:
            Service: %s
            Severity: %s

            1. Search for similar past incidents using your context.
            2. Use available tools to check live system state.
            3. Synthesize a diagnosis with recommended remediation steps.
            4. List which tools you invoked and why.

            Structure your response as JSON with these fields:
            - "diagnosis": your analysis of the issue
            - "pastIncidents": array of related past incident titles
            - "toolsUsed": array of objects with "tool" and "reason" fields
            - "remediation": array of recommended steps
            - "confidence": "high" | "medium" | "low"
            """.formatted(alert.getService(), alert.getSeverity());

        var req = chatClient.prompt()
            .system(systemPrompt)
            .user(alert.getMessage());

        if (!clients.isEmpty()) {
            // SyncMcpToolCallbackProvider.syncToolCallbacks() is the correct M6 static API
            var toolCallbacks = SyncMcpToolCallbackProvider.syncToolCallbacks(clients);
            if (!toolCallbacks.isEmpty()) {
                req = req.tools(new SyncMcpToolCallbackProvider(clients).getToolCallbacks());
            }
        }

        return req.call().content();
    }
}
