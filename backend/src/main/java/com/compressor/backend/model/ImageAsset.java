package com.compressor.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "image_assets")
public class ImageAsset extends BaseEntity {
  @Column(nullable = false, length = 1000)
  public String url;
  @Column(unique = true, length = 255)
  public String storageKey;
  public String fileName;
  public String contentType;
  public String mediaType;
  public Long sizeBytes;
  public String altText;
  public String usageType;
  public String ownerType;
  public Long ownerId;

  @JsonIgnore
  @Lob
  @Column(columnDefinition = "LONGBLOB")
  public byte[] data;
}
