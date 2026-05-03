package com.insightops.seeder;

import com.insightops.model.PostMortem;
import com.insightops.repository.PostMortemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Imports post mortem markdown files from classpath:postmortems/ into the
 * post_mortems table on startup. Idempotent — skips files already imported.
 *
 * File name is used as the postmortemId (e.g. "postmortem-001").
 */
@Component
@Order(1)
@RequiredArgsConstructor
public class PostMortemImporter implements ApplicationRunner {

    private final PostMortemRepository postMortemRepository;

    private static final Pattern HEADER_PATTERN =
            Pattern.compile("^#\\s+Incident:\\s+(.+)$", Pattern.MULTILINE);
    private static final Pattern META_PATTERN =
            Pattern.compile("Date:\\s*(\\S+)\\s*\\|\\s*Severity:\\s*(\\S+)\\s*\\|\\s*Service:\\s*(\\S+)");
    private static final Pattern SECTION_PATTERN =
            Pattern.compile("##\\s+(\\w[\\w\\s]+?)\\s*\\n([\\s\\S]*?)(?=\\n##|\\z)");

    @Override
    public void run(ApplicationArguments args) throws Exception {
        var resolver = new PathMatchingResourcePatternResolver();
        var resources = resolver.getResources("classpath:postmortems/*.md");

        for (var resource : resources) {
            String filename = resource.getFilename();
            if (filename == null) continue;

            String postmortemId = filename.replace(".md", "");

            if (postMortemRepository.existsByPostmortemId(postmortemId)) {
                System.out.println("PostMortem already imported, skipping: " + postmortemId);
                continue;
            }

            String content = new String(resource.getInputStream().readAllBytes());
            PostMortem pm = parseMarkdown(postmortemId, content);
            postMortemRepository.save(pm);
            System.out.println("Imported postmortem: " + postmortemId);
        }
    }

    private PostMortem parseMarkdown(String postmortemId, String content) {
        PostMortem.PostMortemBuilder builder = PostMortem.builder()
                .postmortemId(postmortemId);

        // Title
        Matcher titleMatcher = HEADER_PATTERN.matcher(content);
        builder.title(titleMatcher.find() ? titleMatcher.group(1).trim() : postmortemId);

        // Date, Severity, Service from second line
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

        // Sections
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
}
