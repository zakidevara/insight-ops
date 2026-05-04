package com.insightops.service;

import com.insightops.model.Incident;
import io.modelcontextprotocol.client.McpSyncClient;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.mcp.SyncMcpToolCallbackProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SreAssistant {

    private final LlmProviderService llmProviderService;

    // Injected only when MCP is enabled (spring.ai.mcp.client.enabled=true).
    @Autowired(required = false)
    private List<McpSyncClient> mcpClients;

    public String analyzeIncident(Incident incident) {
        var clients = (mcpClients != null) ? mcpClients : List.<McpSyncClient>of();

        String systemPrompt = """
            You are an SRE assistant. For this incident:
            Service: %s
            Severity: %s

            1. Search for similar past incidents using your context.
            2. If MCP tools are available, use them to check live system state.
            3. Synthesize a diagnosis with recommended remediation steps.

            Structure your response as JSON with these fields:
            - "diagnosis": your analysis of the issue
            - "pastIncidents": array of related past incident titles
            - "remediation": array of recommended steps
            - "confidence": "high" | "medium" | "low"

            Do NOT invent or guess tool names. Only include real data from your context and any tools actually invoked.
            """.formatted(incident.getService(), incident.getSeverity());

        var req = llmProviderService.incidentChatClient().prompt()
            .system(systemPrompt)
            .user(incident.getMessage());

        if (!clients.isEmpty()) {
            var toolCallbacks = SyncMcpToolCallbackProvider.syncToolCallbacks(clients);
            if (!toolCallbacks.isEmpty()) {
                req = req.tools(new SyncMcpToolCallbackProvider(clients).getToolCallbacks());
            }
        }

        return req.call().content();
    }
}
