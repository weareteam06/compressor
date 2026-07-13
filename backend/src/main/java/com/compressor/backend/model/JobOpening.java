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
@Table(name = "job_openings")
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobOpening extends BaseEntity {
  public String title;
  public String department;
  public String location;
  public String type;
  @Column(columnDefinition = "TEXT")
  public String description;
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "json")
  public List<String> requirements = new ArrayList<>();
  public String postedDate;
  public String status;
}
