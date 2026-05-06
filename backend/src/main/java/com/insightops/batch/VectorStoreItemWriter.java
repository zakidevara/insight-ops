package com.insightops.batch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class VectorStoreItemWriter implements ItemWriter<List<Document>> {

    private final VectorStore vectorStore;

    @Override
    public void write(Chunk<? extends List<Document>> chunk) {
        List<Document> allDocs = chunk.getItems().stream()
                .flatMap(Collection::stream)
                .toList();

        if (allDocs.isEmpty()) return;

        vectorStore.add(allDocs);
        log.info("[ReIndex] Embedded and stored {} document chunk(s)", allDocs.size());
    }
}
