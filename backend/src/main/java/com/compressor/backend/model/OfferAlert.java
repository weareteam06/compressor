package com.compressor.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "offer_alerts")
@JsonIgnoreProperties(ignoreUnknown = true)
public class OfferAlert extends BaseEntity {
  @Column(nullable = false, length = 200)
  public String title;

  @Column(nullable = false, length = 500)
  public String message;

  @Column(columnDefinition = "TEXT")
  public String content;

  @Column(length = 1000)
  public String imageUrl;

  @Column(nullable = false)
  public Instant startsAt;

  @Column(nullable = false)
  public Instant endsAt;
}
