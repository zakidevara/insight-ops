package com.insightops.service;

import com.insightops.model.Incident;
import io.modelcontextprotocol.client.McpSyncClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.mcp.SyncMcpToolCallbackProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SreAssistant {

    private final LlmProviderService llmProviderService;

    @Autowired(required = false)
    private McpSyncClient filesystemMcpClient;

    private List<McpSyncClient> mcpClients() {
        return filesystemMcpClient != null ? List.of(filesystemMcpClient) : List.of();
    }

    public String analyzeIncident(Incident incident) {
        var clients = mcpClients();
        boolean hasMcp = !clients.isEmpty();

        log.info("[MCP] analyzeIncident — hasMcp={}, clients={}", hasMcp, clients.size());

        String toolInstructions = hasMcp ? """

            You have access to filesystem tools. Use them to gather evidence:
            - List the project directory to understand the service layout
            - Read relevant config files (application.yml, docker-compose.yml)
            - Read recent log files if available
            - Read source code for the %s service if helpful
            Use these tools before forming your diagnosis.
            """.formatted(incident.getService()) : "";

        String toolsUsedField = hasMcp ? """
            - "toolsUsed": array of objects with "tool" (the exact command run) and "output" (brief summary of result)
            """ : "";

        String systemPrompt = ("""
            You are an SRE assistant. For this incident:
            Service: %s
            Severity: %s
            %s
            Use the provided postmortem context to find similar past incidents.
            Synthesize a diagnosis with recommended remediation steps.

            Respond with JSON only — no markdown, no code fences. Fields:
            - "diagnosis": your analysis of the issue
            - "pastIncidents": array of related past incident titles (e.g. "postmortem-001")
            - "remediation": array of recommended steps
            - "confidence": "high" | "medium" | "low"
            %s
            """).formatted(incident.getService(), incident.getSeverity(), toolInstructions, toolsUsedField);

        var req = llmProviderService.incidentChatClient().prompt()
                .system(systemPrompt)
                .user(incident.getMessage());

        if (hasMcp) {
            var toolCallbacks = SyncMcpToolCallbackProvider.syncToolCallbacks(clients);
            log.info("[MCP] Tool callbacks: {}", toolCallbacks.stream()
                    .map(c -> c.getToolDefinition().name()).toList());
            if (!toolCallbacks.isEmpty()) {
                req = req.tools(new SyncMcpToolCallbackProvider(clients).getToolCallbacks());
            }
        }

        String result = req.call().content();
        log.info("[MCP] LLM response received ({} chars)", result != null ? result.length() : 0);
        return result;
    }
}
