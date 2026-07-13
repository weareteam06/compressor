package com.compressor.backend.repository;

import com.compressor.backend.model.Distributor;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DistributorRepository extends JpaRepository<Distributor, Long> {
  List<Distributor> findByStatus(String status);
}
