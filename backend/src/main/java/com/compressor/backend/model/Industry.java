package com.compressor.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "industries")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Industry extends BaseEntity {
  @Column(nullable = false, unique = true)
  public String slug;
  public String name;
  @Column(columnDefinition = "TEXT")
  public String shortDescription;
  @Column(columnDefinition = "TEXT")
  public String fullDescription;
  @Column(length = 1000)
  public String imageUrl;
  public String imageAlt;
  @Column(columnDefinition = "TEXT")
  public String challengeIntro;
  @Column(columnDefinition = "TEXT")
  public String solutionIntro;
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "json")
  public List<String> applications = new ArrayList<>();
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "json")
  public List<String> benefits = new ArrayList<>();
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "json")
  public List<String> recommendedProducts = new ArrayList<>();
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "json")
  public List<Map<String, String>> challenges = new ArrayList<>();
  @Column(name = "display_order")
  public Integer order;
}
