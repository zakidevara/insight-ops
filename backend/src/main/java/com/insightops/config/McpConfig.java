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

@Slf4j
@Configuration
public class McpConfig {

    @Bean
    public McpSyncClient filesystemMcpClient() {
        log.info("[MCP] Attempting to start filesystem MCP client...");
        try {
            var params = ServerParameters.builder("node")
                    .args(List.of(
                            "C:/Users/mzaki/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-filesystem/dist/index.js",
                            "C:/Users/mzaki/Documents/Codes/insightops"
                    ))
                    .build();

            // Tolerate extra fields (e.g. "title") added in newer MCP spec versions
            // that the M6 McpSchema$Tool class doesn't recognise yet.
            var mapper = new ObjectMapper()
                    .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

            var transport = new StdioClientTransport(params, mapper);
            var client = McpClient.sync(transport)
                    .requestTimeout(Duration.ofSeconds(30))
                    .build();

            client.initialize();

            var tools = client.listTools().tools();
            log.info("[MCP] Client initialized. {} tool(s): {}",
                    tools.size(),
                    tools.stream().map(t -> t.name()).toList());

            return client;
        } catch (Exception e) {
            log.error("[MCP] Client failed to start — running without filesystem tools. Cause: {}", e.getMessage(), e);
            return null;
        }
    }
}
