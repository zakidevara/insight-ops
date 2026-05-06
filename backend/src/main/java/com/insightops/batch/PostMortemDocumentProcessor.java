package com.insightops.batch;

import com.insightops.model.PostMortem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class PostMortemDocumentProcessor implements ItemProcessor<PostMortem, List<Document>> {

    // Same splitter params as IngestionService
    private final TokenTextSplitter splitter = new TokenTextSplitter(500, 50, 5, 10000, true);

    @Override
    public List<Document> process(PostMortem pm) {
        String content = buildContent(pm);
        Document doc = new Document(content);
        doc.getMetadata().put("source", pm.getPostmortemId());
        doc.getMetadata().put("type", "postmortem");

        List<Document> chunks = splitter.apply(List.of(doc));
        log.debug("[ReIndex] {} → {} chunk(s)", pm.getPostmortemId(), chunks.size());
        return chunks;
    }

    private String buildContent(PostMortem pm) {
        StringBuilder sb = new StringBuilder();
        sb.append("# Incident: ").append(pm.getTitle()).append("\n");
        if (pm.getIncidentDate() != null) sb.append("Date: ").append(pm.getIncidentDate()).append("\n");
        if (pm.getSeverity()    != null) sb.append("Severity: ").append(pm.getSeverity()).append("\n");
        if (pm.getService()     != null) sb.append("Service: ").append(pm.getService()).append("\n");
        appendSection(sb, "Summary",    pm.getSummary());
        appendSection(sb, "Root Cause", pm.getRootCause());
        appendSection(sb, "Detection",  pm.getDetection());
        appendSection(sb, "Resolution", pm.getResolution());
        appendSection(sb, "Indicators", pm.getIndicators());
        return sb.toString();
    }

    private void appendSection(StringBuilder sb, String title, String content) {
        if (content != null && !content.isBlank()) {
            sb.append("\n## ").append(title).append("\n").append(content).append("\n");
        }
    }
}
