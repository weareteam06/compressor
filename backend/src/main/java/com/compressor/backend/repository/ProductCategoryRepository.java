package com.compressor.backend.repository;

import com.compressor.backend.model.ProductCategory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
  Optional<ProductCategory> findBySlug(String slug);
  Optional<ProductCategory> findByLegacyId(String legacyId);
  List<ProductCategory> findAllByOrderByOrderAsc();
}
