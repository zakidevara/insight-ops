package com.insightops.repository;

import com.insightops.model.PostMortem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostMortemRepository extends JpaRepository<PostMortem, String> {
    Optional<PostMortem> findByPostmortemId(String postmortemId);
    Optional<PostMortem> findByTitleIgnoreCase(String title);
    List<PostMortem> findByTitleContainingIgnoreCase(String title);
    boolean existsByPostmortemId(String postmortemId);
}
