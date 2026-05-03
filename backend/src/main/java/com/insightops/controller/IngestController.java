package com.insightops.controller;

import com.insightops.service.IngestionService;
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

    @PostMapping("/markdown")
    public ResponseEntity<Map<String, Object>> ingestMarkdown(@RequestParam("file") MultipartFile file)
            throws IOException {
        int count = ingestionService.ingestMarkdown(file);
        return ResponseEntity.ok(Map.of(
            "filename", file.getOriginalFilename(),
            "chunks", count
        ));
    }

    @PostMapping("/pdf")
    public ResponseEntity<Map<String, Object>> ingestPdf(@RequestParam("file") MultipartFile file)
            throws IOException {
        int count = ingestionService.ingestPdf(file);
        return ResponseEntity.ok(Map.of(
            "filename", file.getOriginalFilename(),
            "chunks", count
        ));
    }

    @PostMapping("/text")
    public ResponseEntity<Map<String, Object>> ingestText(@RequestBody Map<String, String> body) {
        int count = ingestionService.ingestText(
            body.get("content"),
            body.getOrDefault("source", "manual")
        );
        return ResponseEntity.ok(Map.of("chunks", count));
    }
}
