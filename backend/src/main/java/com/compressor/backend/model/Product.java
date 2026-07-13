package com.compressor.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "products")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Product extends BaseEntity {
  @JsonIgnore
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id")
  public ProductCategory category;
  @Column(name = "category_id", insertable = false, updatable = false)
  public Long categoryId;
  public String model;
  public String name;
  public String series;
  @Column(columnDefinition = "TEXT")
  public String description;
  @Column(columnDefinition = "TEXT")
  public String longDescription;
  @Column(length = 1000)
  public String imageUrl;
  public Double powerHp;
  public Double powerKw;
  public Integer pressureMin;
  public Integer pressureMax;
  public String flowRateCfm;
  public String flowRateM3Min;
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "json")
  public List<String> features = new ArrayList<>();
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "json")
  public List<Map<String, String>> specifications = new ArrayList<>();
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "json")
  public List<String> applications = new ArrayList<>();
  @Column(length = 1000)
  public String brochureUrl;

}
