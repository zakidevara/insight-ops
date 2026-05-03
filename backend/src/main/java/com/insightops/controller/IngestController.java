package com.insightops.controller;

import com.insightops.service.IngestionService;
import com.insightops.service.PostMortemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/ingest")
@RequiredArgsConstructor
public class IngestController {

    private final IngestionService ingestionService;
    private final PostMortemService postMortemService;

    @PostMapping("/markdown")
    public ResponseEntity<Map<String, Object>> ingestMarkdown(@RequestParam("file") MultipartFile file)
            throws IOException {
        String content = new String(file.getBytes());
        int count = ingestionService.ingestMarkdown(file);
        String postmortemId = file.getOriginalFilename().replace(".md", "");
        postMortemService.parseAndSaveMarkdown(postmortemId, content);
        return ResponseEntity.ok(Map.of(
            "filename", file.getOriginalFilename(),
            "chunks", count
        ));
    }

    @PostMapping("/pdf")
    public ResponseEntity<Map<String, Object>> ingestPdf(@RequestParam("file") MultipartFile file)
            throws IOException {
        String content = new String(file.getBytes());
        int count = ingestionService.ingestPdf(file);
        String postmortemId = file.getOriginalFilename().replace(".pdf", "");
        postMortemService.parseAndSaveMarkdown(postmortemId, content);
        return ResponseEntity.ok(Map.of(
            "filename", file.getOriginalFilename(),
            "chunks", count
        ));
    }

    @PostMapping("/text")
    public ResponseEntity<Map<String, Object>> ingestText(@RequestBody Map<String, String> body) {
        String content = body.get("content");
        String source = body.getOrDefault("source", "manual");
        int count = ingestionService.ingestText(content, source);
        postMortemService.saveFromText(content, source);
        return ResponseEntity.ok(Map.of("chunks", count));
    }
}
