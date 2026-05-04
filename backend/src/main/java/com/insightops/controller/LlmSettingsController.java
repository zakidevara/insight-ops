package com.insightops.controller;

import com.insightops.dto.LlmSettingsRequest;
import com.insightops.dto.LlmSettingsResponse;
import com.insightops.model.LlmProvider;
import com.insightops.service.LlmProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/settings/llm")
@RequiredArgsConstructor
public class LlmSettingsController {

    private final LlmProviderService llmProviderService;

    private static final List<String> AVAILABLE = Arrays.stream(LlmProvider.values())
            .map(Enum::name)
            .toList();

    @GetMapping
    public LlmSettingsResponse getSettings() {
        return new LlmSettingsResponse(llmProviderService.getProvider().name(), AVAILABLE);
    }

    @PostMapping
    public ResponseEntity<LlmSettingsResponse> updateSettings(@RequestBody LlmSettingsRequest request) {
        try {
            LlmProvider provider = LlmProvider.valueOf(request.provider().toUpperCase());
            llmProviderService.setProvider(provider);
            return ResponseEntity.ok(new LlmSettingsResponse(provider.name(), AVAILABLE));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.unprocessableEntity().build();
        }
    }
}
