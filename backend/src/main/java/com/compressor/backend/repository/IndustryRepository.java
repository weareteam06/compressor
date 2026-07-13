package com.compressor.backend.repository;

import com.compressor.backend.model.Industry;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IndustryRepository extends JpaRepository<Industry, Long> {
  Optional<Industry> findBySlug(String slug);
}
