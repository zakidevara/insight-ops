package com.insightops.config;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AiConfig {

    // Mark OllamaChatModel as the primary ChatModel so Spring AI's ChatClient.Builder
    // auto-configuration resolves cleanly when multiple model starters are on the classpath.
    @Primary
    @Bean
    public ChatModel primaryChatModel(OllamaChatModel ollamaModel) {
        return ollamaModel;
    }
}
