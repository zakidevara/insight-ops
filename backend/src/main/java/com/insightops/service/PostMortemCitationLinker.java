package com.insightops.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightops.model.IncidentReport;
import com.insightops.model.PostMortemCitation;
import com.insightops.model.PostMortemCitationId;
import com.insightops.repository.PostMortemCitationRepository;
import com.insightops.repository.PostMortemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Parses the "pastIncidents" array from the SreAssistant JSON response and
 * creates PostMortemCitation rows linking the incident to matching post mortems.
 *
 * Matching strategy: exact postmortemId match first (e.g. "postmortem-001"),
 * then case-insensitive title match.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PostMortemCitationLinker {

    private final PostMortemRepository postMortemRepository;
    private final PostMortemCitationRepository citationRepository;
    private final ObjectMapper objectMapper;

    public void linkCitations(IncidentReport savedReport, String analysisJson) {
        List<String> pastIncidentRefs = extractPastIncidents(analysisJson);
        if (pastIncidentRefs.isEmpty()) return;

        for (String ref : pastIncidentRefs) {
            var postMortem = postMortemRepository.findByPostmortemId(ref)
                    .or(() -> postMortemRepository.findByTitleIgnoreCase(ref))
                    .orElse(null);

            if (postMortem == null) {
                log.debug("No post mortem found for reference: '{}'", ref);
                continue;
            }

            var citationId = new PostMortemCitationId(savedReport.getId(), postMortem.getId());
            if (!citationRepository.existsById(citationId)) {
                citationRepository.save(PostMortemCitation.builder()
                        .id(citationId)
                        .incidentReport(savedReport)
                        .postMortem(postMortem)
                        .build());
                log.info("Linked postmortem '{}' to incident '{}'", postMortem.getPostmortemId(), savedReport.getId());
            }
        }
    }

    private List<String> extractPastIncidents(String analysisJson) {
        List<String> results = new ArrayList<>();
        if (analysisJson == null || analysisJson.isBlank()) return results;

        try {
            // Strip <think>…</think> tags that DeepSeek-R1 may prepend
            String cleaned = analysisJson.replaceAll("(?s)<think>.*?</think>", "").trim();
            // Extract JSON object portion if there's leading text
            int jsonStart = cleaned.indexOf('{');
            if (jsonStart > 0) cleaned = cleaned.substring(jsonStart);

            JsonNode root = objectMapper.readTree(cleaned);
            JsonNode pastIncidents = root.get("pastIncidents");
            if (pastIncidents != null && pastIncidents.isArray()) {
                for (JsonNode node : pastIncidents) {
                    results.add(node.asText());
                }
            }
        } catch (Exception e) {
            log.warn("Could not parse pastIncidents from analysis JSON: {}", e.getMessage());
        }
        return results;
    }
}
