package com.compressor.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "image_assets")
public class ImageAsset extends BaseEntity {
  @Column(nullable = false, length = 1000, unique = true)
  public String url;
  public String altText;
  public String usageType;
  public String ownerType;
  public Long ownerId;
}
