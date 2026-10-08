package com.compressor.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "product_categories")
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductCategory extends BaseEntity {
  @Column(nullable = false, unique = true)
  public String slug;
  public String name;
  public String shortName;
  @Column(columnDefinition = "TEXT")
  public String description;
  @Column(columnDefinition = "TEXT")
  public String longDescription;
  public String icon;
  @Column(length = 1000)
  public String imageUrl;
  public Boolean external = false;
  @Column(length = 1000)
  public String externalUrl;
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "json")
  public List<String> features = new ArrayList<>();
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "json")
  public List<String> applications = new ArrayList<>();
  @Column(name = "display_order")
  public Integer order;
}
