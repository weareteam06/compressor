package com.compressor.backend.repository;

import com.compressor.backend.model.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
  List<Product> findByCategory_Id(Long categoryId);
  Optional<Product> findByLegacyId(String legacyId);
}
