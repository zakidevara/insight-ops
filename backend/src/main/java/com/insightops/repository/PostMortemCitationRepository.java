package com.insightops.repository;

import com.insightops.model.PostMortemCitation;
import com.insightops.model.PostMortemCitationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostMortemCitationRepository extends JpaRepository<PostMortemCitation, PostMortemCitationId> {
    List<PostMortemCitation> findByIdIncidentReportId(String incidentReportId);
}
