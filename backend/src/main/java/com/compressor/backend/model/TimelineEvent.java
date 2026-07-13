package com.compressor.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "timeline_events")
@JsonIgnoreProperties(ignoreUnknown = true)
public class TimelineEvent extends BaseEntity {
  public Integer year;
  public String title;
  @Column(columnDefinition = "TEXT")
  public String description;
}
