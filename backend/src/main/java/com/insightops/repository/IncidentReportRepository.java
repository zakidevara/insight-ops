package com.insightops.repository;

import com.insightops.model.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, String> {
    List<IncidentReport> findTop50ByOrderByTimestampDesc();
    List<IncidentReport> findByServiceOrderByTimestampDesc(String service);
}
