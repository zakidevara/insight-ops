package com.insightops.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.markdown.MarkdownDocumentReader;
import org.springframework.ai.reader.markdown.config.MarkdownDocumentReaderConfig;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class IngestionService {

    private final VectorStore vectorStore;
    private final TokenTextSplitter splitter = new TokenTextSplitter(500, 50, 5, 10000, true);

    public int ingestMarkdown(MultipartFile file) throws IOException {
        var reader = new MarkdownDocumentReader(
            new ByteArrayResource(file.getBytes()),
            MarkdownDocumentReaderConfig.defaultConfig()
        );
        var docs = splitter.apply(reader.get());
        vectorStore.add(docs);
        return docs.size();
    }

    public int ingestPdf(MultipartFile file) throws IOException {
        var reader = new PagePdfDocumentReader(
            new ByteArrayResource(file.getBytes()),
            PdfDocumentReaderConfig.defaultConfig()
        );
        var docs = splitter.apply(reader.get());
        vectorStore.add(docs);
        return docs.size();
    }

    public int ingestText(String content, String sourceLabel) {
        var doc = new Document(content, Map.of("source", sourceLabel, "type", "manual"));
        var docs = splitter.apply(List.of(doc));
        vectorStore.add(docs);
        return docs.size();
    }
}
