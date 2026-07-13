package com.compressor.backend.repository;

import com.compressor.backend.model.ImageAsset;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageAssetRepository extends JpaRepository<ImageAsset, Long> {
  Optional<ImageAsset> findByUrl(String url);
}
