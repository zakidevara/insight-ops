package com.insightops.seeder;

import com.insightops.service.PostMortemService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

/**
 * Imports post mortem markdown files from classpath:postmortems/ into the
 * post_mortems table on startup. Idempotent — skips files already imported.
 */
@Component
@Order(1)
@RequiredArgsConstructor
public class PostMortemImporter implements ApplicationRunner {

    private final PostMortemService postMortemService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        var resolver = new PathMatchingResourcePatternResolver();
        var resources = resolver.getResources("classpath:postmortems/*.md");

        for (var resource : resources) {
            String filename = resource.getFilename();
            if (filename == null) continue;

            String postmortemId = filename.replace(".md", "");
            String content = new String(resource.getInputStream().readAllBytes());
            postMortemService.parseAndSaveMarkdown(postmortemId, content);
            System.out.println("Imported postmortem: " + postmortemId);
        }
    }
}
