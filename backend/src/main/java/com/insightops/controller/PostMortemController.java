package com.insightops.controller;

import com.insightops.dto.PostMortemDTO;
import com.insightops.service.PostMortemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostMortemController {

    private final PostMortemService postMortemService;

    @GetMapping("/postmortems")
    public List<PostMortemDTO> listPostMortems() {
        return postMortemService.findAll().stream()
                .map(postMortemService::toDTO)
                .toList();
    }

    @GetMapping("/postmortems/{id}")
    public ResponseEntity<PostMortemDTO> getPostMortem(@PathVariable String id) {
        return postMortemService.findById(id)
                .map(postMortemService::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/postmortems/ref/{postmortemId}")
    public ResponseEntity<PostMortemDTO> getPostMortemByRef(@PathVariable String postmortemId) {
        return postMortemService.findByPostmortemId(postmortemId)
                .map(postMortemService::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/incidents/{incidentId}/postmortems")
    public List<PostMortemDTO> getPostMortemsForIncident(@PathVariable String incidentId) {
        return postMortemService.getPostMortemsForIncident(incidentId)
                .stream()
                .map(postMortemService::toDTO)
                .toList();
    }
}
