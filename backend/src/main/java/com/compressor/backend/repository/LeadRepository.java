package com.compressor.backend.repository;

import com.compressor.backend.model.Lead;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeadRepository extends JpaRepository<Lead, Long> {
  List<Lead> findByAssignedUserId(Long assignedUserId);
  List<Lead> findByAssignedDistributorId(Long assignedDistributorId);
  long countByStatus(String status);
  long countByAssignedUserIdAndStatus(Long assignedUserId, String status);
  long countByAssignedDistributorIdAndStatus(Long assignedDistributorId, String status);
}
