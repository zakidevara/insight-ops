package com.insightops.service;

import com.insightops.dto.PostMortemDTO;
import com.insightops.model.PostMortem;
import com.insightops.model.PostMortemCitation;
import com.insightops.model.PostMortemCitationId;
import com.insightops.repository.PostMortemCitationRepository;
import com.insightops.repository.PostMortemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostMortemService {

    private final PostMortemRepository postMortemRepository;
    private final PostMortemCitationRepository citationRepository;

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
