package com.compressor.backend.repository;

import com.compressor.backend.model.ServiceOffering;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, Long> {
  Optional<ServiceOffering> findBySlug(String slug);
}
