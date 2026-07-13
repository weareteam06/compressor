package com.compressor.backend.repository;

import com.compressor.backend.model.JobOpening;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobOpeningRepository extends JpaRepository<JobOpening, Long> {
  List<JobOpening> findByStatus(String status);
}
