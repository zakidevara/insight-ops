package com.insightops.service;

import com.insightops.dto.PostMortemDTO;
import com.insightops.model.PostMortem;
import com.insightops.model.PostMortemCitation;
import com.insightops.repository.PostMortemCitationRepository;
import com.insightops.repository.PostMortemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostMortemService {

    private final PostMortemRepository postMortemRepository;
    private final PostMortemCitationRepository citationRepository;

    private static final Pattern HEADER_PATTERN =
            Pattern.compile("^#\\s+Incident:\\s+(.+)$", Pattern.MULTILINE);
    private static final Pattern META_PATTERN =
            Pattern.compile("Date:\\s*(\\S+)\\s*\\|\\s*Severity:\\s*(\\S+)\\s*\\|\\s*Service:\\s*(\\S+)");
    private static final Pattern SECTION_PATTERN =
            Pattern.compile("##\\s+(\\w[\\w\\s]+?)\\s*\\n([\\s\\S]*?)(?=\\n##|\\z)");

    public List<PostMortem> findAll() {
        return postMortemRepository.findAll();
    }

    public Optional<PostMortem> findById(String id) {
        return postMortemRepository.findById(id);
    }

    public Optional<PostMortem> findByPostmortemId(String postmortemId) {
        return postMortemRepository.findByPostmortemId(postmortemId);
    }

    public List<PostMortem> getPostMortemsForIncident(String incidentReportId) {
        return citationRepository.findByIdIncidentReportId(incidentReportId)
                .stream()
                .map(PostMortemCitation::getPostMortem)
                .toList();
    }

    public PostMortem save(PostMortem postMortem) {
        return postMortemRepository.save(postMortem);
    }

    /**
     * Parses markdown content into a PostMortem entity and saves it.
     * If postmortemId already exists, the existing record is returned unchanged.
     */
    public PostMortem parseAndSaveMarkdown(String postmortemId, String content) {
        Optional<PostMortem> existing = postMortemRepository.findByPostmortemId(postmortemId);
        if (existing.isPresent()) {
            log.info("PostMortem already exists, skipping: {}", postmortemId);
            return existing.get();
        }

        PostMortem pm = parseMarkdown(postmortemId, content);
        return postMortemRepository.save(pm);
    }

    /**
     * Stores raw text content as a post mortem with a generated ID.
     */
    public PostMortem saveFromText(String content, String sourceLabel) {
        String postmortemId = "text-" + UUID.randomUUID().toString().substring(0, 8);
        return parseAndSaveMarkdown(postmortemId, content);
    }

    public PostMortem parseMarkdown(String postmortemId, String content) {
        PostMortem.PostMortemBuilder builder = PostMortem.builder()
                .postmortemId(postmortemId);

        Matcher titleMatcher = HEADER_PATTERN.matcher(content);
        builder.title(titleMatcher.find() ? titleMatcher.group(1).trim() : postmortemId);

        Matcher metaMatcher = META_PATTERN.matcher(content);
        if (metaMatcher.find()) {
            try {
                builder.incidentDate(LocalDate.parse(metaMatcher.group(1)));
            } catch (DateTimeParseException e) {
                // leave null if unparseable
            }
            builder.severity(metaMatcher.group(2));
            builder.service(metaMatcher.group(3));
        }

        Matcher sectionMatcher = SECTION_PATTERN.matcher(content);
        while (sectionMatcher.find()) {
            String sectionName = sectionMatcher.group(1).trim().toLowerCase();
            String sectionBody = sectionMatcher.group(2).trim();
            switch (sectionName) {
                case "summary"    -> builder.summary(sectionBody);
                case "root cause" -> builder.rootCause(sectionBody);
                case "detection"  -> builder.detection(sectionBody);
                case "resolution" -> builder.resolution(sectionBody);
                case "indicators" -> builder.indicators(sectionBody);
            }
        }

        return builder.build();
    }

    public PostMortemDTO toDTO(PostMortem pm) {
        PostMortemDTO dto = new PostMortemDTO();
        dto.setId(pm.getId());
        dto.setPostmortemId(pm.getPostmortemId());
        dto.setTitle(pm.getTitle());
        dto.setIncidentDate(pm.getIncidentDate());
        dto.setSeverity(pm.getSeverity());
        dto.setService(pm.getService());
        dto.setSummary(pm.getSummary());
        dto.setRootCause(pm.getRootCause());
        dto.setDetection(pm.getDetection());
        dto.setResolution(pm.getResolution());
        dto.setIndicators(pm.getIndicators());
        dto.setCreatedAt(pm.getCreatedAt());
        return dto;
    }
}
