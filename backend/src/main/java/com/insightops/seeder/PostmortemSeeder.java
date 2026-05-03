package com.insightops.seeder;

import com.insightops.service.IngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PostmortemSeeder implements ApplicationRunner {

    private final IngestionService ingestionService;
    private final VectorStore vectorStore;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Only seed if the vector store appears empty
        var existing = vectorStore.similaritySearch(
            SearchRequest.builder().query("memory leak order service").topK(1).build()
        );
        if (!existing.isEmpty()) {
            System.out.println("Vector store already seeded — skipping postmortem ingestion.");
            return;
        }

        // Works both in IDE mode and when running from a JAR
        var resolver = new PathMatchingResourcePatternResolver();
        var resources = resolver.getResources("classpath:postmortems/*.md");

        for (var resource : resources) {
            String content = new String(resource.getInputStream().readAllBytes());
            ingestionService.ingestText(content, resource.getFilename());
            System.out.println("Seeded postmortem: " + resource.getFilename());
        }
    }
}
