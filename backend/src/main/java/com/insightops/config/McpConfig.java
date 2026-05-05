package com.insightops.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.modelcontextprotocol.client.McpClient;
import io.modelcontextprotocol.client.McpSyncClient;
import io.modelcontextprotocol.client.transport.ServerParameters;
import io.modelcontextprotocol.client.transport.StdioClientTransport;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Configuration
public class McpConfig {

    @Bean
    public McpSyncClient filesystemMcpClient() {
        log.info("[MCP] Attempting to start Prometheus MCP client...");
        try {
            var params = ServerParameters.builder("node")
                    .args(List.of(
                            "C:/Users/mzaki/Documents/Codes/insightops/mcp-prometheus/server.js"
                    ))
                    .env(Map.of("PROMETHEUS_URL", "http://localhost:9090"))
                    .build();

            // Tolerate extra fields added in newer MCP spec versions that M6 McpSchema doesn't know about.
            var mapper = new ObjectMapper()
                    .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

            var transport = new StdioClientTransport(params, mapper);
            var client = McpClient.sync(transport)
                    .requestTimeout(Duration.ofSeconds(30))
                    .build();

            client.initialize();

            var tools = client.listTools().tools();
            log.info("[MCP] Prometheus client initialized. {} tool(s): {}",
                    tools.size(),
                    tools.stream().map(t -> t.name()).toList());

            return client;
        } catch (Exception e) {
            log.error("[MCP] Prometheus client failed to start — running without live metrics. Cause: {}", e.getMessage(), e);
            return null;
        }
    }
}
