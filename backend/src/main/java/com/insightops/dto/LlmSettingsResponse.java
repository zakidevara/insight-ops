package com.insightops.dto;

import java.util.List;

public record LlmSettingsResponse(String provider, List<String> availableProviders) {}
