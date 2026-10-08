package com.compressor.backend.repository;

import com.compressor.backend.model.ImageAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ImageAssetRepository extends JpaRepository<ImageAsset, Long> {
  boolean existsByUrl(String url);
  Optional<ImageAsset> findByStorageKey(String storageKey);
}
